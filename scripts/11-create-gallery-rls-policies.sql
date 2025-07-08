-- Habilitar RLS en la tabla gallery_images
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Política para permitir que los usuarios vean solo sus propias imágenes
CREATE POLICY "Users can view own images" ON gallery_images
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que los usuarios inserten sus propias imágenes
CREATE POLICY "Users can insert own images" ON gallery_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que los usuarios actualicen sus propias imágenes
CREATE POLICY "Users can update own images" ON gallery_images
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que los usuarios eliminen sus propias imágenes
CREATE POLICY "Users can delete own images" ON gallery_images
    FOR DELETE USING (auth.uid() = user_id);
