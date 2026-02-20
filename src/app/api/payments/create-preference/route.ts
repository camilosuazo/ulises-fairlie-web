import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface CreatePreferenceBody {
  planId?: string;
}

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Mercado Pago is not configured yet." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as CreatePreferenceBody;
    const planId = body.planId?.trim();

    if (!planId) {
      return NextResponse.json({ error: "Missing planId." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const admin = createAdminClient();

    const [{ data: profile, error: profileError }, { data: plan, error: planError }] =
      await Promise.all([
        admin
          .from("profiles")
          .select("id, email, full_name")
          .eq("id", user.id)
          .single(),
        admin
          .from("plans")
          .select("id, name, price, currency, classes_per_month, active")
          .eq("id", planId)
          .single(),
      ]);

    if (profileError) {
      throw profileError;
    }

    if (planError || !plan?.active) {
      return NextResponse.json({ error: "Plan not available." }, { status: 404 });
    }

    const { data: payment, error: paymentInsertError } = await admin
      .from("payments")
      .insert({
        user_id: profile.id,
        plan_id: plan.id,
        amount: plan.price,
        currency: plan.currency,
        status: "pending",
        provider: "mercadopago",
      })
      .select("id")
      .single();

    if (paymentInsertError) {
      throw paymentInsertError;
    }

    const requestUrl = new URL(request.url);
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? requestUrl.origin;

    const preferencePayload = {
      items: [
        {
          id: plan.id,
          title: `Plan ${plan.name} - Ulises Fairlie`,
          quantity: 1,
          currency_id: plan.currency,
          unit_price: plan.price,
        },
      ],
      payer: {
        email: profile.email,
        name: profile.full_name ?? undefined,
      },
      external_reference: payment.id,
      metadata: {
        local_payment_id: payment.id,
        user_id: profile.id,
        plan_id: plan.id,
      },
      back_urls: {
        success: `${siteUrl}/dashboard?payment_status=approved`,
        pending: `${siteUrl}/dashboard?payment_status=pending`,
        failure: `${siteUrl}/dashboard?payment_status=failure`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
    };

    const mercadoPagoResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferencePayload),
    });

    if (!mercadoPagoResponse.ok) {
      const errorText = await mercadoPagoResponse.text();
      throw new Error(`Mercado Pago preference creation failed: ${errorText}`);
    }

    const preference = (await mercadoPagoResponse.json()) as {
      id: string;
      init_point?: string;
      sandbox_init_point?: string;
    };

    const checkoutUrl = preference.init_point ?? preference.sandbox_init_point;
    if (!checkoutUrl) {
      throw new Error("Mercado Pago returned no checkout URL.");
    }

    const { error: paymentUpdateError } = await admin
      .from("payments")
      .update({
        provider_preference_id: preference.id,
        external_reference: payment.id,
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      throw paymentUpdateError;
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Create preference error:", error);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
