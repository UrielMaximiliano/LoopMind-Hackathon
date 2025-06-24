declare const Deno: {
  env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
  };
};

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string;
  audioUrl?: string;
  userId: string;
  conversationId?: string;
}

interface ChatResponse {
  response: string;
  conversationId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, audioUrl, userId, conversationId }: ChatRequest = await req.json()

    // Validate input
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If audio URL provided, transcribe it first
    let finalMessage = message || ''
    if (audioUrl) {
      try {
        const transcription = await transcribeAudio(audioUrl)
        finalMessage = transcription
      } catch (error) {
        console.error('Error transcribing audio:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to transcribe audio' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    if (!finalMessage.trim()) {
      return new Response(
        JSON.stringify({ error: 'No message content provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get conversation history if conversationId provided
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let conversationHistory: any[] = []
    let currentConversationId = conversationId

    if (currentConversationId) {
      const { data: history } = await supabaseClient
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true })
      
      conversationHistory = history || []
    } else {
      // Create new conversation
      const { data: newConversation } = await supabaseClient
        .from('conversations')
        .insert({
          user_id: userId,
          title: `Conversación ${new Date().toLocaleDateString()}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      currentConversationId = newConversation?.id
    }

    // Call Grok 3 mini for chat response
    const grokResponse = await callGrok3MiniChatWithTimeout({
      message: finalMessage,
      conversationHistory
    })

    // Save user message
    const { error: userError } = await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        user_id: userId,
        content: finalMessage,
        sender: 'user',
        audio_url: audioUrl
      });
    if (userError) {
      console.error('Error inserting user message:', userError);
    }

    // Save AI response
    const { error: aiError } = await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        user_id: userId,
        content: grokResponse,
        sender: 'ai'
      });
    if (aiError) {
      console.error('Error inserting AI message:', aiError);
    }

    return new Response(
      JSON.stringify({
        response: grokResponse,
        conversationId: currentConversationId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in emotional-chat:', error)
    
    // Handle specific error types
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        errorMessage = 'La solicitud tardó demasiado en procesarse. Por favor, intenta nuevamente.'
      } else if (error.message.includes('API key')) {
        errorMessage = 'Error de configuración del servicio de IA.'
      } else {
        errorMessage = error.message
      }
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function transcribeAudio(audioUrl: string): Promise<string> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
  
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  // Download audio file
  const audioResponse = await fetch(audioUrl)
  const audioBlob = await audioResponse.blob()

  // Convert to base64
  const arrayBuffer = await audioBlob.arrayBuffer()
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

  // Call ElevenLabs transcription API
  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio: base64Audio,
      model_id: 'eleven_multilingual_v2'
    })
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`)
  }

  const result = await response.json()
  return result.text || ''
}

async function callGrok3MiniChat(payload: {
  message: string;
  conversationHistory: any[];
}): Promise<string> {
  let GROK_API_KEY = Deno.env.get('GROK_API_KEY')
  
  // Fallback to hardcoded key if env var is not set (for debugging)
  
  if (!GROK_API_KEY) {
    throw new Error('Grok API key not configured')
  }

  console.log('GROK_API_KEY length:', GROK_API_KEY.length);
  console.log('GROK_API_KEY starts with:', GROK_API_KEY.substring(0, 10) + '...');

  // Build conversation context
  const messages: any[] = [
    {
      role: 'system',
      content: `Eres un amigo empático y positivo. Mantén una conversación natural, cálida y humana en español. Responde de forma breve, directa y amigable, como en un chat real. No hagas análisis ni devuelvas JSON, solo responde como lo haría una persona.`
    }
  ]

  // Add conversation history (last 10 messages to keep context manageable)
  const recentHistory = payload.conversationHistory.slice(-10)
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    })
  })

  // Add current message
  messages.push({
    role: 'user',
    content: payload.message
  })

  console.log('Sending chat to Grok with', messages.length, 'messages');
  console.log('Current message:', payload.message);

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages,
        temperature: 0.8,
        max_tokens: 250,
        enable_reasoning: false
      })
    });

    console.log('Chat API response status:', response.status);
    console.log('Chat API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat API error response:', errorText);
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Chat API response data:', data);
    
    const content = data.choices?.[0]?.message?.content;
    console.log('Content type:', typeof content);
    console.log('Content length:', content?.length || 0);
    console.log('Grok raw response:', content);

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.error('Grok devolvió contenido vacío o no válido');
      return 'Lo siento, no pude procesar tu mensaje en este momento. ¿Podrías intentar nuevamente?';
    }

    return content;
  } catch (apiError) {
    console.error('Chat API call error:', apiError);
    return 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.';
  }
}

async function callGrok3MiniChatWithTimeout(payload: {
  message: string;
  conversationHistory: any[];
}, timeoutMs = 15000): Promise<string> {
  return Promise.race([
    callGrok3MiniChat(payload),
    new Promise<string>((_, reject) => 
      setTimeout(() => reject(new Error('Grok chat request timed out')), timeoutMs)
    )
  ]);
} 