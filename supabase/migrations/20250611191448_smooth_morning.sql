/*
  # Mejorar tabla de entradas emocionales

  1. Nuevos campos
    - `confidence_score` para nivel de confianza del análisis
    - `mood_intensity` para intensidad del estado de ánimo (1-10)
    - `tags` para etiquetas personalizadas
    - `location_context` para contexto de ubicación
    
  2. Índices adicionales
    - Optimizar consultas por emoción y fecha
    - Mejorar rendimiento de estadísticas
*/

-- Agregar nuevos campos a emotion_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'emotion_entries' AND column_name = 'confidence_score'
  ) THEN
    ALTER TABLE emotion_entries ADD COLUMN confidence_score decimal(3,2) DEFAULT 0.80;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'emotion_entries' AND column_name = 'mood_intensity'
  ) THEN
    ALTER TABLE emotion_entries ADD COLUMN mood_intensity integer CHECK (mood_intensity >= 1 AND mood_intensity <= 10) DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'emotion_entries' AND column_name = 'tags'
  ) THEN
    ALTER TABLE emotion_entries ADD COLUMN tags text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'emotion_entries' AND column_name = 'location_context'
  ) THEN
    ALTER TABLE emotion_entries ADD COLUMN location_context text;
  END IF;
END $$;

-- Crear índices adicionales para mejor rendimiento
CREATE INDEX IF NOT EXISTS emotion_entries_emotion_date_idx 
  ON emotion_entries(detected_emotion, date);

CREATE INDEX IF NOT EXISTS emotion_entries_user_emotion_idx 
  ON emotion_entries(user_id, detected_emotion);

CREATE INDEX IF NOT EXISTS emotion_entries_mood_intensity_idx 
  ON emotion_entries(mood_intensity);

CREATE INDEX IF NOT EXISTS emotion_entries_tags_idx 
  ON emotion_entries USING GIN(tags);