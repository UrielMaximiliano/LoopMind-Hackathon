import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Send, MicOff, Smile } from 'lucide-react-native';
import { analyzeEmotion } from '@/services/openai';
import { saveEmotionEntry, getCurrentUser } from '@/services/supabase';
import { EmotionAnalysis } from '@/types/emotion';

interface EmotionInputProps {
  onEmotionAnalyzed: (analysis: EmotionAnalysis) => void;
}

export default function EmotionInput({ onEmotionAnalyzed }: EmotionInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodIntensity, setMoodIntensity] = useState(5);

  const handleTextSubmit = async () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Por favor escribe algo antes de analizar');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Analyze emotion with OpenAI
      const analysis = await analyzeEmotion(input);
      
      // Save to Supabase
      const { user } = await getCurrentUser();
      if (user) {
        const entryData = {
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          user_input: input,
          input_type: 'text' as const,
          detected_emotion: analysis.emotion,
          ai_advice: analysis.advice,
          confidence_score: analysis.confidence,
          mood_intensity: analysis.intensity || moodIntensity,
          tags: analysis.tags || [],
        };

        const { error } = await saveEmotionEntry(entryData);
        if (error) {
          console.error('Error saving entry:', error);
          Alert.alert('Aviso', 'El análisis se completó pero no se pudo guardar en la base de datos.');
        }
      }

      onEmotionAnalyzed(analysis);
      setInput('');
      setMoodIntensity(5);
    } catch (error) {
      console.error('Error in handleTextSubmit:', error);
      Alert.alert('Error', 'No se pudo analizar tu emoción. Por favor intenta de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceRecord = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Grabación de Voz', 
        'La función de grabación de voz estará disponible en la versión móvil. Por ahora, usa la entrada de texto.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsRecording(!isRecording);
    
    if (isRecording) {
      // Stop recording and process
      setIsRecording(false);
    }
  };

  const quickEmotions = [
    { emotion: 'happiness', emoji: '😊', label: 'Feliz' },
    { emotion: 'sadness', emoji: '😢', label: 'Triste' },
    { emotion: 'stress', emoji: '😰', label: 'Estresado' },
    { emotion: 'calm', emoji: '😌', label: 'Tranquilo' },
  ];

  const handleQuickEmotion = async (emotion: string) => {
    const quickAnalysis: EmotionAnalysis = {
      emotion,
      advice: `Has seleccionado ${emotion}. Tómate un momento para reflexionar sobre este sentimiento y recuerda que todas las emociones son válidas.`,
      confidence: 0.9,
      intensity: moodIntensity,
    };

    try {
      const { user } = await getCurrentUser();
      if (user) {
        const entryData = {
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          user_input: `Selección rápida: ${emotion}`,
          input_type: 'text' as const,
          detected_emotion: emotion,
          ai_advice: quickAnalysis.advice,
          confidence_score: 0.9,
          mood_intensity: moodIntensity,
          tags: ['selección_rápida', emotion],
        };

        await saveEmotionEntry(entryData);
      }

      onEmotionAnalyzed(quickAnalysis);
    } catch (error) {
      console.error('Error saving quick emotion:', error);
      // Still show the analysis even if saving fails
      onEmotionAnalyzed(quickAnalysis);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Smile size={24} color="#6B73FF" />
        <Text style={styles.title}>¿Cómo te sientes hoy?</Text>
      </View>
      <Text style={styles.subtitle}>Comparte tus pensamientos o selecciona una emoción rápida</Text>

      {/* Quick Emotions */}
      <View style={styles.quickEmotionsContainer}>
        <Text style={styles.quickEmotionsTitle}>Selección rápida:</Text>
        <View style={styles.quickEmotionsGrid}>
          {quickEmotions.map((item) => (
            <TouchableOpacity
              key={item.emotion}
              style={styles.quickEmotionButton}
              onPress={() => handleQuickEmotion(item.emotion)}
              disabled={isAnalyzing}
            >
              <Text style={styles.quickEmotionEmoji}>{item.emoji}</Text>
              <Text style={styles.quickEmotionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mood Intensity Slider */}
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>Intensidad del estado de ánimo: {moodIntensity}/10</Text>
        <View style={styles.intensitySlider}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.intensityDot,
                moodIntensity >= value && styles.intensityDotActive
              ]}
              onPress={() => setMoodIntensity(value)}
              disabled={isAnalyzing}
            />
          ))}
        </View>
      </View>

      {/* Text Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Describe cómo te sientes... Por ejemplo: 'Me siento ansioso por el trabajo' o 'Estoy muy feliz hoy'"
          placeholderTextColor="#A0A0A0"
          value={input}
          onChangeText={setInput}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!isAnalyzing}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
          onPress={handleVoiceRecord}
          disabled={isAnalyzing}
        >
          {isRecording ? (
            <MicOff size={24} color="white" />
          ) : (
            <Mic size={24} color="#6B73FF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, (!input.trim() || isAnalyzing) && styles.submitButtonDisabled]}
          onPress={handleTextSubmit}
          disabled={!input.trim() || isAnalyzing}
        >
          <LinearGradient
            colors={['#6B73FF', '#9B59B6']}
            style={styles.submitGradient}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Send size={20} color="white" />
            )}
            <Text style={styles.submitText}>
              {isAnalyzing ? 'Analizando...' : 'Analizar'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {isAnalyzing && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Analizando tu estado emocional con IA...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  quickEmotionsContainer: {
    marginBottom: 20,
  },
  quickEmotionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  quickEmotionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickEmotionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickEmotionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickEmotionLabel: {
    fontSize: 12,
    color: '#34495E',
    fontWeight: '500',
  },
  intensityContainer: {
    marginBottom: 20,
  },
  intensityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  intensitySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  intensityDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  intensityDotActive: {
    backgroundColor: '#6B73FF',
    borderColor: '#6B73FF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#F8F9FA',
    minHeight: 120,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6B73FF',
  },
  voiceButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  submitButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B73FF',
    fontSize: 14,
    fontWeight: '500',
  },
});