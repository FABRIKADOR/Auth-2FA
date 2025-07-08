-- Script alternativo para crear políticas de storage
-- Si el script anterior falla, usa estas instrucciones manuales

-- INSTRUCCIONES PARA CREAR POLÍTICAS MANUALMENTE EN SUPABASE UI:
-- 1. Ve a Storage > Policies en tu dashboard de Supabase
-- 2. Selecciona el bucket "container"
-- 3. Crea las siguientes 4 políticas:

-- POLÍTICA 1: INSERT (Subir archivos)
-- Nombre: Users can upload images to their own folder
-- Operación: INSERT
-- Target roles: authenticated
-- USING expression: auth.uid()::text = (storage.foldername(name))[1]

-- POLÍTICA 2: SELECT (Ver archivos)
-- Nombre: Users can view images in their own folder  
-- Operación: SELECT
-- Target roles: authenticated
-- USING expression: auth.uid()::text = (storage.foldername(name))[1]

-- POLÍTICA 3: UPDATE (Actualizar archivos)
-- Nombre: Users can update images in their own folder
-- Operación: UPDATE
-- Target roles: authenticated
-- USING expression: auth.uid()::text = (storage.foldername(name))[1]

-- POLÍTICA 4: DELETE (Eliminar archivos)
-- Nombre: Users can delete images from their own folder
-- Operación: DELETE
-- Target roles: authenticated
-- USING expression: auth.uid()::text = (storage.foldername(name))[1]

-- Verificar que las políticas se crearon correctamente
SELECT id, bucket_id, name, operation, definition
FROM storage.policies 
WHERE bucket_id = 'container'
ORDER BY operation;
