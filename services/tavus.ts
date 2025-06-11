const TAVUS_API_KEY = process.env.EXPO_PUBLIC_TAVUS_API_KEY || '';

export const generatePersonalizedVideo = async (
  userName: string, 
  emotion: string
): Promise<string | null> => {
  if (!TAVUS_API_KEY) {
    console.warn('Tavus API key not configured');
    return null;
  }

  try {
    const emotionMessages: Record<string, string> = {
      happiness: `¡Hola ${userName}! Me alegra saber que te sientes feliz hoy. Disfruta este momento y comparte tu alegría con otros.`,
      sadness: `Hola ${userName}. Veo que hoy te sientes triste. Recuerda que está bien sentir así y que no estás solo en esto.`,
      stress: `${userName}, noto que estás estresado. Tómate un momento para respirar profundamente. Tienes la fuerza para superar esto.`,
      anxiety: `Hola ${userName}. La ansiedad puede ser abrumadora, pero recuerda que es temporal. Enfócate en el presente.`,
      anger: `${userName}, entiendo que te sientes enojado. Es una emoción válida. Tómate tiempo para calmarte antes de actuar.`,
      calm: `¡Qué bien ${userName}! Te sientes tranquilo hoy. Aprovecha esta paz interior para reflexionar y planificar.`,
      neutral: `Hola ${userName}. Estás en un estado equilibrado hoy. Es un buen momento para la introspección.`
    };

    const script = emotionMessages[emotion] || emotionMessages.neutral;

    const response = await fetch('https://tavusapi.com/v2/videos', {
      method: 'POST',
      headers: {
        'x-api-key': TAVUS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replica_id: 'default-replica-id', // You'll need to replace with your replica ID
        script: script,
        video_name: `${userName}_${emotion}_${Date.now()}`,
        background_url: 'https://images.pexels.com/photos/3280130/pexels-photo-3280130.jpeg'
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavus API error: ${response.status}`);
    }

    const data = await response.json();
    return data.download_url || data.video_url;
  } catch (error) {
    console.error('Error generating video:', error);
    return null;
  }
};

// Test Tavus connection
export const testTavusConnection = async (): Promise<boolean> => {
  if (!TAVUS_API_KEY) {
    console.warn('⚠️ Tavus API key not configured');
    return false;
  }

  try {
    const response = await fetch('https://tavusapi.com/v2/replicas', {
      headers: {
        'x-api-key': TAVUS_API_KEY,
      },
    });

    if (response.ok) {
      console.log('✅ Tavus connected successfully');
      return true;
    } else {
      throw new Error(`API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Tavus connection failed:', error);
    return false;
  }
};