/*
  # Crear tabla de preferencias de usuario

  1. Nueva tabla
    - `user_preferences` para configuraciones personalizadas
    - Campos para notificaciones, recordatorios, preferencias de voz y tema
    
  2. Seguridad
    - Habilitar RLS en la tabla `user_preferences`
    - Agregar políticas para CRUD por usuario
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  notification_enabled boolean DEFAULT true,
  daily_reminder_time time DEFAULT '09:00:00',
  voice_preference text DEFAULT 'empathetic',
  theme_preference text DEFAULT 'light',
  language_preference text DEFAULT 'es',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can read own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();