/*
  # Create emotion entries table

  1. New Tables
    - `emotion_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date)
      - `user_input` (text)
      - `input_type` (text - 'text' or 'audio')
      - `detected_emotion` (text)
      - `ai_advice` (text)
      - `audio_url` (text, optional)
      - `video_url` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `emotion_entries` table
    - Add policy for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS emotion_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  user_input text NOT NULL,
  input_type text NOT NULL CHECK (input_type IN ('text', 'audio')),
  detected_emotion text NOT NULL,
  ai_advice text NOT NULL,
  audio_url text,
  video_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE emotion_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own emotion entries"
  ON emotion_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotion entries"
  ON emotion_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emotion entries"
  ON emotion_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emotion entries"
  ON emotion_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS emotion_entries_user_id_idx ON emotion_entries(user_id);
CREATE INDEX IF NOT EXISTS emotion_entries_date_idx ON emotion_entries(date);
CREATE INDEX IF NOT EXISTS emotion_entries_created_at_idx ON emotion_entries(created_at);