import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { EmotionAnalysis } from '@/types/emotion';
import { supabase } from '@/services/supabase';

const OFFLINE_EMOTIONS_KEY = 'offline_emotions';
const OFFLINE_DIARY_KEY = 'offline_diary';

interface OfflineEmotion extends EmotionAnalysis {
  timestamp: string;
  synced: boolean;
  mood?: string;
  intensity?: number;
  description?: string;
}

interface OfflineDiaryEntry {
  content: string;
  timestamp: string;
  synced: boolean;
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnline;
      const isNowOnline = state.isConnected ?? true;
      
      setIsOnline(isNowOnline);
      
      // Auto-sync when coming back online
      if (wasOffline && isNowOnline) {
        syncOfflineData();
      }
    });

    return unsubscribe;
  }, [isOnline]);

  const saveOfflineEmotion = async (emotion: OfflineEmotion) => {
    try {
      const existing = await AsyncStorage.getItem(OFFLINE_EMOTIONS_KEY);
      const emotions = existing ? JSON.parse(existing) : [];
      emotions.push({
        ...emotion,
        timestamp: new Date().toISOString(),
        synced: false,
      });
      await AsyncStorage.setItem(OFFLINE_EMOTIONS_KEY, JSON.stringify(emotions));
      console.log('Emotion saved offline');
    } catch (error) {
      console.error('Error saving offline emotion:', error);
    }
  };

  const saveOfflineDiaryEntry = async (content: string) => {
    try {
      const existing = await AsyncStorage.getItem(OFFLINE_DIARY_KEY);
      const entries = existing ? JSON.parse(existing) : [];
      entries.push({
        content,
        timestamp: new Date().toISOString(),
        synced: false,
      });
      await AsyncStorage.setItem(OFFLINE_DIARY_KEY, JSON.stringify(entries));
      console.log('Diary entry saved offline');
    } catch (error) {
      console.error('Error saving offline diary entry:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, skipping sync');
        return;
      }

      // Sync emotions
      await syncOfflineEmotions(user.id);
      
      // Sync diary entries
      await syncOfflineDiaryEntries(user.id);
      
      console.log('Offline data synced successfully');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncOfflineEmotions = async (userId: string) => {
    try {
      const offlineEmotions = await AsyncStorage.getItem(OFFLINE_EMOTIONS_KEY);
      if (!offlineEmotions) return;

      const emotions: OfflineEmotion[] = JSON.parse(offlineEmotions);
      const unsyncedEmotions = emotions.filter(e => !e.synced);

      if (unsyncedEmotions.length === 0) return;

      for (const emotion of unsyncedEmotions) {
        const { error } = await supabase.from('emotion_entries').insert({
          user_id: userId,
          date: emotion.timestamp.split('T')[0],
          user_input: emotion.description || 'Entrada offline',
          input_type: 'text',
          detected_emotion: emotion.emotion,
          ai_advice: emotion.advice,
          confidence_score: emotion.confidence,
          mood_intensity: emotion.intensity || 3,
          created_at: emotion.timestamp,
        });

        if (error) {
          console.error('Error syncing emotion:', error);
        } else {
          emotion.synced = true;
        }
      }

      // Update local storage with sync status
      await AsyncStorage.setItem(OFFLINE_EMOTIONS_KEY, JSON.stringify(emotions));
      
      // Remove synced emotions
      const stillUnsyncedEmotions = emotions.filter(e => !e.synced);
      if (stillUnsyncedEmotions.length === 0) {
        await AsyncStorage.removeItem(OFFLINE_EMOTIONS_KEY);
      } else {
        await AsyncStorage.setItem(OFFLINE_EMOTIONS_KEY, JSON.stringify(stillUnsyncedEmotions));
      }
    } catch (error) {
      console.error('Error syncing offline emotions:', error);
    }
  };

  const syncOfflineDiaryEntries = async (userId: string) => {
    try {
      const offlineDiary = await AsyncStorage.getItem(OFFLINE_DIARY_KEY);
      if (!offlineDiary) return;

      const entries: OfflineDiaryEntry[] = JSON.parse(offlineDiary);
      const unsyncedEntries = entries.filter(e => !e.synced);

      if (unsyncedEntries.length === 0) return;

      for (const entry of unsyncedEntries) {
        const { error } = await supabase.from('diary_entries').insert({
          user_id: userId,
          content: entry.content,
          created_at: entry.timestamp,
        });

        if (error) {
          console.error('Error syncing diary entry:', error);
        } else {
          entry.synced = true;
        }
      }

      // Update local storage with sync status
      await AsyncStorage.setItem(OFFLINE_DIARY_KEY, JSON.stringify(entries));
      
      // Remove synced entries
      const stillUnsyncedEntries = entries.filter(e => !e.synced);
      if (stillUnsyncedEntries.length === 0) {
        await AsyncStorage.removeItem(OFFLINE_DIARY_KEY);
      } else {
        await AsyncStorage.setItem(OFFLINE_DIARY_KEY, JSON.stringify(stillUnsyncedEntries));
      }
    } catch (error) {
      console.error('Error syncing offline diary entries:', error);
    }
  };

  const getOfflineDataCount = async () => {
    try {
      const emotions = await AsyncStorage.getItem(OFFLINE_EMOTIONS_KEY);
      const diary = await AsyncStorage.getItem(OFFLINE_DIARY_KEY);
      
      const emotionCount = emotions ? JSON.parse(emotions).length : 0;
      const diaryCount = diary ? JSON.parse(diary).length : 0;
      
      return { emotions: emotionCount, diary: diaryCount, total: emotionCount + diaryCount };
    } catch (error) {
      console.error('Error getting offline data count:', error);
      return { emotions: 0, diary: 0, total: 0 };
    }
  };

  return {
    isOnline,
    isSyncing,
    saveOfflineEmotion,
    saveOfflineDiaryEntry,
    syncOfflineData,
    getOfflineDataCount,
  };
} 