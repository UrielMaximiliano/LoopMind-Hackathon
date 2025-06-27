import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Crown, Settings, Bell, Moon, Sun, LogOut, Heart, Star, Shield, CircleHelp as HelpCircle, ExternalLink, Database, Zap, Clock } from 'lucide-react-native';
import { getCurrentUser, signOut } from '@/services/supabase';
import { getNotificationSettings, saveNotificationSettings, NotificationSettings } from '@/services/notifications';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    hour: 20,
    minute: 0,
  });

  const { isOnline, isSyncing, getOfflineDataCount } = useOfflineStorage();
  const [offlineDataCount, setOfflineDataCount] = useState({ emotions: 0, diary: 0, total: 0 });

  useEffect(() => {
    loadUserData();
    loadSettings();
    loadOfflineDataCount();
  }, []);

  const loadUserData = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await getNotificationSettings();
      setNotificationSettings(settings);
      setNotifications(settings.enabled);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const loadOfflineDataCount = async () => {
    try {
      const count = await getOfflineDataCount();
      setOfflineDataCount(count);
    } catch (error) {
      console.error('Error loading offline data count:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled by the auth state change
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.');
            }
          },
        },
      ]
    );
  };

  const handleUpgradeToPremium = () => {
    Alert.alert(
      '🌟 Actualizar a Premium',
      '¡Desbloquea videos personalizados, historial ilimitado y funciones exclusivas de bienestar!\n\n• Videos generados por IA con Tavus\n• Seguimiento emocional ilimitado\n• Análisis avanzados\n• Soporte prioritario\n• Síntesis de voz con ElevenLabs\n\nNota: La integración de RevenueCat requiere exportar este proyecto para implementar el procesamiento de pagos nativos.',
      [
        { text: 'Más Tarde', style: 'cancel' },
        { 
          text: 'Saber Más', 
          onPress: () => Linking.openURL('https://revenuecat.com/docs/getting-started/installation/expo')
        },
      ]
    );
  };

  const handleAPISetup = () => {
    Alert.alert(
      '🔧 Configuración de APIs',
      'Para habilitar todas las funciones premium:\n\n1. Crea un archivo .env en la raíz del proyecto\n2. Agrega tus claves de API:\n   - EXPO_PUBLIC_OPENAI_API_KEY\n   - EXPO_PUBLIC_ELEVENLABS_API_KEY\n   - EXPO_PUBLIC_TAVUS_API_KEY\n   - EXPO_PUBLIC_SUPABASE_URL\n   - EXPO_PUBLIC_SUPABASE_ANON_KEY\n\n3. Reinicia la aplicación',
      [
        { text: 'Entendido' },
        { 
          text: 'Ver Documentación', 
          onPress: () => Linking.openURL('https://docs.expo.dev/guides/environment-variables/')
        },
      ]
    );
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      const newSettings = { ...notificationSettings, enabled };
      await saveNotificationSettings(newSettings);
      setNotificationSettings(newSettings);
      setNotifications(enabled);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'No se pudo actualizar la configuración de notificaciones');
    }
  };

  const handleNotificationTimeSetup = () => {
    Alert.alert(
      '🔔 Configurar Recordatorio',
      'Selecciona la hora para recibir tu recordatorio diario de bienestar emocional.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Mañana (9:00)',
          onPress: () => updateNotificationTime(9, 0)
        },
        {
          text: 'Tarde (14:00)',
          onPress: () => updateNotificationTime(14, 0)
        },
        {
          text: 'Noche (20:00)',
          onPress: () => updateNotificationTime(20, 0)
        },
      ]
    );
  };

  const updateNotificationTime = async (hour: number, minute: number) => {
    try {
      const newSettings = { ...notificationSettings, hour, minute };
      await saveNotificationSettings(newSettings);
      setNotificationSettings(newSettings);
      Alert.alert(
        'Recordatorio Configurado',
        `Tu recordatorio diario está programado para las ${hour}:${minute.toString().padStart(2, '0')}`
      );
    } catch (error) {
      console.error('Error updating notification time:', error);
      Alert.alert('Error', 'No se pudo actualizar la hora del recordatorio');
    }
  };

  const userName = user?.email?.split('@')[0] || 'Usuario';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#6B73FF', '#9B59B6']}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#4CAF50', '#2196F3']}
              style={styles.avatar}
            >
              <User size={32} color="white" />
            </LinearGradient>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Crown size={12} color="#FFD700" />
              </View>
            )}
          </View>
          
          <Text style={styles.userName}>
            {userName.charAt(0).toUpperCase() + userName.slice(1)}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {!isPremium && (
            <TouchableOpacity style={styles.premiumButton} onPress={handleUpgradeToPremium}>
              <Crown size={16} color="#FFD700" />
              <Text style={styles.premiumButtonText}>Actualizar a Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Features */}
        {!isPremium && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Funciones Premium</Text>
            
            <TouchableOpacity style={styles.featureCard} onPress={handleUpgradeToPremium}>
              <LinearGradient
                colors={['#FFD700', '#FFA726']}
                style={styles.featureGradient}
              >
                <Crown size={24} color="white" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Videos Personalizados</Text>
                  <Text style={styles.featureDescription}>
                    Recibe mensajes de video generados por IA adaptados a tus emociones
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard} onPress={handleUpgradeToPremium}>
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.featureGradient}
              >
                <Star size={24} color="white" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Historial Ilimitado</Text>
                  <Text style={styles.featureDescription}>
                    Accede a tu viaje completo de bienestar emocional
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard} onPress={handleUpgradeToPremium}>
              <LinearGradient
                colors={['#9C27B0', '#BA68C8']}
                style={styles.featureGradient}
              >
                <Zap size={24} color="white" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Síntesis de Voz</Text>
                  <Text style={styles.featureDescription}>
                    Escucha tus consejos de bienestar con voces naturales de IA
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Bell size={20} color="#6B73FF" />
                <Text style={styles.settingText}>Notificaciones</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#E0E0E0', true: '#6B73FF' }}
                thumbColor="white"
              />
            </View>

            {notifications && (
              <TouchableOpacity style={styles.settingItem} onPress={handleNotificationTimeSetup}>
                <View style={styles.settingLeft}>
                  <Clock size={20} color="#6B73FF" />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingText}>Horario de Recordatorio</Text>
                    <Text style={styles.settingSubtext}>
                      {notificationSettings.hour.toString().padStart(2, '0')}:{notificationSettings.minute.toString().padStart(2, '0')}
                    </Text>
                  </View>
                </View>
                <ExternalLink size={16} color="#7F8C8D" />
              </TouchableOpacity>
            )}

            {!isOnline && (
              <View style={[styles.settingItem, styles.offlineIndicator]}>
                <View style={styles.settingLeft}>
                  <Database size={20} color="#FF6B6B" />
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingText, { color: '#FF6B6B' }]}>Modo Offline</Text>
                    <Text style={styles.settingSubtext}>
                      {offlineDataCount.total > 0 
                        ? `${offlineDataCount.total} elementos pendientes de sincronizar`
                        : 'Sin conexión a internet'
                      }
                    </Text>
                  </View>
                </View>
                {isSyncing && (
                  <View style={styles.syncIndicator}>
                    <Text style={styles.syncText}>Sincronizando...</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                {darkMode ? (
                  <Moon size={20} color="#6B73FF" />
                ) : (
                  <Sun size={20} color="#6B73FF" />
                )}
                <Text style={styles.settingText}>Modo Oscuro</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E0E0E0', true: '#6B73FF' }}
                thumbColor="white"
              />
            </View>

            <TouchableOpacity style={styles.settingItem} onPress={handleAPISetup}>
              <View style={styles.settingLeft}>
                <Database size={20} color="#6B73FF" />
                <Text style={styles.settingText}>Configurar APIs</Text>
              </View>
              <ExternalLink size={16} color="#7F8C8D" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Shield size={20} color="#6B73FF" />
                <Text style={styles.settingText}>Privacidad y Seguridad</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Settings size={20} color="#6B73FF" />
                <Text style={styles.settingText}>Configuración de la App</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayuda y Soporte</Text>
          
          <View style={styles.settingsList}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Linking.openURL('https://docs.expo.dev')}
            >
              <View style={styles.settingLeft}>
                <HelpCircle size={20} color="#6B73FF" />
                <Text style={styles.settingText}>Centro de Ayuda</Text>
              </View>
              <ExternalLink size={16} color="#7F8C8D" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Linking.openURL('mailto:support@loopmind.app')}
            >
              <View style={styles.settingLeft}>
                <Heart size={20} color="#6B73FF" />
                <Text style={styles.settingText}>Contactar Soporte</Text>
              </View>
              <ExternalLink size={16} color="#7F8C8D" />
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          
          <View style={styles.aboutCard}>
            <Heart size={24} color="#E91E63" />
            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>LoopMind Wellness</Text>
              <Text style={styles.aboutDescription}>
                Tu compañero de bienestar emocional impulsado por IA. Construido con amor para ayudarte 
                a entender y mejorar tu viaje de salud mental.
              </Text>
              <Text style={styles.aboutTech}>
                Tecnologías: React Native • Expo • Supabase • OpenAI • ElevenLabs • Tavus
              </Text>
              <Text style={styles.version}>Versión 1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#FF5722" />
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  premiumButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  featureCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  settingsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  aboutCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  aboutContent: {
    flex: 1,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 12,
  },
  aboutTech: {
    fontSize: 12,
    color: '#95A5A6',
    lineHeight: 16,
    marginBottom: 8,
  },
  version: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5722',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingSubtext: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  offlineIndicator: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  syncIndicator: {
    backgroundColor: '#6B73FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  syncText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
});