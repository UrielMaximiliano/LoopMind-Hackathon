import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined, // Disable email confirmation for demo
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Database operations for emotion entries
export const saveEmotionEntry = async (entry: {
  user_id: string;
  date: string;
  user_input: string;
  input_type: 'text' | 'audio';
  detected_emotion: string;
  ai_advice: string;
  confidence_score?: number;
  mood_intensity?: number;
  tags?: string[];
  audio_url?: string;
  video_url?: string;
}) => {
  const { data, error } = await supabase
    .from('emotion_entries')
    .insert([entry])
    .select();
  return { data, error };
};

export const getEmotionEntries = async (userId: string, limit?: number) => {
  let query = supabase
    .from('emotion_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const getEmotionStats = async (userId: string, days: number = 7) => {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);
  
  const { data, error } = await supabase
    .from('emotion_entries')
    .select('detected_emotion, created_at, mood_intensity')
    .eq('user_id', userId)
    .gte('created_at', dateFrom.toISOString());
  
  return { data, error };
};

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('emotion_entries')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};