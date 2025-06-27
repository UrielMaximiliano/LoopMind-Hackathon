import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { supabase, testSupabaseConnection } from '@/services/supabase';
import { testOpenAIConnection } from '@/services/openai';
import { testElevenLabsConnection } from '@/services/elevenlabs';
import { testTavusConnection } from '@/services/tavus';
import { setupNotifications, initializeNotificationListeners } from '@/services/notifications';
import { router } from 'expo-router';

export default function RootLayout() {
  useFrameworkReady();
  const { syncOfflineData } = useOfflineStorage();

  useEffect(() => {
    // Initialize notifications
    const initializeApp = async () => {
      await setupNotifications();
      initializeNotificationListeners();
    };
    
    initializeApp();

    // Check auth state on app start
    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.replace('/auth');
        } else {
          router.replace('/(tabs)');
          // Sync offline data when user is authenticated
          syncOfflineData();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/auth');
      }
    };

    checkAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/auth');
      } else if (event === 'SIGNED_IN') {
        router.replace('/(tabs)');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="auth" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}