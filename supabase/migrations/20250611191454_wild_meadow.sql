/*
  # Crear tabla de estadísticas emocionales

  1. Nueva tabla
    - `emotion_stats` para estadísticas agregadas diarias
    - Campos para conteos de emociones, total de entradas y racha de días
    
  2. Seguridad
    - Habilitar RLS en la tabla `emotion_stats`
    - Agregar políticas para CRUD por usuario
    
  3. Funciones
    - Función para calcular racha de días consecutivos
    - Trigger para actualizar estadísticas automáticamente
*/

CREATE TABLE IF NOT EXISTS emotion_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  emotion_counts jsonb NOT NULL DEFAULT '{}',
  total_entries integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  average_mood_intensity decimal(3,2) DEFAULT 5.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Habilitar RLS
ALTER TABLE emotion_stats ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can read own emotion stats"
  ON emotion_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotion stats"
  ON emotion_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emotion stats"
  ON emotion_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Función para calcular racha de días consecutivos
CREATE OR REPLACE FUNCTION calculate_user_streak(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  streak_count integer := 0;
  current_date date := CURRENT_DATE;
BEGIN
  WHILE EXISTS (
    SELECT 1 FROM emotion_entries 
    WHERE user_id = user_uuid 
    AND date = current_date - streak_count
  ) LOOP
    streak_count := streak_count + 1;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar estadísticas automáticamente
CREATE OR REPLACE FUNCTION update_emotion_stats()
RETURNS TRIGGER AS $$
DECLARE
  avg_intensity decimal(3,2);
BEGIN
  -- Calcular intensidad promedio del día
  SELECT AVG(mood_intensity) INTO avg_intensity
  FROM emotion_entries
  WHERE user_id = NEW.user_id AND date = NEW.date;

  -- Insertar o actualizar estadísticas
  INSERT INTO emotion_stats (user_id, date, emotion_counts, total_entries, average_mood_intensity)
  VALUES (
    NEW.user_id, 
    NEW.date, 
    jsonb_build_object(NEW.detected_emotion, 1), 
    1,
    COALESCE(avg_intensity, 5.0)
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    emotion_counts = emotion_stats.emotion_counts || jsonb_build_object(
      NEW.detected_emotion, 
      COALESCE((emotion_stats.emotion_counts->>NEW.detected_emotion)::integer, 0) + 1
    ),
    total_entries = emotion_stats.total_entries + 1,
    average_mood_intensity = COALESCE(avg_intensity, emotion_stats.average_mood_intensity),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas cuando se inserta una nueva entrada
CREATE TRIGGER emotion_entry_stats_trigger
  AFTER INSERT ON emotion_entries
  FOR EACH ROW EXECUTE FUNCTION update_emotion_stats();

-- Trigger para actualizar updated_at
CREATE TRIGGER update_emotion_stats_updated_at
  BEFORE UPDATE ON emotion_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS emotion_stats_user_date_idx 
  ON emotion_stats(user_id, date);

CREATE INDEX IF NOT EXISTS emotion_stats_date_idx 
  ON emotion_stats(date);