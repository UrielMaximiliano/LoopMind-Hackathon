import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ChatMessage } from '@/types/chat';

interface MessageProps {
  message: ChatMessage;
}

export default function Message({ message }: MessageProps) {
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const playAudio = async () => {
    if (!message.audioUrl) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: message.audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error al reproducir audio:', error);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const isUser = message.sender === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {message.text && (
        <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
          {message.text}
        </Text>
      )}

      {message.audioUrl && (
        <TouchableOpacity
          style={styles.audioButton}
          onPress={isPlaying ? stopAudio : playAudio}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={isUser ? '#fff' : '#6B73FF'}
          />
        </TouchableOpacity>
      )}

      {message.videoUrl && (
        <View style={styles.videoContainer}>
          <Text style={styles.videoText}>Video personalizado disponible</Text>
          <TouchableOpacity style={styles.videoButton}>
            <Ionicons name="videocam" size={24} color="#6B73FF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginVertical: 8,
    padding: 12,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  userContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#6B73FF',
  },
  aiContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#2C3E50',
  },
  audioButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
  },
  videoContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(107, 115, 255, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  videoText: {
    fontSize: 14,
    color: '#6B73FF',
    marginRight: 8,
  },
  videoButton: {
    padding: 4,
  },
}); 