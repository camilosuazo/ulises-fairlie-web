-- ============================================
-- FIX PARA POLÍTICAS RLS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Primero habilitamos RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ELIMINAR POLÍTICAS EXISTENTES
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own classes" ON public.scheduled_classes;
DROP POLICY IF EXISTS "Users can insert own classes" ON public.scheduled_classes;
DROP POLICY IF EXISTS "Users can update own classes" ON public.scheduled_classes;
DROP POLICY IF EXISTS "Admin can view all classes" ON public.scheduled_classes;
DROP POLICY IF EXISTS "Admin can update all classes" ON public.scheduled_classes;
DROP POLICY IF EXISTS "Anyone can view availability" ON public.availability;
DROP POLICY IF EXISTS "Admin can manage availability" ON public.availability;
DROP POLICY IF EXISTS "Anyone can view blocked dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Admin can manage blocked dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admin can view all subscriptions" ON public.subscriptions;

-- ============================================
-- PROFILES - Políticas nuevas
-- ============================================

-- Cualquier usuario autenticado puede ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Cualquier usuario autenticado puede actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admins pueden ver todos los perfiles (usando una subquery simple)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- ============================================
-- SCHEDULED_CLASSES - Políticas nuevas
-- ============================================

-- Usuarios pueden ver sus propias clases
CREATE POLICY "Users can view own classes" ON public.scheduled_classes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Usuarios pueden crear sus propias clases
CREATE POLICY "Users can insert own classes" ON public.scheduled_classes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar sus propias clases
CREATE POLICY "Users can update own classes" ON public.scheduled_classes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins pueden ver todas las clases
CREATE POLICY "Admins can view all classes" ON public.scheduled_classes
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- Admins pueden actualizar todas las clases
CREATE POLICY "Admins can update all classes" ON public.scheduled_classes
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- ============================================
-- AVAILABILITY - Políticas nuevas
-- ============================================

-- Cualquier usuario autenticado puede ver disponibilidad
CREATE POLICY "Authenticated can view availability" ON public.availability
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins pueden insertar disponibilidad
CREATE POLICY "Admins can insert availability" ON public.availability
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- Admins pueden actualizar disponibilidad
CREATE POLICY "Admins can update availability" ON public.availability
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- Admins pueden eliminar disponibilidad
CREATE POLICY "Admins can delete availability" ON public.availability
  FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- ============================================
-- BLOCKED_DATES - Políticas nuevas
-- ============================================

-- Cualquier usuario autenticado puede ver fechas bloqueadas
CREATE POLICY "Authenticated can view blocked dates" ON public.blocked_dates
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins pueden insertar fechas bloqueadas
CREATE POLICY "Admins can insert blocked dates" ON public.blocked_dates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- Admins pueden eliminar fechas bloqueadas
CREATE POLICY "Admins can delete blocked dates" ON public.blocked_dates
  FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- ============================================
-- PLANS - Políticas nuevas
-- ============================================

-- Cualquiera puede ver los planes (incluso sin login)
CREATE POLICY "Anyone can view plans" ON public.plans
  FOR SELECT
  USING (true);

-- ============================================
-- PAYMENTS - Políticas nuevas
-- ============================================

-- Usuarios pueden ver sus propios pagos
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins pueden ver todos los pagos
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- ============================================
-- SUBSCRIPTIONS - Políticas nuevas
-- ============================================

-- Usuarios pueden ver sus propias suscripciones
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins pueden ver todas las suscripciones
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );
