import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import ChatMessages from '@/components/Chat/ChatMessages';
import ChatInput from '@/components/Chat/ChatInput';
import { useChat } from '@/hooks/useChat';

export default function ChatView() {
  const { messages, loading, sendMessage, sendAudioMessage } = useChat();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ChatMessages messages={messages} loading={loading} />
        <ChatInput onSendMessage={sendMessage} onSendAudio={sendAudioMessage} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
}); 