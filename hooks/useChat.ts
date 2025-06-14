import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { ChatMessage } from '@/types/chat';
import { transcribeAudio } from '@/services/whisper';
import { generateResponse } from '@/services/ai';
import { generateVoiceAdvice } from '@/services/elevenlabs';

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMessages();
        const subscription = subscribeToMessages();
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loadMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const subscribeToMessages = () => {
        return supabase
            .channel('messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    setMessages(current => [...current, payload.new as ChatMessage]);
                }
            )
            .subscribe();
    };

    const sendMessage = async (text: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('messages')
                .insert([{ text, sender: 'user' }])
                .select()
                .single();

            if (error) throw error;

            const aiResponse = await generateResponse(text, null);
            await supabase
                .from('messages')
                .insert([{ text: aiResponse, sender: 'ai' }]);

            const audioUrl = await generateVoiceAdvice(aiResponse);
            if (audioUrl) {
                await supabase
                    .from('messages')
                    .insert([{ audioUrl, sender: 'ai' }]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendAudioMessage = async (audioUri: string) => {
        try {
            setLoading(true);
            const transcription = await transcribeAudio(audioUri);

            await supabase
                .from('messages')
                .insert([{
                    text: transcription,
                    audioUrl: audioUri,
                    sender: 'user'
                }]);

            const aiResponse = await generateResponse(transcription, null);
            await supabase
                .from('messages')
                .insert([{ text: aiResponse, sender: 'ai' }]);

            const audioUrl = await generateVoiceAdvice(aiResponse);
            if (audioUrl) {
                await supabase
                    .from('messages')
                    .insert([{ audioUrl, sender: 'ai' }]);
            }
        } catch (error) {
            console.error('Error sending audio message:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        messages,
        loading,
        sendMessage,
        sendAudioMessage,
    };
} 