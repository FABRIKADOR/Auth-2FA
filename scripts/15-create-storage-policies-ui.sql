-- INSTRUCCIONES DETALLADAS PARA CREAR POLÍTICAS DE STORAGE MANUALMENTE
-- Si los scripts SQL no funcionan, sigue estos pasos en la UI de Supabase:

-- PASO 1: Ir a Storage > Policies
-- 1. Abre tu proyecto en Supabase Dashboard
-- 2. Ve a la sección "Storage" en el menú lateral
-- 3. Haz clic en "Policies"
-- 4. Selecciona el bucket "container"

-- PASO 2: Crear política INSERT (Subir archivos)
-- 1. Haz clic en "New Policy"
-- 2. Selecciona "Custom" 
-- 3. Llena los campos:
--    - Policy name: Users can upload images to their own folder
--    - Allowed operation: INSERT
--    - Target roles: authenticated
--    - USING expression: auth.uid()::text = (storage.foldername(name))[1]
-- 4. Haz clic en "Save policy"

-- PASO 3: Crear política SELECT (Ver archivos)
-- 1. Haz clic en "New Policy"
-- 2. Selecciona "Custom"
-- 3. Llena los campos:
--    - Policy name: Users can view images in their own folder
--    - Allowed operation: SELECT
--    - Target roles: authenticated
--    - USING expression: auth.uid()::text = (storage.foldername(name))[1]
-- 4. Haz clic en "Save policy"

-- PASO 4: Crear política UPDATE (Actualizar archivos)
-- 1. Haz clic en "New Policy"
-- 2. Selecciona "Custom"
-- 3. Llena los campos:
--    - Policy name: Users can update images in their own folder
--    - Allowed operation: UPDATE
--    - Target roles: authenticated
--    - USING expression: auth.uid()::text = (storage.foldername(name))[1]
-- 4. Haz clic en "Save policy"

-- PASO 5: Crear política DELETE (Eliminar archivos)
-- 1. Haz clic en "New Policy"
-- 2. Selecciona "Custom"
-- 3. Llena los campos:
--    - Policy name: Users can delete images from their own folder
--    - Allowed operation: DELETE
--    - Target roles: authenticated
--    - USING expression: auth.uid()::text = (storage.foldername(name))[1]
-- 4. Haz clic en "Save policy"

-- VERIFICACIÓN:
-- Después de crear las políticas, deberías ver 4 políticas en el bucket "container":
-- 1. Users can upload images to their own folder (INSERT)
-- 2. Users can view images in their own folder (SELECT)
-- 3. Users can update images in their own folder (UPDATE)
-- 4. Users can delete images from their own folder (DELETE)

-- NOTA IMPORTANTE:
-- La expresión auth.uid()::text = (storage.foldername(name))[1] permite que los usuarios
-- solo accedan a archivos en carpetas que coincidan con su ID de usuario.
-- Por ejemplo, si el usuario tiene ID "123", solo puede acceder a archivos en "123/..."
