import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { EmotionStats } from '@/types/emotion';

interface EmotionMoodboardProps {
  stats: EmotionStats[];
  period: 'week' | 'month';
}

const emotionColors: Record<string, string> = {
  happiness: '#FFD93D',
  sadness: '#6C5CE7',
  stress: '#FF7675',
  anxiety: '#FD79A8',
  anger: '#E17055',
  calm: '#74B9FF',
  excitement: '#FDCB6E',
  fear: '#636E72',
  neutral: '#B2BEC3',
  love: '#FF6B6B',
  gratitude: '#00B894',
  hope: '#A29BFE',
  frustration: '#FF8A80',
  loneliness: '#6C5CE7',
  feliz: '#FFD93D',
  triste: '#6C5CE7',
  estresado: '#FF7675',
  tranquilo: '#74B9FF',
};

const emotionEmojis: Record<string, string> = {
  happiness: '😊',
  sadness: '😢',
  stress: '😰',
  anxiety: '😟',
  anger: '😠',
  calm: '😌',
  excitement: '🤩',
  fear: '😱',
  neutral: '😐',
  love: '🥰',
  gratitude: '🙏',
  hope: '✨',
  frustration: '😤',
  loneliness: '🥺',
  feliz: '😊',
  triste: '😢',
  estresado: '😰',
  tranquilo: '😌',
};

export default function EmotionMoodboard({ stats, period }: EmotionMoodboardProps) {
  const totalEntries = stats.reduce((sum, stat) => sum + stat.count, 0);

  // Filter out emotions with 0 count
  const validStats = stats.filter(stat => stat.count > 0);

  if (validStats.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Moodboard - Última {period === 'week' ? 'semana' : 'mes'}
        </Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌟</Text>
          <Text style={styles.emptyTitle}>Sin emociones registradas</Text>
          <Text style={styles.emptySubtitle}>
            Registra tus emociones para ver tu moodboard visual
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Moodboard - Última {period === 'week' ? 'semana' : 'mes'}
      </Text>
      <Text style={styles.subtitle}>
        {totalEntries} {totalEntries === 1 ? 'entrada' : 'entradas'} emocionales
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
        <View style={styles.moodboardContainer}>
          {validStats.map((stat, index) => {
            const percentage = totalEntries > 0 ? (stat.count / totalEntries) * 100 : 0;
            // Calculate size based on percentage, minimum 40px, maximum 120px
            const size = Math.max(40, Math.min(120, 40 + (percentage * 0.8)));
            
            return (
              <View
                key={`${stat.emotion}-${index}`}
                style={[
                  styles.emotionBubble,
                  {
                    backgroundColor: emotionColors[stat.emotion.toLowerCase()] || '#B2BEC3',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                  },
                ]}
              >
                <Text style={[styles.emotionEmoji, { fontSize: size * 0.4 }]}>
                  {emotionEmojis[stat.emotion.toLowerCase()] || '😐'}
                </Text>
                <Text style={[styles.emotionCount, { fontSize: size * 0.2 }]}>
                  {stat.count}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Leyenda:</Text>
        <View style={styles.legendGrid}>
          {validStats.slice(0, 8).map((stat, index) => (
            <View key={`legend-${stat.emotion}-${index}`} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: emotionColors[stat.emotion.toLowerCase()] || '#B2BEC3' },
                ]}
              />
              <Text style={styles.legendText}>
                {stat.emotion.charAt(0).toUpperCase() + stat.emotion.slice(1)} ({stat.count})
              </Text>
            </View>
          ))}
        </View>
        {validStats.length > 8 && (
          <Text style={styles.moreText}>
            Y {validStats.length - 8} {validStats.length - 8 === 1 ? 'emoción más' : 'emociones más'}...
          </Text>
        )}
      </View>

      <View style={styles.insights}>
        <Text style={styles.insightsTitle}>💡 Insights</Text>
        {validStats.length > 0 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              Tu emoción más frecuente fue <Text style={styles.insightEmoji}>
                {emotionEmojis[validStats[0].emotion.toLowerCase()] || '😐'}
              </Text> <Text style={styles.insightEmotion}>
                {validStats[0].emotion}
              </Text> con {validStats[0].count} {validStats[0].count === 1 ? 'entrada' : 'entradas'}.
            </Text>
          </View>
        )}
        {validStats.length >= 2 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              Registraste {validStats.length} {validStats.length === 1 ? 'tipo de emoción' : 'tipos de emociones'} diferentes.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  scrollContainer: {
    marginBottom: 20,
  },
  moodboardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  emotionBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  emotionEmoji: {
    fontSize: 20,
    textAlign: 'center',
  },
  emotionCount: {
    position: 'absolute',
    bottom: -2,
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  legend: {
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  insights: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6B73FF',
  },
  insightText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  insightEmoji: {
    fontSize: 16,
  },
  insightEmotion: {
    fontWeight: '600',
    color: '#6B73FF',
  },
}); 