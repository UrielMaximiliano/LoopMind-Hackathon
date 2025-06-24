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

interface EmotionAnalysisRequest {
  mood: 'feliz' | 'triste' | 'estresado' | 'tranquilo';
  intensity: number;
  description?: string;
  audioUrl?: string;
  userId: string;
}

interface GrokResponse {
  analysis: string;
  emotion: string;
  confidence: number;
  intensity: number;
  tags: string[];
  rawResponse?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { mood, intensity, description, audioUrl, userId }: EmotionAnalysisRequest = await req.json()

    // Validate input
    if (!mood || !intensity || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If audio URL provided, transcribe it first
    let finalDescription = description || ''
    if (audioUrl) {
      try {
        const transcription = await transcribeAudio(audioUrl)
        finalDescription = transcription
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

    // Call Grok 3 mini for analysis
    const grokResponse = await callGrokWithTimeout({
      context: 'emotional_analysis',
      mood,
      intensity,
      description: finalDescription
    })

    // Save to database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: dbError } = await supabaseClient
      .from('emotion_entries')
      .insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        user_input: finalDescription || `Selección rápida: ${mood}`,
        input_type: audioUrl ? 'audio' : 'text',
        detected_emotion: grokResponse.emotion,
        ai_advice: grokResponse.analysis,
        confidence_score: grokResponse.confidence,
        mood_intensity: grokResponse.intensity,
        tags: grokResponse.tags,
        audio_url: audioUrl,
        raw_grok_response: grokResponse.rawResponse || null
      })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    return new Response(
      JSON.stringify(grokResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in analyze-emotion:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

async function callGrok3Mini(payload: {
  context: 'emotional_analysis' | 'emotional_chat';
  mood: string;
  intensity: number;
  description: string;
}): Promise<GrokResponse> {
  let GROK_API_KEY = Deno.env.get('GROK_API_KEY');

  if (!GROK_API_KEY) {
    console.warn('GROK_API_KEY no encontrada en el entorno, usando clave de respaldo para depuración.');
    GROK_API_KEY = "xai-GoLZK2R3bb4PrPO9GtYzboUujzjkObcT25mOy6APEhLCgrjpciHUIfKiMGiaH4jgceAU8IxvVnLA4msc";
  }
  
  if (!GROK_API_KEY) {
    throw new Error('Grok API key not configured');
  }

  console.log('GROK_API_KEY length:', GROK_API_KEY.length);
  console.log('GROK_API_KEY starts with:', GROK_API_KEY.substring(0, 10) + '...');

  const prompt = `
Primero, razona paso a paso en español sobre el estado emocional del usuario y cómo deberías responder (usa reasoning_content).
Luego, responde SOLO con un JSON válido en español con las claves: analysis, emotion, confidence, intensity, tags.
En la clave "analysis", actúa como un coach emocional empático: ofrece un mensaje alentador, consejo práctico o recomendación personalizada para el usuario, no solo una descripción.
No agregues texto antes ni después del JSON.
`;

  console.log('Sending to Grok:', JSON.stringify(payload));
  console.log('Prompt:', prompt);

  try {
    // Use direct API call instead of ai-sdk
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: `Estado: ${payload.mood}, intensidad: ${payload.intensity}/5, descripción: "${payload.description}".`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000 // Permite razonamiento y respuesta
      })
    });

    console.log('API response status:', response.status);
    console.log('API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);

    const content = data.choices?.[0]?.message?.content;
    console.log('Content type:', typeof content);
    console.log('Content length:', content?.length || 0);
    console.log('Grok raw response:', JSON.stringify(content));

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.error('Grok devolvió contenido vacío o no válido');
      return {
        analysis: 'No se recibió respuesta de la IA. Intenta nuevamente.',
        emotion: payload.mood,
        confidence: 0.5,
        intensity: Math.min(payload.intensity * 2, 10),
        tags: ['empty_response'],
        rawResponse: content
      };
    }

    // Validate JSON structure before processing
    try {
      let cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      if (!cleanContent) {
        throw new Error('Content is empty after cleaning');
      }
      let parsed = JSON.parse(cleanContent);
      // Si el resultado es un string, parsea de nuevo
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch (e) {
          console.error('No se pudo parsear el string JSON anidado:', parsed);
        }
      }
      console.log('Successfully parsed JSON:', parsed);
      return {
        ...parsed,
        rawResponse: content
      };
    } catch (parseError) {
      console.error('JSON parse failed:', parseError);
      console.error('Raw Grok response:', content);
      // Intentar extraer el primer bloque JSON
      const firstCurly = content.indexOf('{');
      const lastCurly = content.lastIndexOf('}');
      if (firstCurly !== -1 && lastCurly !== -1) {
        const possibleJson = content.substring(firstCurly, lastCurly + 1);
        try {
          const extracted = JSON.parse(possibleJson);
          console.log('Successfully parsed extracted JSON:', extracted);
          return {
            ...extracted,
            rawResponse: content
          };
        } catch (extractError) {
          console.error('Failed to extract and parse JSON:', extractError);
        }
      }
      return {
        analysis: 'La respuesta de la IA no tiene el formato correcto. Intenta nuevamente.',
        emotion: payload.mood,
        confidence: 0.5,
        intensity: Math.min(payload.intensity * 2, 10),
        tags: ['invalid_json'],
        rawResponse: content
      };
    }
  } catch (apiError) {
    console.error('API call error:', apiError);
    return {
      analysis: 'Error al conectar con el servicio de IA. Verifica la configuración.',
      emotion: payload.mood,
      confidence: 0.3,
      intensity: Math.min(payload.intensity * 2, 10),
      tags: ['api_connection'],
      rawResponse: undefined
    };
  }
}

async function callGrokWithTimeout(payload: {
  context: 'emotional_analysis' | 'emotional_chat';
  mood: string;
  intensity: number;
  description: string;
}, timeoutMs = 15000): Promise<GrokResponse> {
  return Promise.race([
    callGrok3Mini(payload),
    new Promise<GrokResponse>((_, reject) => 
      setTimeout(() => reject(new Error('Grok request timed out')), timeoutMs)
    )
  ]);
} 