/*
  # Fix users table reference in emotion_entries

  1. Changes
    - Update foreign key reference to point to auth.users instead of users table
    - This ensures compatibility with Supabase's built-in authentication system
    
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity
*/

-- Drop existing foreign key constraint
ALTER TABLE emotion_entries DROP CONSTRAINT IF EXISTS emotion_entries_user_id_fkey;

-- Add new foreign key constraint pointing to auth.users
ALTER TABLE emotion_entries 
ADD CONSTRAINT emotion_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to use auth.uid() function
DROP POLICY IF EXISTS "Users can read own emotion entries" ON emotion_entries;
DROP POLICY IF EXISTS "Users can insert own emotion entries" ON emotion_entries;
DROP POLICY IF EXISTS "Users can update own emotion entries" ON emotion_entries;
DROP POLICY IF EXISTS "Users can delete own emotion entries" ON emotion_entries;

-- Recreate policies with correct auth.uid() reference
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