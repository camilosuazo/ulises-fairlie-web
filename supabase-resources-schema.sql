-- Tabla de recursos (materiales del profesor)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  level VARCHAR(50), -- Básico, Intermedio, Avanzado, Todos
  resource_type VARCHAR(50) DEFAULT 'pdf', -- pdf, audio, video, link
  url TEXT NOT NULL, -- Link de Google Drive u otro
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asignación de recursos a estudiantes
CREATE TABLE IF NOT EXISTS public.student_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, resource_id) -- Evitar duplicados
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_student_resources_student ON public.student_resources(student_id);
CREATE INDEX IF NOT EXISTS idx_student_resources_resource ON public.student_resources(resource_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);

-- Políticas RLS para resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resources" ON public.resources
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage resources" ON public.resources
  FOR ALL USING (true);

-- Políticas RLS para student_resources
ALTER TABLE public.student_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their assigned resources" ON public.student_resources
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage student resources" ON public.student_resources
  FOR ALL USING (true);
