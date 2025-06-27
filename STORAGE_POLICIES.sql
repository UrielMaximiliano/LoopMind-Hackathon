-- ==============================================
-- POLÍTICAS DE STORAGE PARA AUDIO-MESSAGES
-- Ejecutar este script en el SQL Editor de Supabase
-- ==============================================

-- 1. Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-messages', 'audio-messages', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar RLS en storage.objects (si no está habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes si las hay (para evitar conflictos)
DROP POLICY IF EXISTS "Allow authenticated users to upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to audio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on audio-messages bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read on audio-messages bucket" ON storage.objects;

-- 4. Crear políticas simplificadas (OPCIÓN RECOMENDADA)
-- Permite a usuarios autenticados hacer cualquier operación en el bucket audio-messages
CREATE POLICY "Allow all operations on audio-messages bucket" ON storage.objects
FOR ALL 
TO authenticated
USING (bucket_id = 'audio-messages')
WITH CHECK (bucket_id = 'audio-messages');

-- Permite acceso público de lectura para reproducir los audios
CREATE POLICY "Allow public read on audio-messages bucket" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'audio-messages');

-- ==============================================
-- POLÍTICAS ALTERNATIVAS (SI LAS ANTERIORES NO FUNCIONAN)
-- Descomenta las siguientes líneas si necesitas políticas más específicas
-- ==============================================

/*
-- Eliminar las políticas simplificadas
DROP POLICY IF EXISTS "Allow all operations on audio-messages bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read on audio-messages bucket" ON storage.objects;

-- Política para subir archivos (solo usuarios autenticados)
CREATE POLICY "Allow authenticated upload to audio-messages" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'audio-messages');

-- Política para leer archivos (acceso público)
CREATE POLICY "Allow public read from audio-messages" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'audio-messages');

-- Política para actualizar archivos (solo el propietario)
CREATE POLICY "Allow owner update in audio-messages" ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'audio-messages' AND auth.uid()::text = owner)
WITH CHECK (bucket_id = 'audio-messages' AND auth.uid()::text = owner);

-- Política para eliminar archivos (solo el propietario)
CREATE POLICY "Allow owner delete in audio-messages" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'audio-messages' AND auth.uid()::text = owner);
*/

-- ==============================================
-- VERIFICACIÓN
-- Ejecuta esta consulta para verificar que las políticas se crearon correctamente
-- ==============================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname; 