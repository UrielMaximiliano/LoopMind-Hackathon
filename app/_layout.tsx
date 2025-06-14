import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase, testSupabaseConnection } from '@/services/supabase';
import { testOpenAIConnection } from '@/services/openai';
import { testElevenLabsConnection } from '@/services/elevenlabs';
import { testTavusConnection } from '@/services/tavus';
import { router } from 'expo-router';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Test all API connections on app start
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

    testConnections();

    // Check auth state on app start
    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.replace('/auth');
        } else {
          router.replace('/(tabs)');
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