-- Scripts de mantenimiento y limpieza

-- Función para limpiar logs de seguridad antiguos (más de 90 días)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.security_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para desactivar 2FA de usuarios inactivos (más de 1 año sin login)
CREATE OR REPLACE FUNCTION public.disable_2fa_inactive_users()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.profiles 
    SET 
        is_2fa_enabled = false,
        two_factor_secret = NULL,
        updated_at = NOW()
    WHERE 
        is_2fa_enabled = true 
        AND id IN (
            SELECT id FROM auth.users 
            WHERE last_sign_in_at < NOW() - INTERVAL '1 year'
        );
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para generar reporte de seguridad
CREATE OR REPLACE FUNCTION public.security_report()
RETURNS TABLE (
    metric TEXT,
    value BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'total_users'::TEXT, COUNT(*)::BIGINT FROM public.profiles
    UNION ALL
    SELECT '2fa_enabled_users'::TEXT, COUNT(*)::BIGINT FROM public.profiles WHERE is_2fa_enabled = true
    UNION ALL
    SELECT 'recent_logins_24h'::TEXT, COUNT(*)::BIGINT FROM public.security_logs 
    WHERE event_type = 'login' AND created_at > NOW() - INTERVAL '24 hours'
    UNION ALL
    SELECT 'failed_2fa_24h'::TEXT, COUNT(*)::BIGINT FROM public.security_logs 
    WHERE event_type = '2fa_failed' AND created_at > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
