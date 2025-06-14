import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import EmotionInput from '@/components/EmotionInput';
import EmotionResult from '@/components/EmotionResult';
import ChatView from '@/components/Chat/ChatView';
import { EmotionAnalysis } from '@/types/emotion';
import { getCurrentUser } from '@/services/supabase';

export default function HomeScreen() {
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysis | null>(null);
  const [userName, setUserName] = useState('Amigo');
  const [showChat, setShowChat] = useState(false);

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
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>
          {showChat ? 'Chat Emocional' : 'Análisis Emocional'}
        </Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowChat(!showChat)}
        >
          <Ionicons
            name={showChat ? 'analytics' : 'chatbubbles'}
            size={24}
            color="#6B73FF"
          />
        </TouchableOpacity>
      </View>

      {showChat ? (
        <ChatView />
      ) : (
        <ScrollView style={styles.content}>
          {!currentAnalysis ? (
            <EmotionInput onEmotionAnalyzed={handleEmotionAnalyzed} />
          ) : (
            <EmotionResult analysis={currentAnalysis} userName={userName} />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
});