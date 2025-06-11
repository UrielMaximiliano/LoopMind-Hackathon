import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, Play, Pause, Video, Heart, Star, ExternalLink } from 'lucide-react-native';
import { EmotionAnalysis } from '@/types/emotion';
import { getEmotionEmoji, getEmotionGradient, getMoodMessage, getWellnessTip } from '@/utils/emotions';
import { generateVoiceAdvice } from '@/services/elevenlabs';
import { generatePersonalizedVideo } from '@/services/tavus';

interface EmotionResultProps {
  analysis: EmotionAnalysis;
  userName?: string;
}

export default function EmotionResult({ analysis, userName = 'Amigo' }: EmotionResultProps) {
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const emoji = getEmotionEmoji(analysis.emotion);
  const gradient = getEmotionGradient(analysis.emotion);
  const moodMessage = getMoodMessage(analysis.emotion, analysis.intensity || 5);
  const wellnessTip = getWellnessTip(analysis.emotion);

  const handleGenerateVoice = async () => {
    setIsGeneratingVoice(true);
    try {
      const voiceUrl = await generateVoiceAdvice(analysis.advice);
      if (voiceUrl) {
        setAudioUrl(voiceUrl);
        // Auto-play the audio
        playAudio(voiceUrl);
      } else {
        Alert.alert(
          'Función Premium', 
          'La síntesis de voz requiere configurar ElevenLabs API. Por ahora puedes leer el consejo en pantalla.',
          [{ text: 'Entendido' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar la voz. Intenta de nuevo.');
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    try {
      const videoUrlResult = await generatePersonalizedVideo(userName, analysis.emotion);
      if (videoUrlResult) {
        setVideoUrl(videoUrlResult);
        Alert.alert('¡Éxito!', '¡Tu video personalizado está listo!');
      } else {
        Alert.alert(
          'Función Premium', 
          'Los videos personalizados requieren configurar Tavus API. Esta función estará disponible con tu suscripción premium.',
          [
            { text: 'Más tarde' },
            { 
              text: 'Saber más', 
              onPress: () => Linking.openURL('https://tavus.io') 
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el video. Intenta de nuevo.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const playAudio = (url: string) => {
    if (Platform.OS === 'web') {
      const audio = new Audio(url);
      audio.play();
      setIsPlayingAudio(true);
      
      audio.onended = () => {
        setIsPlayingAudio(false);
      };
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return '#4CAF50';
    if (intensity <= 6) return '#FF9800';
    return '#F44336';
  };

  const getEmotionTranslation = (emotion: string) => {
    const translations: Record<string, string> = {
      happiness: 'feliz',
      sadness: 'triste',
      stress: 'estresado/a',
      anxiety: 'ansioso/a',
      anger: 'enojado/a',
      calm: 'tranquilo/a',
      excitement: 'emocionado/a',
      fear: 'temeroso/a',
      love: 'amoroso/a',
      gratitude: 'agradecido/a',
      hope: 'esperanzado/a',
      frustration: 'frustrado/a',
      loneliness: 'solo/a',
      neutral: 'equilibrado/a'
    };
    return translations[emotion] || emotion;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradient}
        style={styles.gradientContainer}
      >
        <View style={styles.emotionHeader}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.emotionTitle}>
            Te sientes {getEmotionTranslation(analysis.emotion)}
          </Text>
          
          <View style={styles.metricsContainer}>
            <View style={styles.confidenceBadge}>
              <Star size={12} color="white" />
              <Text style={styles.confidenceText}>
                {Math.round(analysis.confidence * 100)}% confianza
              </Text>
            </View>
            
            {analysis.intensity && (
              <View style={[styles.intensityBadge, { backgroundColor: getIntensityColor(analysis.intensity) }]}>
                <Heart size={12} color="white" />
                <Text style={styles.intensityText}>
                  Intensidad {analysis.intensity}/10
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {/* Mood Message */}
        <View style={styles.moodMessageContainer}>
          <Text style={styles.moodMessage}>{moodMessage}</Text>
        </View>

        {/* AI Advice */}
        <View style={styles.adviceContainer}>
          <Text style={styles.adviceTitle}>💬 Tu Coach de Bienestar dice:</Text>
          <Text style={styles.adviceText}>{analysis.advice}</Text>
        </View>

        {/* Wellness Tip */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>💡 Consejo de Bienestar</Text>
          <Text style={styles.tipText}>{wellnessTip}</Text>
        </View>

        {/* Tags */}
        {analysis.tags && analysis.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsTitle}>🏷️ Etiquetas:</Text>
            <View style={styles.tagsWrapper}>
              {analysis.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGenerateVoice}
            disabled={isGeneratingVoice}
          >
            <Volume2 size={20} color="#6B73FF" />
            <Text style={styles.actionText}>
              {isGeneratingVoice ? 'Generando...' : 'Escuchar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGenerateVideo}
            disabled={isGeneratingVideo}
          >
            <Video size={20} color="#6B73FF" />
            <Text style={styles.actionText}>
              {isGeneratingVideo ? 'Creando...' : 'Video Personal'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Audio Player */}
        {audioUrl && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => playAudio(audioUrl)}
          >
            {isPlayingAudio ? (
              <Pause size={16} color="white" />
            ) : (
              <Play size={16} color="white" />
            )}
            <Text style={styles.playButtonText}>
              {isPlayingAudio ? 'Reproduciendo...' : 'Reproducir Audio'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Video Player */}
        {videoUrl && (
          <View style={styles.videoContainer}>
            <Text style={styles.videoText}>¡Tu video personalizado está listo!</Text>
            <TouchableOpacity
              style={styles.videoButton}
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.open(videoUrl, '_blank');
                } else {
                  Linking.openURL(videoUrl);
                }
              }}
            >
              <ExternalLink size={16} color="white" />
              <Text style={styles.videoButtonText}>Ver Video</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Success Message */}
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            ✅ Tu entrada emocional ha sido guardada y analizada exitosamente
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emotionHeader: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  emotionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  intensityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 24,
  },
  moodMessageContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6B73FF',
  },
  moodMessage: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  adviceContainer: {
    marginBottom: 20,
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  adviceText: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
  },
  tipContainer: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  actionText: {
    color: '#6B73FF',
    fontSize: 14,
    fontWeight: '600',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B73FF',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  videoContainer: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  videoText: {
    color: '#2C3E50',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  videoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successText: {
    color: '#2E7D32',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});