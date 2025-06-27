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
import { analyzeEmotionWithGrok } from '@/services/grok';
import { EmotionAnalysis } from '@/types/emotion';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

interface EmotionInputProps {
  onEmotionAnalyzed: (analysis: EmotionAnalysis) => void;
}

export default function EmotionInput({ onEmotionAnalyzed }: EmotionInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodIntensity, setMoodIntensity] = useState(3);
  const [selectedMood, setSelectedMood] = useState<'feliz' | 'triste' | 'estresado' | 'tranquilo' | null>(null);

  const { isOnline, saveOfflineEmotion } = useOfflineStorage();

  const handleTextSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Error', 'Por favor selecciona un estado de ánimo');
      return;
    }

    setIsAnalyzing(true);
    try {
      if (!isOnline) {
        // Handle offline mode
        const offlineAnalysis: EmotionAnalysis = {
          emotion: selectedMood,
          advice: 'Análisis guardado offline. Se procesará cuando tengas conexión.',
          confidence: 0.8,
          intensity: moodIntensity,
        };

        await saveOfflineEmotion({
          ...offlineAnalysis,
          timestamp: new Date().toISOString(),
          synced: false,
          mood: selectedMood,
          description: input.trim() || undefined,
        });

        Alert.alert(
          'Guardado offline',
          'Tu entrada emocional se guardó localmente y se analizará cuando tengas conexión.'
        );

        onEmotionAnalyzed(offlineAnalysis);
        setInput('');
        setMoodIntensity(3);
        setSelectedMood(null);
        return;
      }

      // Analyze emotion with Grok 3 mini
      const analysis = await analyzeEmotionWithGrok({
        mood: selectedMood,
        intensity: moodIntensity,
        description: input.trim() || undefined
      });

      onEmotionAnalyzed(analysis);
      setInput('');
      setMoodIntensity(3);
      setSelectedMood(null);
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
    
    if (!selectedMood) {
      Alert.alert('Error', 'Por favor selecciona un estado de ánimo antes de grabar');
      return;
    }
    
    setIsRecording(!isRecording);
    
    if (isRecording) {
      // Stop recording and process
      setIsRecording(false);
      // TODO: Implement audio recording and processing
      Alert.alert('Función en desarrollo', 'La grabación de audio estará disponible próximamente');
    }
  };

  const quickEmotions = [
    { emotion: 'feliz', emoji: '😊', label: 'Feliz' },
    { emotion: 'triste', emoji: '😢', label: 'Triste' },
    { emotion: 'estresado', emoji: '😰', label: 'Estresado' },
    { emotion: 'tranquilo', emoji: '😌', label: 'Tranquilo' },
  ];

  const handleQuickEmotion = async (emotion: 'feliz' | 'triste' | 'estresado' | 'tranquilo') => {
    setSelectedMood(emotion);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Smile size={24} color="#6B73FF" />
        <Text style={styles.title}>¿Cómo te sientes hoy?</Text>
      </View>
      <Text style={styles.subtitle}>Selecciona tu estado de ánimo y describe cómo te sientes</Text>

      {/* Quick Emotions */}
      <View style={styles.quickEmotionsContainer}>
        <Text style={styles.quickEmotionsTitle}>Estado de ánimo:</Text>
        <View style={styles.quickEmotionsGrid}>
          {quickEmotions.map((item) => (
            <TouchableOpacity
              key={item.emotion}
              style={[
                styles.quickEmotionButton,
                selectedMood === item.emotion && styles.quickEmotionButtonSelected
              ]}
              onPress={() => handleQuickEmotion(item.emotion as any)}
              disabled={isAnalyzing}
            >
              <Text style={styles.quickEmotionEmoji}>{item.emoji}</Text>
              <Text style={[
                styles.quickEmotionLabel,
                selectedMood === item.emotion && styles.quickEmotionLabelSelected
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mood Intensity Slider */}
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>Intensidad: {moodIntensity}/5</Text>
        <View style={styles.intensitySlider}>
          {[1, 2, 3, 4, 5].map((value) => (
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
          placeholder="Describe cómo te sientes... (opcional)"
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
          disabled={isAnalyzing || !selectedMood}
        >
          {isRecording ? (
            <MicOff size={24} color="white" />
          ) : (
            <Mic size={24} color="#6B73FF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, (!selectedMood || isAnalyzing) && styles.submitButtonDisabled]}
          onPress={handleTextSubmit}
          disabled={!selectedMood || isAnalyzing}
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
            Analizando tu estado emocional con Grok 3 mini...
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
  quickEmotionButtonSelected: {
    backgroundColor: '#6B73FF',
    borderColor: '#6B73FF',
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
  quickEmotionLabelSelected: {
    color: 'white',
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