import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { ChatMessage } from '@/types/chat';
import { sendChatMessage } from '@/services/grok';

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    useEffect(() => {
        loadMessages();
        const subscription = subscribeToMessages();
        return () => {
            subscription.unsubscribe();
        };
    }, [conversationId]);

    const loadMessages = async () => {
        try {
            if (!conversationId) return;

            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            console.log('Mensajes desde Supabase:', data);

            if (error) throw error;

            setMessages(current => {
                // Filtra los mensajes locales que aún no están en Supabase (id temporal)
                const pending = current.filter(msg => msg.id.startsWith('temp-'));
                // Une los mensajes de Supabase con los pendientes locales, evitando duplicados por contenido y sender
                const merged = [...(data || [])];
                pending.forEach(pendingMsg => {
                    const exists = merged.some(
                        dbMsg =>
                            dbMsg.content === pendingMsg.content &&
                            dbMsg.sender === pendingMsg.sender
                    );
                    if (!exists) {
                        merged.push(pendingMsg);
                    }
                });
                console.log('Mensajes tras merge:', merged);
                return merged;
            });
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const subscribeToMessages = () => {
        if (!conversationId) return { unsubscribe: () => {} };

        return supabase
            .channel(`chat_messages_${conversationId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'chat_messages',
                filter: `conversation_id=eq.${conversationId}`
            },
                (payload) => {
                    setMessages(current => [...current, payload.new as ChatMessage]);
                }
            )
            .subscribe();
    };

    const sendMessage = async (text: string) => {
        try {
            setLoading(true);
            
            // Add user message to UI immediately (id temporal)
            const userMessage: ChatMessage = {
                id: 'temp-' + Date.now().toString(),
                conversation_id: conversationId || '',
                user_id: '',
                content: text,
                sender: 'user',
                created_at: new Date().toISOString()
            };
            
            setMessages(current => [...current, userMessage]);

            // Send to Grok via Edge Function
            const response = await sendChatMessage({
                message: text,
                conversationId: conversationId || undefined
            });

            if (!conversationId) {
                setConversationId(response.conversationId);

                // Recarga mensajes usando el nuevo conversationId directamente
                loadMessagesDirect(response.conversationId);

                const tryLoadMessages = (retries = 3) => {
                    loadMessagesDirect(response.conversationId);
                    setTimeout(() => {
                        setMessages(current => {
                            const hasReal = current.some(msg => !msg.id.startsWith('temp-'));
                            if (hasReal) {
                                return current.filter(msg => !msg.id.startsWith('temp-'));
                            }
                            if (current.length === 0 && retries > 0) {
                                tryLoadMessages(retries - 1);
                            }
                            return current;
                        });
                    }, 350);
                };
                tryLoadMessages();

                setTimeout(() => {
                    loadMessagesDirect(response.conversationId);
                }, 1000);
            }

            if (conversationId) {
                const aiMessage: ChatMessage = {
                    id: 'temp-' + (Date.now() + 1).toString(),
                    conversation_id: conversationId,
                    user_id: '',
                    content: response.response,
                    sender: 'ai',
                    created_at: new Date().toISOString()
                };
                setMessages(current => [...current, aiMessage]);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(current => current.slice(0, -1));
        } finally {
            setLoading(false);
        }
    };

    const sendAudioMessage = async (audioUri: string) => {
        try {
            setLoading(true);

            const tempId = 'temp-' + Date.now().toString();
            const userMessage: ChatMessage = {
                id: tempId,
                conversation_id: conversationId || '',
                user_id: '',
                content: '🎤 Enviando audio...',
                sender: 'user',
                audio_url: audioUri,
                created_at: new Date().toISOString()
            };
            setMessages(current => [...current, userMessage]);

            // 1. Fetch audio file as blob
            const response = await fetch(audioUri);
            const blob = await response.blob();
    
            // 2. Upload to Supabase Storage
            const fileExt = audioUri.split('.').pop() || 'm4a';
            const fileName = `audio_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('audio-messages')
                .upload(fileName, blob, {
                    contentType: `audio/${fileExt}`,
                });
    
            if (uploadError) {
                throw uploadError;
            }
    
            // 3. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('audio-messages')
                .getPublicUrl(fileName);

            // 4. Call edge function
            await sendChatMessage({
                message: '',
                audioUrl: publicUrl,
                conversationId: conversationId || undefined
            });

        } catch (error) {
            console.error('Error sending audio message:', error);
            setMessages(current => current.filter(msg => !msg.id.startsWith('temp-')));
        } finally {
            setLoading(false);
        }
    };

    const startNewConversation = () => {
        setConversationId(null);
        setMessages([]);
    };

    // Nueva función para cargar mensajes con un id específico
    const loadMessagesDirect = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('conversation_id', id)
                .order('created_at', { ascending: true });

            console.log('Mensajes desde Supabase (direct):', data);

            setMessages(current => {
                const pending = current.filter(msg => msg.id.startsWith('temp-'));
                const merged = [...(data || [])];
                pending.forEach(pendingMsg => {
                    const exists = merged.some(
                        dbMsg =>
                            dbMsg.content === pendingMsg.content &&
                            dbMsg.sender === pendingMsg.sender
                    );
                    if (!exists) {
                        merged.push(pendingMsg);
                    }
                });
                console.log('Mensajes tras merge (direct):', merged);
                return merged;
            });
        } catch (error) {
            console.error('Error loading messages (direct):', error);
        }
    };

    return {
        messages,
        loading,
        conversationId,
        sendMessage,
        sendAudioMessage,
        startNewConversation,
    };
} 