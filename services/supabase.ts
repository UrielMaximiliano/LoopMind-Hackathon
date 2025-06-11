import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
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

// User profile operations
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const createUserProfile = async (profile: any) => {
  const { data, error } = await supabase
    .from('users')
    .insert([profile])
    .select()
    .single();
  return { data, error };
};

// User preferences operations
export const getUserPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const updateUserPreferences = async (userId: string, preferences: any) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, ...preferences })
    .select()
    .single();
  return { data, error };
};

// Database operations
export const saveEmotionEntry = async (entry: Omit<any, 'id' | 'created_at'>) => {
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

export const getEmotionStatsAggregated = async (userId: string, days: number = 7) => {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);
  
  const { data, error } = await supabase
    .from('emotion_stats')
    .select('*')
    .eq('user_id', userId)
    .gte('date', dateFrom.toISOString().split('T')[0])
    .order('date', { ascending: false });
  
  return { data, error };
};

export const getUserStreak = async (userId: string) => {
  const { data, error } = await supabase
    .rpc('calculate_user_streak', { user_uuid: userId });
  
  return { data, error };
};

// Coaching sessions operations
export const createCoachingSession = async (session: any) => {
  const { data, error } = await supabase
    .from('coaching_sessions')
    .insert([session])
    .select()
    .single();
  return { data, error };
};

export const getCoachingSessions = async (userId: string, limit?: number) => {
  let query = supabase
    .from('coaching_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const updateCoachingSession = async (sessionId: string, updates: any) => {
  const { data, error } = await supabase
    .from('coaching_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();
  return { data, error };
};