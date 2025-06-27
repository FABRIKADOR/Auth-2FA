-- Tabla opcional para códigos de respaldo (backup codes)
CREATE TABLE IF NOT EXISTS public.backup_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    used BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.backup_codes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para backup_codes
CREATE POLICY "Los usuarios pueden ver sus propios códigos de respaldo" ON public.backup_codes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios códigos de respaldo" ON public.backup_codes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios códigos de respaldo" ON public.backup_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios códigos de respaldo" ON public.backup_codes
    FOR DELETE USING (auth.uid() = user_id);

-- Índices para backup_codes
CREATE INDEX IF NOT EXISTS backup_codes_user_id_idx ON public.backup_codes(user_id);
CREATE INDEX IF NOT EXISTS backup_codes_code_idx ON public.backup_codes(code);
CREATE INDEX IF NOT EXISTS backup_codes_used_idx ON public.backup_codes(used);

-- Comentarios
COMMENT ON TABLE public.backup_codes IS 'Códigos de respaldo para recuperación de 2FA';
COMMENT ON COLUMN public.backup_codes.code IS 'Código de respaldo de un solo uso';
COMMENT ON COLUMN public.backup_codes.used IS 'Indica si el código ya fue utilizado';
