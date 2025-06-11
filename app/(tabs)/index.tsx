import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import EmotionInput from '@/components/EmotionInput';
import EmotionResult from '@/components/EmotionResult';
import { EmotionAnalysis } from '@/types/emotion';
import { getCurrentUser } from '@/services/supabase';

export default function HomeScreen() {
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysis | null>(null);
  const [userName, setUserName] = useState('Friend');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user } = await getCurrentUser();
      if (user && user.email) {
        // Extract name from email or use the email itself
        const name = user.email.split('@')[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleEmotionAnalyzed = (analysis: EmotionAnalysis) => {
    setCurrentAnalysis(analysis);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#6B73FF', '#9B59B6', '#3498DB']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hello {userName}! 👋</Text>
          <Text style={styles.tagline}>
            Let's check in with your emotions today
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <EmotionInput onEmotionAnalyzed={handleEmotionAnalyzed} />
        
        {currentAnalysis && (
          <EmotionResult 
            analysis={currentAnalysis} 
            userName={userName}
          />
        )}

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Daily Wellness Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              💡 Take 3 deep breaths before checking your emotions
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              🌱 Remember: all emotions are valid and temporary
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              ⭐ Consistency in tracking helps build emotional awareness
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  tips: {
    margin: 16,
    marginTop: 32,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
  },
});