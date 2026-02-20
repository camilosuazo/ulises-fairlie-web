-- ============================================
-- EXTENSION DE PAGOS PARA MERCADO PAGO
-- Ejecutar este SQL en Supabase SQL Editor
-- ============================================

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_preference_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS external_reference TEXT,
  ADD COLUMN IF NOT EXISTS status_detail TEXT,
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_payments_provider_preference_id
  ON public.payments(provider_preference_id);

CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id
  ON public.payments(provider_payment_id);

CREATE INDEX IF NOT EXISTS idx_payments_external_reference
  ON public.payments(external_reference);
