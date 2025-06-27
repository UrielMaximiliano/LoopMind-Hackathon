import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Calendar, Clock, Award, ChartBar as BarChart3, Target } from 'lucide-react-native';
import EmotionChart from '@/components/EmotionChart';
import EmotionHistory from '@/components/EmotionHistory';
import EmotionMoodboard from '@/components/EmotionMoodboard';
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
      if (!user) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
        return;
      }

      // Load recent emotion entries
      const { data: entries, error: entriesError } = await getEmotionEntries(user.id, 10);
      if (entriesError) {
        console.error('Error loading entries:', entriesError);
      } else if (entries) {
        setEmotionEntries(entries);
      }

      // Load emotion statistics
      const days = selectedPeriod === 'week' ? 7 : 30;
      const { data: stats, error: statsError } = await getEmotionStats(user.id, days);
      if (statsError) {
        console.error('Error loading stats:', statsError);
      } else if (stats) {
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
          percentage: total > 0 ? (count / total) * 100 : 0,
        })).sort((a, b) => b.count - a.count);

        setEmotionStats(processedStats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
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
      } else {
        Alert.alert(
          'Función Premium', 
          'La síntesis de voz requiere configurar ElevenLabs API.',
          [{ text: 'Entendido' }]
        );
      }
    } catch (error) {
      console.error('Error playing advice:', error);
      Alert.alert('Error', 'No se pudo reproducir el audio');
    }
  };

  const getStreakDays = () => {
    if (emotionEntries.length === 0) return 0;
    
    // Calculate consecutive days of entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    const sortedEntries = [...emotionEntries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].created_at);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getAverageMoodIntensity = () => {
    if (emotionEntries.length === 0) return 0;
    
    const total = emotionEntries.reduce((sum, entry) => 
      sum + (entry.mood_intensity || 5), 0
    );
    return Math.round(total / emotionEntries.length * 10) / 10;
  };

  const streakDays = getStreakDays();
  const avgMoodIntensity = getAverageMoodIntensity();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#6B73FF', '#9B59B6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dashboard Emocional</Text>
        <Text style={styles.headerSubtitle}>
          Seguimiento de tu bienestar mental
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
            <Text style={styles.statLabel}>Entradas Totales</Text>
          </View>
          
          <View style={styles.statCard}>
            <Calendar size={24} color="#2196F3" />
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Días Seguidos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Award size={24} color="#FF9800" />
            <Text style={styles.statValue}>
              {emotionStats.length > 0 ? emotionStats[0].emotion : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Emoción Principal</Text>
          </View>
        </View>

        {/* Additional Stats */}
        <View style={styles.additionalStatsContainer}>
          <View style={styles.additionalStatCard}>
            <BarChart3 size={20} color="#6B73FF" />
            <View style={styles.additionalStatContent}>
              <Text style={styles.additionalStatValue}>{avgMoodIntensity}/10</Text>
              <Text style={styles.additionalStatLabel}>Intensidad Promedio</Text>
            </View>
          </View>
          
          <View style={styles.additionalStatCard}>
            <Target size={20} color="#E91E63" />
            <View style={styles.additionalStatContent}>
              <Text style={styles.additionalStatValue}>
                {emotionStats.filter(stat => 
                  ['happiness', 'calm', 'love', 'gratitude', 'hope'].includes(stat.emotion)
                ).reduce((sum, stat) => sum + stat.percentage, 0).toFixed(0)}%
              </Text>
              <Text style={styles.additionalStatLabel}>Emociones Positivas</Text>
            </View>
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
              Esta Semana
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
              Este Mes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emotion Chart */}
        <EmotionChart
          data={emotionStats}
          title={`Tus Emociones (${selectedPeriod === 'week' ? 'Últimos 7 Días' : 'Últimos 30 Días'})`}
        />

        {/* Emotion Moodboard */}
        <EmotionMoodboard
          stats={emotionStats}
          period={selectedPeriod}
        />

        {/* Recent History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Entradas Recientes</Text>
          <EmotionHistory
            entries={emotionEntries.slice(0, 5)}
            onPlayAdvice={handlePlayAdvice}
          />
          
          {emotionEntries.length > 5 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Ver Todas las Entradas</Text>
            </TouchableOpacity>
          )}
          
          {emotionEntries.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay entradas aún</Text>
              <Text style={styles.emptySubtext}>
                Comienza tu viaje de bienestar registrando cómo te sientes hoy
              </Text>
            </View>
          )}
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>💡 Insights Personalizados</Text>
          
          {streakDays > 0 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                🔥 ¡Increíble! Llevas {streakDays} día{streakDays > 1 ? 's' : ''} seguido{streakDays > 1 ? 's' : ''} registrando tus emociones.
              </Text>
            </View>
          )}
          
          {emotionStats.length > 0 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                📊 Tu emoción más frecuente es "{emotionStats[0].emotion}" ({emotionStats[0].percentage.toFixed(0)}% del tiempo).
              </Text>
            </View>
          )}
          
          {avgMoodIntensity > 7 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                ⚡ Tu intensidad emocional promedio es alta ({avgMoodIntensity}/10). Considera técnicas de relajación.
              </Text>
            </View>
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
  additionalStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  additionalStatCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  additionalStatContent: {
    flex: 1,
  },
  additionalStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  additionalStatLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginTop: 2,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 16,
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
  insightsContainer: {
    margin: 16,
    marginTop: 0,
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6B73FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
});