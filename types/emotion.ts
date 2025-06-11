export interface EmotionEntry {
  id: string;
  user_id: string;
  date: string;
  user_input: string;
  input_type: 'text' | 'audio';
  detected_emotion: string;
  ai_advice: string;
  audio_url?: string;
  video_url?: string;
  confidence_score?: number;
  mood_intensity?: number;
  tags?: string[];
  location_context?: string;
  created_at: string;
}

export interface EmotionAnalysis {
  emotion: string;
  advice: string;
  confidence: number;
  intensity?: number;
  tags?: string[];
}

export type EmotionType = 
  | 'happiness' 
  | 'sadness' 
  | 'stress' 
  | 'anxiety' 
  | 'anger' 
  | 'calm' 
  | 'excitement'
  | 'fear'
  | 'neutral'
  | 'love'
  | 'gratitude'
  | 'hope'
  | 'frustration'
  | 'loneliness';

export interface EmotionStats {
  emotion: string;
  count: number;
  percentage: number;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  timezone?: string;
  premium_status: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  notification_enabled: boolean;
  daily_reminder_time: string;
  voice_preference: string;
  theme_preference: 'light' | 'dark' | 'auto';
  language_preference: string;
  created_at: string;
  updated_at: string;
}

export interface CoachingSession {
  id: string;
  user_id: string;
  session_type: 'daily_checkin' | 'crisis_support' | 'goal_setting' | 'meditation' | 'breathing_exercise';
  duration_minutes: number;
  topics_covered: string[];
  effectiveness_rating?: number;
  notes?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmotionStatsAggregated {
  id: string;
  user_id: string;
  date: string;
  emotion_counts: Record<string, number>;
  total_entries: number;
  streak_days: number;
  average_mood_intensity: number;
  created_at: string;
  updated_at: string;
}