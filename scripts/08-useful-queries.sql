-- Consultas útiles para administración y debugging

-- Ver todos los usuarios con 2FA habilitado
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.is_2fa_enabled,
    p.created_at,
    p.updated_at
FROM public.profiles p
WHERE p.is_2fa_enabled = true
ORDER BY p.created_at DESC;

-- Contar usuarios por estado de 2FA
SELECT 
    is_2fa_enabled,
    COUNT(*) as total_users
FROM public.profiles
GROUP BY is_2fa_enabled;

-- Ver logs de seguridad recientes
SELECT 
    sl.event_type,
    sl.ip_address,
    sl.created_at,
    p.email
FROM public.security_logs sl
JOIN public.profiles p ON sl.user_id = p.id
ORDER BY sl.created_at DESC
LIMIT 50;

-- Limpiar secretos 2FA de usuarios que no tienen 2FA habilitado
-- (útil para limpieza de datos)
UPDATE public.profiles 
SET two_factor_secret = NULL 
WHERE is_2fa_enabled = false AND two_factor_secret IS NOT NULL;

-- Ver códigos de respaldo no utilizados por usuario
SELECT 
    bc.user_id,
    p.email,
    COUNT(*) as unused_backup_codes
FROM public.backup_codes bc
JOIN public.profiles p ON bc.user_id = p.id
WHERE bc.used = false
GROUP BY bc.user_id, p.email
ORDER BY unused_backup_codes DESC;
