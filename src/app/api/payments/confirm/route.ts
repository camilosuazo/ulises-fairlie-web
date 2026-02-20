import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncMercadoPagoPayment } from "@/lib/payments/mercadopago";

interface ConfirmBody {
  paymentId?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConfirmBody;
    const paymentId = body.paymentId?.trim();

    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const result = await syncMercadoPagoPayment(paymentId, user.id);

    if (!result.ok && result.reason === "forbidden") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json(
      { error: "No se pudo confirmar el pago." },
      { status: 500 }
    );
  }
}
