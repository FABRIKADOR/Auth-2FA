-- Corregir la estructura de la tabla gallery_images
-- Renombrar artist_name a artist para que coincida con el código

-- Verificar si la columna 'artist' ya existe
DO $$ 
BEGIN
    -- Si existe 'artist_name' pero no 'artist', renombrar
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gallery_images' 
        AND column_name = 'artist_name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gallery_images' 
        AND column_name = 'artist'
    ) THEN
        ALTER TABLE gallery_images RENAME COLUMN artist_name TO artist;
        RAISE NOTICE 'Columna artist_name renombrada a artist exitosamente';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gallery_images' 
        AND column_name = 'artist'
    ) THEN
        -- Si no existe ninguna columna artist, crearla
        ALTER TABLE gallery_images ADD COLUMN artist TEXT;
        RAISE NOTICE 'Columna artist creada exitosamente';
    ELSE
        RAISE NOTICE 'La columna artist ya existe';
    END IF;
END $$;

-- Agregar comentario a la columna
COMMENT ON COLUMN gallery_images.artist IS 'Nombre del artista de la obra';

-- Verificar la estructura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'gallery_images' 
ORDER BY ordinal_position;
