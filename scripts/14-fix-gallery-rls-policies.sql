-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own images" ON gallery_images;
DROP POLICY IF EXISTS "Users can insert own images" ON gallery_images;
DROP POLICY IF EXISTS "Users can update own images" ON gallery_images;
DROP POLICY IF EXISTS "Users can delete own images" ON gallery_images;

-- Habilitar RLS en la tabla gallery_images
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Crear políticas de RLS para la tabla gallery_images
CREATE POLICY "Users can view own images" ON gallery_images
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON gallery_images
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON gallery_images
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON gallery_images
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'gallery_images'
ORDER BY policyname;
