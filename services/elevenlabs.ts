const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
const VOICE_ID = process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID || '';

// Check if we have valid credentials
const hasValidCredentials = ELEVENLABS_API_KEY && 
  VOICE_ID && 
  !ELEVENLABS_API_KEY.includes('your-elevenlabs-api-key') && 
  !VOICE_ID.includes('your-elevenlabs-voice-id');

export const generateVoiceAdvice = async (text: string): Promise<string | null> => {
  if (!hasValidCredentials) {
    console.warn('ElevenLabs API key or Voice ID not configured');
    return null;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Convertir la respuesta a blob y crear una URL
    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    return audioUrl;
  } catch (error) {
    console.error('Error al generar voz:', error);
    return null;
  }
};

// Test ElevenLabs connection
export const testElevenLabsConnection = async (): Promise<boolean> => {
  if (!hasValidCredentials) {
    console.warn('⚠️ ElevenLabs API key not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (response.ok) {
      console.log('✅ ElevenLabs connected successfully');
      return true;
    } else {
      throw new Error(`API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ ElevenLabs connection failed:', error);
    return false;
  }
};