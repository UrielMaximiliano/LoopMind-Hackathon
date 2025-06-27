import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { ChatMessage } from '@/types/chat';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
}

export default function ChatMessages({ messages, loading }: ChatMessagesProps) {
  const flatListRef = useRef<FlatList>(null);

  // Crear datos que incluyan el indicador de typing cuando esté cargando
  const messagesWithTyping = React.useMemo(() => {
    if (loading) {
      return [...messages, { id: 'typing-indicator', isTyping: true }];
    }
    return messages;
  }, [messages, loading]);

  useEffect(() => {
    if (messagesWithTyping.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messagesWithTyping]);

  const renderItem = ({ item }: { item: any }) => {
    if (item.isTyping) {
      return <TypingIndicator />;
    }
    return <Message message={item} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messagesWithTyping}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageList: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
}); 