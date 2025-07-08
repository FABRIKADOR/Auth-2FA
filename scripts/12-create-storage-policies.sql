-- Crear políticas de storage para el bucket 'container'
-- Nota: Este script debe ejecutarse con privilegios de administrador

-- Política para permitir subir archivos (INSERT)
INSERT INTO storage.policies (id, bucket_id, name, definition, operation)
VALUES (
    'gallery-upload-policy',
    'container',
    'Users can upload images to their own folder',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'INSERT'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    operation = EXCLUDED.operation;

-- Política para permitir ver archivos (SELECT)
INSERT INTO storage.policies (id, bucket_id, name, definition, operation)
VALUES (
    'gallery-select-policy',
    'container',
    'Users can view images in their own folder',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'SELECT'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    operation = EXCLUDED.operation;

-- Política para permitir actualizar archivos (UPDATE)
INSERT INTO storage.policies (id, bucket_id, name, definition, operation)
VALUES (
    'gallery-update-policy',
    'container',
    'Users can update images in their own folder',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'UPDATE'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    operation = EXCLUDED.operation;

-- Política para permitir eliminar archivos (DELETE)
INSERT INTO storage.policies (id, bucket_id, name, definition, operation)
VALUES (
    'gallery-delete-policy',
    'container',
    'Users can delete images from their own folder',
    'auth.uid()::text = (storage.foldername(name))[1]',
    'DELETE'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    operation = EXCLUDED.operation;
