import { EmotionAnalysis } from '@/types/emotion';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export const analyzeEmotion = async (text: string): Promise<EmotionAnalysis> => {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, using fallback');
    return getFallbackAnalysis(text);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Eres un coach de bienestar emocional empático y profesional. Analiza el estado emocional del usuario y proporciona consejos de apoyo en español.
            
            Clasifica la emoción como una de: happiness, sadness, stress, anxiety, anger, calm, excitement, fear, neutral, love, gratitude, hope, frustration, loneliness.
            
            Responde SOLO en formato JSON válido:
            {
              "emotion": "emocion_detectada",
              "advice": "consejo_empático_y_personal_máximo_80_palabras",
              "confidence": 0.95,
              "intensity": 7,
              "tags": ["etiqueta1", "etiqueta2"]
            }
            
            El consejo debe ser:
            - Personal y empático
            - Accionable y práctico
            - Alentador pero realista
            - En español
            - Máximo 80 palabras
            
            La intensidad debe ser del 1-10 (1=muy leve, 10=muy intenso).
            Las etiquetas deben describir el contexto emocional.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Clean the response to ensure it's valid JSON
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(cleanContent);
    
    return {
      emotion: result.emotion || 'neutral',
      advice: result.advice || 'Recuerda cuidarte hoy. Tus sentimientos son válidos.',
      confidence: result.confidence || 0.8,
      intensity: result.intensity || 5,
      tags: result.tags || ['general']
    };
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    return getFallbackAnalysis(text);
  }
};

const getFallbackAnalysis = (text: string): EmotionAnalysis => {
  // Simple keyword-based emotion detection as fallback
  const lowerText = text.toLowerCase();
  
  let emotion = 'neutral';
  let intensity = 5;
  
  if (lowerText.includes('feliz') || lowerText.includes('alegre') || lowerText.includes('contento')) {
    emotion = 'happiness';
    intensity = 7;
  } else if (lowerText.includes('triste') || lowerText.includes('deprimido') || lowerText.includes('melancólico')) {
    emotion = 'sadness';
    intensity = 6;
  } else if (lowerText.includes('estresado') || lowerText.includes('agobiado') || lowerText.includes('presión')) {
    emotion = 'stress';
    intensity = 7;
  } else if (lowerText.includes('ansioso') || lowerText.includes('nervioso') || lowerText.includes('preocupado')) {
    emotion = 'anxiety';
    intensity = 6;
  } else if (lowerText.includes('enojado') || lowerText.includes('furioso') || lowerText.includes('molesto')) {
    emotion = 'anger';
    intensity = 7;
  } else if (lowerText.includes('tranquilo') || lowerText.includes('relajado') || lowerText.includes('sereno')) {
    emotion = 'calm';
    intensity = 3;
  }

  const adviceMap: Record<string, string> = {
    happiness: 'Disfruta este momento de alegría. Comparte tu felicidad con otros y recuerda que mereces sentirte bien.',
    sadness: 'Es normal sentirse triste a veces. Permítete sentir estas emociones y busca apoyo cuando lo necesites.',
    stress: 'Tómate un momento para respirar profundamente. Identifica qué puedes controlar y enfócate en eso.',
    anxiety: 'La ansiedad es temporal. Practica técnicas de respiración y enfócate en el presente.',
    anger: 'Es válido sentir enojo. Tómate un tiempo para calmarte antes de tomar decisiones importantes.',
    calm: 'Aprovecha esta tranquilidad para reflexionar y planificar. Estás en un buen estado mental.',
    neutral: 'Estás en equilibrio. Es un buen momento para la introspección y el autoconocimiento.'
  };

  return {
    emotion,
    advice: adviceMap[emotion] || 'Recuerda cuidarte hoy. Tus sentimientos son válidos y temporales.',
    confidence: 0.6,
    intensity,
    tags: ['análisis_básico', emotion]
  };
};

// Test OpenAI connection
export const testOpenAIConnection = async (): Promise<boolean> => {
  if (!OPENAI_API_KEY) {
    console.warn('⚠️ OpenAI API key not configured');
    return false;
  }

  try {
    const testAnalysis = await analyzeEmotion('Me siento bien hoy');
    console.log('✅ OpenAI connected successfully');
    return true;
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error);
    return false;
  }
};