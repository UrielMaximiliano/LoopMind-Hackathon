-- MIGRATION SCRIPT FOR emotion_entries TABLE
-- This script adapts the table for the Grok 3 mini integration.

-- Step 1: Rename columns to match the new schema used by Grok functions.
ALTER TABLE public.emotion_entries RENAME COLUMN input_text TO user_input;
ALTER TABLE public.emotion_entries RENAME COLUMN emotion_type TO detected_emotion;
ALTER TABLE public.emotion_entries RENAME COLUMN emotion_level TO mood_intensity;

-- Step 2: Drop the old ai_analysis column, as the new `ai_advice` is more comprehensive.
ALTER TABLE public.emotion_entries DROP COLUMN IF EXISTS ai_analysis;

-- Step 3: Add new columns required by the Grok integration.
ALTER TABLE public.emotion_entries ADD COLUMN IF NOT EXISTS input_type TEXT CHECK (input_type IN ('text', 'audio'));
ALTER TABLE public.emotion_entries ADD COLUMN IF NOT EXISTS confidence_score FLOAT;
ALTER TABLE public.emotion_entries ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.emotion_entries ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Step 4: Ensure the ai_advice column can store ample text.
ALTER TABLE public.emotion_entries ALTER COLUMN ai_advice TYPE TEXT;

-- Step 5: Add a comment to the table to document the change.
COMMENT ON TABLE public.emotion_entries IS 'Table migrated for Grok 3 mini integration on 2025-06-12. Schema includes new fields for detailed emotional analysis.'; 