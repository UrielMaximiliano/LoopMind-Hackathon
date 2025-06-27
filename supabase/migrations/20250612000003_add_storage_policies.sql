-- Create storage bucket for audio messages if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-messages', 'audio-messages', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload audio files
CREATE POLICY "Allow authenticated users to upload audio files" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'audio-messages' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow authenticated users to view their own audio files
CREATE POLICY "Allow users to view their own audio files" ON storage.objects
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'audio-messages' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow public access to audio files (for playback)
CREATE POLICY "Allow public access to audio files" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'audio-messages');

-- Alternative simpler policy if the above doesn't work
-- DROP POLICY IF EXISTS "Allow authenticated users to upload audio files" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow users to view their own audio files" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public access to audio files" ON storage.objects;

-- CREATE POLICY "Allow all operations on audio-messages bucket" ON storage.objects
-- FOR ALL 
-- TO authenticated
-- USING (bucket_id = 'audio-messages')
-- WITH CHECK (bucket_id = 'audio-messages');

-- CREATE POLICY "Allow public read on audio-messages bucket" ON storage.objects
-- FOR SELECT 
-- TO public
-- USING (bucket_id = 'audio-messages'); 