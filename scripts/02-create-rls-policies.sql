-- Habilitar Row Level Security en la tabla profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para que los usuarios solo puedan actualizar su propio perfil
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para que los usuarios puedan insertar su propio perfil
CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para que los usuarios puedan eliminar su propio perfil
CREATE POLICY "Los usuarios pueden eliminar su propio perfil" ON public.profiles
    FOR DELETE USING (auth.uid() = id);
