-- Crear la tabla profiles con los campos necesarios para 2FA
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    is_2fa_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    two_factor_secret TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.profiles IS 'Perfiles de usuario con configuración de 2FA';
COMMENT ON COLUMN public.profiles.id IS 'ID del usuario, referencia a auth.users';
COMMENT ON COLUMN public.profiles.email IS 'Email del usuario (copiado de auth.users)';
COMMENT ON COLUMN public.profiles.is_2fa_enabled IS 'Indica si el usuario tiene 2FA activado';
COMMENT ON COLUMN public.profiles.two_factor_secret IS 'Secreto TOTP para autenticación de dos factores';
