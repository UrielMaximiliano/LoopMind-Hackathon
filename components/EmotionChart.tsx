import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getEmotionColor, getEmotionEmoji } from '@/utils/emotions';
import { EmotionStats } from '@/types/emotion';

interface EmotionChartProps {
  data: EmotionStats[];
  title: string;
}

export default function EmotionChart({ data, title }: EmotionChartProps) {
  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (item.count / maxCount) * 120,
                      backgroundColor: getEmotionColor(item.emotion),
                    },
                  ]}
                />
                <Text style={styles.countText}>{item.count}</Text>
              </View>
              
              <View style={styles.labelContainer}>
                <Text style={styles.emoji}>
                  {getEmotionEmoji(item.emotion)}
                </Text>
                <Text style={styles.emotionLabel}>
                  {item.emotion}
                </Text>
                <Text style={styles.percentageText}>
                  {item.percentage.toFixed(0)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {data.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available yet</Text>
          <Text style={styles.emptySubtext}>
            Start logging your emotions to see insights here
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    gap: 16,
    minHeight: 180,
  },
  barContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  barWrapper: {
    alignItems: 'center',
    height: 140,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 32,
    borderRadius: 16,
    minHeight: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 4,
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  emoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#34495E',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  percentageText: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
  },
});