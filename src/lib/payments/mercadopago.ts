import { createAdminClient } from "@/lib/supabase/admin";

type SyncedStatus = "approved" | "pending" | "rejected";

interface MercadoPagoPayment {
  id: number | string;
  status: string;
  status_detail?: string;
  payment_method_id?: string;
  external_reference?: string;
  metadata?: {
    local_payment_id?: string;
  };
}

const REJECTED_STATUSES = new Set([
  "rejected",
  "cancelled",
  "charged_back",
  "refunded",
]);

function normalizeStatus(status: string): SyncedStatus {
  if (status === "approved") {
    return "approved";
  }

  if (REJECTED_STATUSES.has(status)) {
    return "rejected";
  }

  return "pending";
}

function extractLocalPaymentId(payment: MercadoPagoPayment): string | null {
  const fromExternalReference = payment.external_reference?.trim();
  if (fromExternalReference) {
    return fromExternalReference;
  }

  const fromMetadata = payment.metadata?.local_payment_id?.trim();
  if (fromMetadata) {
    return fromMetadata;
  }

  return null;
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Missing MERCADOPAGO_ACCESS_TOKEN.");
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Mercado Pago payment fetch failed: ${response.status}`);
  }

  return (await response.json()) as MercadoPagoPayment;
}

export async function syncMercadoPagoPayment(
  providerPaymentId: string,
  expectedUserId?: string
) {
  const mercadoPagoPayment = await fetchMercadoPagoPayment(providerPaymentId);
  const localPaymentId = extractLocalPaymentId(mercadoPagoPayment);

  if (!localPaymentId) {
    return { ok: false as const, reason: "missing_local_payment_id" };
  }

  const supabase = createAdminClient();
  const { data: localPayment, error: paymentError } = await supabase
    .from("payments")
    .select("id, user_id, plan_id, status, processed_at")
    .eq("id", localPaymentId)
    .maybeSingle();

  if (paymentError) {
    throw paymentError;
  }

  if (!localPayment) {
    return { ok: false as const, reason: "local_payment_not_found" };
  }

  if (expectedUserId && localPayment.user_id !== expectedUserId) {
    return { ok: false as const, reason: "forbidden" };
  }

  const status = normalizeStatus(mercadoPagoPayment.status);
  const providerPaymentIdAsString = String(mercadoPagoPayment.id);
  const commonUpdate = {
    provider: "mercadopago",
    provider_payment_id: providerPaymentIdAsString,
    payment_method: mercadoPagoPayment.payment_method_id ?? null,
    status_detail: mercadoPagoPayment.status_detail ?? null,
    external_id: providerPaymentIdAsString,
  };

  if (status !== "approved") {
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        ...commonUpdate,
        status,
      })
      .eq("id", localPayment.id);

    if (updateError) {
      throw updateError;
    }

    return { ok: true as const, status };
  }

  if (localPayment.processed_at) {
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        ...commonUpdate,
        status: "approved",
      })
      .eq("id", localPayment.id);

    if (updateError) {
      throw updateError;
    }

    return { ok: true as const, status: "approved" as const };
  }

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id, name, classes_per_month")
    .eq("id", localPayment.plan_id)
    .single();

  if (planError) {
    throw planError;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, classes_remaining")
    .eq("id", localPayment.user_id)
    .single();

  if (profileError) {
    throw profileError;
  }

  const now = new Date();
  const periodStart = now.toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      classes_remaining: profile.classes_remaining + plan.classes_per_month,
      current_plan: plan.name,
      free_class_used: true,
    })
    .eq("id", profile.id);

  if (profileUpdateError) {
    throw profileUpdateError;
  }

  const { error: subscriptionsCloseError } = await supabase
    .from("subscriptions")
    .update({ status: "expired" })
    .eq("user_id", profile.id)
    .eq("status", "active");

  if (subscriptionsCloseError) {
    throw subscriptionsCloseError;
  }

  const { error: subscriptionInsertError } = await supabase
    .from("subscriptions")
    .insert({
      user_id: profile.id,
      plan_id: plan.id,
      status: "active",
      current_period_start: periodStart,
      current_period_end: periodEnd,
    });

  if (subscriptionInsertError) {
    throw subscriptionInsertError;
  }

  const { error: paymentUpdateError } = await supabase
    .from("payments")
    .update({
      ...commonUpdate,
      status: "approved",
      processed_at: now.toISOString(),
    })
    .eq("id", localPayment.id);

  if (paymentUpdateError) {
    throw paymentUpdateError;
  }

  return { ok: true as const, status: "approved" as const };
}
