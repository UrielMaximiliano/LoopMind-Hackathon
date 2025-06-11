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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Crown,
  Settings,
  Bell,
  Moon,
  Sun,
  LogOut,
  Heart,
  Star,
  Shield,
} from 'lucide-react-native';
import { getCurrentUser, signOut } from '@/services/supabase';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled by the auth state change
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleUpgradeToPremium = () => {
    Alert.alert(
      '🌟 Upgrade to Premium',
      'Unlock personalized videos, unlimited history, and exclusive wellness features!\n\n• AI-generated videos from Tavus\n• Unlimited emotion tracking\n• Advanced analytics\n• Priority support\n\nNote: RevenueCat integration requires exporting this project to implement native payment processing.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Learn More', onPress: () => console.log('Premium info') },
      ]
    );
  };

  const userName = user?.email?.split('@')[0] || 'User';

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
              <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Features */}
        {!isPremium && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            
            <TouchableOpacity style={styles.featureCard} onPress={handleUpgradeToPremium}>
              <LinearGradient
                colors={['#FFD700', '#FFA726']}
                style={styles.featureGradient}
              >
                <Crown size={24} color="white" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Personalized Videos</Text>
                  <Text style={styles.featureDescription}>
                    Get AI-generated video messages tailored to your emotions
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
                  <Text style={styles.featureTitle}>Unlimited History</Text>
                  <Text style={styles.featureDescription}>
                    Access your complete emotional wellness journey
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Bell size={20} color="#6B73FF" />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E0E0E0', true: '#6B73FF' }}
                thumbColor="white"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                {darkMode ? (
                  <Moon size={20} color="#6B73FF" />
                ) : (
                  <Sun size={20} color="#6B73FF" />
                )}
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E0E0E0', true: '#6B73FF' }}
                thumbColor="white"
              />
            </View>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Shield size={20} color="#6B73FF" />
                <Text style={styles.settingText}>Privacy & Security</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Settings size={20} color="#6B73FF" />
                <Text style={styles.settingText}>App Settings</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutCard}>
            <Heart size={24} color="#E91E63" />
            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>LoopMind Wellness</Text>
              <Text style={styles.aboutDescription}>
                Your AI-powered emotional wellness companion. Built with love to help you 
                understand and improve your mental health journey.
              </Text>
              <Text style={styles.version}>Version 1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#FF5722" />
          <Text style={styles.signOutText}>Sign Out</Text>
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
});