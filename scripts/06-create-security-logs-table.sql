-- Tabla opcional para logs de seguridad
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL, -- 'login', '2fa_enabled', '2fa_disabled', '2fa_failed', etc.
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para security_logs
CREATE POLICY "Los usuarios pueden ver sus propios logs de seguridad" ON public.security_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Solo permitir inserción (no actualización ni eliminación para mantener integridad del log)
CREATE POLICY "Sistema puede insertar logs de seguridad" ON public.security_logs
    FOR INSERT WITH CHECK (true);

-- Índices para security_logs
CREATE INDEX IF NOT EXISTS security_logs_user_id_idx ON public.security_logs(user_id);
CREATE INDEX IF NOT EXISTS security_logs_event_type_idx ON public.security_logs(event_type);
CREATE INDEX IF NOT EXISTS security_logs_created_at_idx ON public.security_logs(created_at);

-- Comentarios
COMMENT ON TABLE public.security_logs IS 'Registro de eventos de seguridad del usuario';
COMMENT ON COLUMN public.security_logs.event_type IS 'Tipo de evento de seguridad';
COMMENT ON COLUMN public.security_logs.metadata IS 'Datos adicionales del evento en formato JSON';
