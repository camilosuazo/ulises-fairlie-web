-- ============================================
-- SCHEMA PARA ULISES FAIRLIE - CLASES DE INGLÉS
-- Ejecutar este SQL en Supabase SQL Editor
-- ============================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  free_class_used BOOLEAN DEFAULT FALSE,
  classes_remaining INTEGER DEFAULT 1,
  current_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de planes
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'CLP',
  classes_per_month INTEGER NOT NULL,
  features JSONB,
  popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de suscripciones
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES public.plans(id),
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clases agendadas
CREATE TABLE public.scheduled_classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  meet_link TEXT,
  status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de disponibilidad semanal del profesor
CREATE TABLE public.availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL, -- 0=Domingo, 1=Lunes, etc.
  time_slot TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  UNIQUE(day_of_week, time_slot)
);

-- Tabla de fechas bloqueadas
CREATE TABLE public.blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  plan_id TEXT REFERENCES public.plans(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'CLP',
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  payment_method TEXT,
  external_id TEXT, -- ID de MercadoPago
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Policies para plans (todos pueden ver)
CREATE POLICY "Anyone can view plans" ON public.plans
  FOR SELECT USING (TRUE);

-- Policies para subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Policies para scheduled_classes
CREATE POLICY "Users can view own classes" ON public.scheduled_classes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own classes" ON public.scheduled_classes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own classes" ON public.scheduled_classes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all classes" ON public.scheduled_classes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admin can update all classes" ON public.scheduled_classes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Policies para availability (todos pueden ver, solo admin modifica)
CREATE POLICY "Anyone can view availability" ON public.availability
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin can manage availability" ON public.availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Policies para blocked_dates
CREATE POLICY "Anyone can view blocked dates" ON public.blocked_dates
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin can manage blocked dates" ON public.blocked_dates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Policies para payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, classes_remaining)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    1 -- Una clase gratis
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil al registrarse
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.scheduled_classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar planes
INSERT INTO public.plans (id, name, description, price, currency, classes_per_month, features, popular) VALUES
('starter', 'Starter', 'Ideal para comenzar tu viaje en el inglés', 45000, 'CLP', 4,
  '["4 clases de 60 minutos al mes", "Conversación básica", "Vocabulario cotidiano", "Material de apoyo digital", "Seguimiento de progreso"]'::jsonb, FALSE),
('progress', 'Progress', 'Para quienes buscan avanzar más rápido', 80000, 'CLP', 8,
  '["8 clases de 60 minutos al mes", "Gramática + conversación", "Preparación para entrevistas", "Corrección de pronunciación", "Material personalizado", "Soporte por WhatsApp"]'::jsonb, TRUE),
('intensive', 'Intensive', 'Inmersión total para resultados rápidos', 110000, 'CLP', 12,
  '["12 clases de 60 minutos al mes", "Inmersión total", "Business English", "Preparación certificaciones", "Clases de emergencia", "Soporte prioritario 24/7", "Recursos premium ilimitados"]'::jsonb, FALSE);

-- Insertar disponibilidad inicial (Lunes a Viernes 9-18, Sábado 10-12)
INSERT INTO public.availability (day_of_week, time_slot, is_available) VALUES
-- Lunes
(1, '09:00', TRUE), (1, '10:00', TRUE), (1, '11:00', TRUE),
(1, '14:00', TRUE), (1, '15:00', TRUE), (1, '16:00', TRUE), (1, '17:00', TRUE), (1, '18:00', TRUE),
-- Martes
(2, '09:00', TRUE), (2, '10:00', TRUE), (2, '11:00', TRUE),
(2, '14:00', TRUE), (2, '15:00', TRUE), (2, '16:00', TRUE), (2, '17:00', TRUE), (2, '18:00', TRUE),
-- Miércoles
(3, '09:00', TRUE), (3, '10:00', TRUE), (3, '11:00', TRUE),
(3, '14:00', TRUE), (3, '15:00', TRUE), (3, '16:00', TRUE), (3, '17:00', TRUE), (3, '18:00', TRUE),
-- Jueves
(4, '09:00', TRUE), (4, '10:00', TRUE), (4, '11:00', TRUE),
(4, '14:00', TRUE), (4, '15:00', TRUE), (4, '16:00', TRUE), (4, '17:00', TRUE), (4, '18:00', TRUE),
-- Viernes
(5, '09:00', TRUE), (5, '10:00', TRUE), (5, '11:00', TRUE),
(5, '14:00', TRUE), (5, '15:00', TRUE), (5, '16:00', TRUE), (5, '17:00', TRUE), (5, '18:00', TRUE),
-- Sábado
(6, '10:00', TRUE), (6, '11:00', TRUE), (6, '12:00', TRUE);
