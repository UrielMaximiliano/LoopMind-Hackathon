import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase, testSupabaseConnection } from '@/services/supabase';
import { testOpenAIConnection } from '@/services/openai';
import { testElevenLabsConnection } from '@/services/elevenlabs';
import { testTavusConnection } from '@/services/tavus';
import { router } from 'expo-router';
import BoltWatermark from '@/components/BoltWatermark';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Test all API connections on app start (only if API keys are configured)
    const testConnections = async () => {
      console.log('🔄 Testing API connections...');
      
      const supabaseOk = await testSupabaseConnection();
      const openaiOk = await testOpenAIConnection();
      const elevenLabsOk = await testElevenLabsConnection();
      const tavusOk = await testTavusConnection();
      
      console.log('📊 API Status:');
      console.log(`Supabase: ${supabaseOk ? '✅' : '❌'}`);
      console.log(`OpenAI: ${openaiOk ? '✅' : '❌'}`);
      console.log(`ElevenLabs: ${elevenLabsOk ? '✅' : '❌'}`);
      console.log(`Tavus: ${tavusOk ? '✅' : '❌'}`);
    };

    // Only test connections if we have valid environment variables
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey && 
        !supabaseUrl.includes('your-project-id') && 
        !supabaseKey.includes('your-supabase-anon-key')) {
      testConnections();
    } else {
      console.warn('⚠️ Supabase credentials not configured. Please update your .env file with actual values.');
    }

    // Check auth state on app start
    const checkAuthState = async () => {
      try {
        // Only check auth if Supabase is properly configured
        if (supabaseUrl && supabaseKey && 
            !supabaseUrl.includes('your-project-id') && 
            !supabaseKey.includes('your-supabase-anon-key')) {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            router.replace('/auth');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          // If Supabase is not configured, go to auth screen
          router.replace('/auth');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/auth');
      }
    };

    checkAuthState();

    // Listen for auth changes (only if Supabase is configured)
    let subscription: any = null;
    if (supabaseUrl && supabaseKey && 
        !supabaseUrl.includes('your-project-id') && 
        !supabaseKey.includes('your-supabase-anon-key')) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.replace('/auth');
        } else if (event === 'SIGNED_IN') {
          router.replace('/(tabs)');
        }
      });
      subscription = authSubscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
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
      <BoltWatermark />
    </>
  );
}