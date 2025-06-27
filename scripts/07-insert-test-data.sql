-- Datos de prueba (opcional - solo para desarrollo)
-- NOTA: Ejecutar solo en entorno de desarrollo, NO en producción

-- Insertar un usuario de prueba en profiles (asumiendo que ya existe en auth.users)
-- Reemplaza 'tu-user-id-aqui' con un ID real de auth.users
/*
INSERT INTO public.profiles (id, email, full_name, is_2fa_enabled)
VALUES (
    'tu-user-id-aqui'::uuid,
    'test@example.com',
    'Usuario de Prueba',
    false
) ON CONFLICT (id) DO NOTHING;
*/

-- Ejemplo de cómo verificar que todo funciona
-- SELECT * FROM public.profiles WHERE email = 'test@example.com';
