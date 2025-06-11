/*
  # Crear tabla de sesiones de coaching

  1. Nueva tabla
    - `coaching_sessions` para funcionalidades premium
    - Campos para tipo de sesión, duración, temas y calificación
    
  2. Seguridad
    - Habilitar RLS en la tabla `coaching_sessions`
    - Agregar políticas para CRUD por usuario
*/

CREATE TABLE IF NOT EXISTS coaching_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('daily_checkin', 'crisis_support', 'goal_setting', 'meditation', 'breathing_exercise')),
  duration_minutes integer DEFAULT 0,
  topics_covered text[] DEFAULT '{}',
  effectiveness_rating integer CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  notes text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can read own coaching sessions"
  ON coaching_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coaching sessions"
  ON coaching_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coaching sessions"
  ON coaching_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own coaching sessions"
  ON coaching_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_coaching_sessions_updated_at
  BEFORE UPDATE ON coaching_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS coaching_sessions_user_id_idx 
  ON coaching_sessions(user_id);

CREATE INDEX IF NOT EXISTS coaching_sessions_type_idx 
  ON coaching_sessions(session_type);

CREATE INDEX IF NOT EXISTS coaching_sessions_created_at_idx 
  ON coaching_sessions(created_at);