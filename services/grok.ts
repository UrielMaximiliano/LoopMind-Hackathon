import { supabase } from '@/supabase/client';
import { EmotionAnalysis } from '@/types/emotion';
import { getCurrentUser } from './supabase';

export interface GrokAnalysisRequest {
  mood: 'feliz' | 'triste' | 'estresado' | 'tranquilo';
  intensity: number;
  description?: string;
  audioUrl?: string;
}

export interface GrokChatRequest {
  message: string;
  audioUrl?: string;
  conversationId?: string;
}

export interface GrokChatResponse {
  response: string;
  conversationId: string;
}

export const analyzeEmotionWithGrok = async (request: GrokAnalysisRequest): Promise<EmotionAnalysis> => {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase.functions.invoke('analyze-emotion', {
      body: {
        ...request,
        userId: user.id
      }
    });

    if (error) {
      console.error('Error calling analyze-emotion function:', error);
      throw new Error('Error al analizar emoción');
    }

    // Convert Grok response to EmotionAnalysis format
    return {
      emotion: data.emotion,
      advice: data.analysis,
      confidence: data.confidence,
      intensity: data.intensity,
      tags: data.tags
    };
  } catch (error) {
    console.error('Error in analyzeEmotionWithGrok:', error);
    throw error;
  }
};

export const sendChatMessage = async (request: GrokChatRequest): Promise<GrokChatResponse> => {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase.functions.invoke('emotional-chat', {
      body: {
        ...request,
        userId: user.id
      }
    });

    if (error) {
      console.error('Error calling emotional-chat function:', error);
      throw new Error('Error al enviar mensaje');
    }

    return data;
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
};

// Test Grok connection
export const testGrokConnection = async (): Promise<boolean> => {
  try {
    const testAnalysis = await analyzeEmotionWithGrok({
      mood: 'feliz',
      intensity: 3,
      description: 'Me siento bien hoy'
    });
    console.log('✅ Grok connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Grok connection failed:', error);
    return false;
  }
}; 