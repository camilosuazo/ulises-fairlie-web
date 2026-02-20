import { NextResponse } from "next/server";
import { syncMercadoPagoPayment } from "@/lib/payments/mercadopago";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const queryType = url.searchParams.get("type") ?? url.searchParams.get("topic");
    const queryDataId =
      url.searchParams.get("data.id") ??
      url.searchParams.get("id") ??
      url.searchParams.get("resource");

    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      // Mercado Pago may send notifications with no JSON body.
    }

    const bodyType = typeof body.type === "string" ? body.type : undefined;
    const bodyData = body.data as { id?: string | number } | undefined;
    const bodyDataId = bodyData?.id ? String(bodyData.id) : undefined;

    const type = bodyType ?? queryType;
    const paymentId = bodyDataId ?? queryDataId;

    if (type !== "payment" || !paymentId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const result = await syncMercadoPagoPayment(paymentId);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Mercado Pago webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
