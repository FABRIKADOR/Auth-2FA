-- Índices para optimizar las consultas más comunes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_2fa_enabled_idx ON public.profiles(is_2fa_enabled);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON public.profiles(updated_at);

-- Índice compuesto para consultas de 2FA
CREATE INDEX IF NOT EXISTS profiles_2fa_lookup_idx ON public.profiles(id, is_2fa_enabled, two_factor_secret);
