-- Crear tabla para almacenar metadatos de imágenes de la galería
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    artist TEXT, -- Nombre del artista (opcional)
    description TEXT, -- Descripción de la obra (opcional)
    image_url TEXT NOT NULL, -- URL pública de la imagen
    image_path TEXT NOT NULL, -- Ruta del archivo en el storage
    file_size INTEGER, -- Tamaño del archivo en bytes
    mime_type VARCHAR(100), -- Tipo MIME del archivo
    width INTEGER, -- Ancho de la imagen en píxeles
    height INTEGER, -- Alto de la imagen en píxeles
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_gallery_images_user_id ON gallery_images(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_title ON gallery_images(title);

-- Habilitar Row Level Security (RLS)
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver sus propias imágenes
CREATE POLICY "Users can view own images" ON gallery_images
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan insertar sus propias imágenes
CREATE POLICY "Users can insert own images" ON gallery_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios solo puedan actualizar sus propias imágenes
CREATE POLICY "Users can update own images" ON gallery_images
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan eliminar sus propias imágenes
CREATE POLICY "Users can delete own images" ON gallery_images
    FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at cuando se modifica un registro
CREATE TRIGGER update_gallery_images_updated_at
    BEFORE UPDATE ON gallery_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE gallery_images IS 'Tabla para almacenar metadatos de imágenes de la galería de usuarios';
COMMENT ON COLUMN gallery_images.id IS 'Identificador único de la imagen';
COMMENT ON COLUMN gallery_images.user_id IS 'ID del usuario propietario de la imagen';
COMMENT ON COLUMN gallery_images.title IS 'Título de la obra de arte';
COMMENT ON COLUMN gallery_images.artist IS 'Nombre del artista de la obra';
COMMENT ON COLUMN gallery_images.description IS 'Descripción detallada de la obra';
COMMENT ON COLUMN gallery_images.image_url IS 'URL pública para acceder a la imagen';
COMMENT ON COLUMN gallery_images.image_path IS 'Ruta del archivo en Supabase Storage';
COMMENT ON COLUMN gallery_images.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN gallery_images.mime_type IS 'Tipo MIME del archivo (image/jpeg, image/png, etc.)';
COMMENT ON COLUMN gallery_images.width IS 'Ancho de la imagen en píxeles';
COMMENT ON COLUMN gallery_images.height IS 'Alto de la imagen en píxeles';
COMMENT ON COLUMN gallery_images.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN gallery_images.updated_at IS 'Fecha y hora de última actualización';
