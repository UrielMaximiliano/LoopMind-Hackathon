import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, Calendar } from 'lucide-react-native';
import { EmotionEntry } from '@/types/emotion';
import { getEmotionEmoji, getEmotionGradient, formatDate, formatTime } from '@/utils/emotions';

interface EmotionHistoryProps {
  entries: EmotionEntry[];
  onPlayAdvice?: (advice: string) => void;
}

export default function EmotionHistory({ entries, onPlayAdvice }: EmotionHistoryProps) {
  const renderEntry = ({ item }: { item: EmotionEntry }) => {
    const emoji = getEmotionEmoji(item.detected_emotion);
    const gradient = getEmotionGradient(item.detected_emotion);

    return (
      <View style={styles.entryContainer}>
        <LinearGradient
          colors={[...gradient, 'rgba(255,255,255,0.9)']}
          style={styles.entryGradient}
        >
          <View style={styles.entryHeader}>
            <View style={styles.emotionInfo}>
              <Text style={styles.emoji}>{emoji}</Text>
              <View>
                <Text style={styles.emotionText}>
                  {item.detected_emotion}
                </Text>
                <View style={styles.dateContainer}>
                  <Calendar size={12} color="#7F8C8D" />
                  <Text style={styles.dateText}>
                    {formatDate(item.created_at)} • {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
            </View>
            
            {onPlayAdvice && (
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => onPlayAdvice(item.ai_advice)}
              >
                <Volume2 size={16} color="#6B73FF" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.userInput} numberOfLines={2}>
            "{item.user_input}"
          </Text>

          <View style={styles.adviceContainer}>
            <Text style={styles.adviceLabel}>AI Advice:</Text>
            <Text style={styles.adviceText}>{item.ai_advice}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Emotional Journey</Text>
      
      {entries.length > 0 ? (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No entries yet</Text>
          <Text style={styles.emptySubtext}>
            Start your wellness journey by sharing how you feel today
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    margin: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  entryContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  entryGradient: {
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  emotionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    textTransform: 'capitalize',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 115, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInput: {
    fontSize: 14,
    color: '#34495E',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  adviceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 8,
  },
  adviceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B73FF',
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 20,
  },
});