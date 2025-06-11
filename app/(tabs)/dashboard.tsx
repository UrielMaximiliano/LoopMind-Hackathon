import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Calendar, Clock, Award } from 'lucide-react-native';
import EmotionChart from '@/components/EmotionChart';
import EmotionHistory from '@/components/EmotionHistory';
import { EmotionEntry, EmotionStats } from '@/types/emotion';
import { getEmotionEntries, getEmotionStats, getCurrentUser } from '@/services/supabase';
import { generateVoiceAdvice } from '@/services/elevenlabs';

export default function DashboardScreen() {
  const [emotionEntries, setEmotionEntries] = useState<EmotionEntry[]>([]);
  const [emotionStats, setEmotionStats] = useState<EmotionStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const { user } = await getCurrentUser();
      if (!user) return;

      // Load recent emotion entries
      const { data: entries } = await getEmotionEntries(user.id, 10);
      if (entries) {
        setEmotionEntries(entries);
      }

      // Load emotion statistics
      const days = selectedPeriod === 'week' ? 7 : 30;
      const { data: stats } = await getEmotionStats(user.id, days);
      if (stats) {
        // Process stats data
        const emotionCounts: Record<string, number> = {};
        stats.forEach(entry => {
          const emotion = entry.detected_emotion;
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });

        const total = stats.length;
        const processedStats: EmotionStats[] = Object.entries(emotionCounts).map(([emotion, count]) => ({
          emotion,
          count,
          percentage: (count / total) * 100,
        })).sort((a, b) => b.count - a.count);

        setEmotionStats(processedStats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAdvice = async (advice: string) => {
    try {
      const audioUrl = await generateVoiceAdvice(advice);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error playing advice:', error);
    }
  };

  const getStreakDays = () => {
    // Calculate consecutive days of entries
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < emotionEntries.length; i++) {
      const entryDate = new Date(emotionEntries[i].date);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streakDays = getStreakDays();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#6B73FF', '#9B59B6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Emotional Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Track your emotional wellness journey
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadDashboardData} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{emotionEntries.length}</Text>
            <Text style={styles.statLabel}>Total Entries</Text>
          </View>
          
          <View style={styles.statCard}>
            <Calendar size={24} color="#2196F3" />
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Award size={24} color="#FF9800" />
            <Text style={styles.statValue}>
              {emotionStats.length > 0 ? emotionStats[0].emotion : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Top Emotion</Text>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'week' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === 'week' && styles.periodTextActive,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'month' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === 'month' && styles.periodTextActive,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emotion Chart */}
        <EmotionChart
          data={emotionStats}
          title={`Your Emotions (${selectedPeriod === 'week' ? 'Past 7 Days' : 'Past 30 Days'})`}
        />

        {/* Recent History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          <EmotionHistory
            entries={emotionEntries.slice(0, 5)}
            onPlayAdvice={handlePlayAdvice}
          />
          
          {emotionEntries.length > 5 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Entries</Text>
            </TouchableOpacity>
          )}
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C3E50',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#6B73FF',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  periodTextActive: {
    color: 'white',
  },
  historySection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  viewAllButton: {
    backgroundColor: '#6B73FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});