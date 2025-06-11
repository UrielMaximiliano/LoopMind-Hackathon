import { EmotionAnalysis } from '@/types/emotion';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export const analyzeEmotion = async (text: string): Promise<EmotionAnalysis> => {
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
            
            Responde en formato JSON:
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
      throw new Error('Failed to analyze emotion');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      emotion: result.emotion,
      advice: result.advice,
      confidence: result.confidence || 0.8,
      intensity: result.intensity || 5,
      tags: result.tags || []
    };
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    // Fallback response en español
    return {
      emotion: 'neutral',
      advice: 'Recuerda cuidarte hoy. Tus sentimientos son válidos y temporales. Tómate un momento para respirar profundamente.',
      confidence: 0.5,
      intensity: 5,
      tags: ['general', 'bienestar']
    };
  }
};

export const generatePersonalizedAdvice = async (
  emotion: string, 
  intensity: number, 
  context: string
): Promise<string> => {
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
            content: `Eres un coach de bienestar especializado en salud mental. Proporciona consejos personalizados en español basados en la emoción, intensidad y contexto del usuario.`
          },
          {
            role: 'user',
            content: `Emoción: ${emotion}, Intensidad: ${intensity}/10, Contexto: ${context}. Dame un consejo personalizado de máximo 100 palabras.`
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate advice');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating advice:', error);
    return 'Tómate un momento para reconocer tus sentimientos. Cada emoción tiene un propósito y es válida. Respira profundamente y recuerda que tienes la fuerza para superar cualquier desafío.';
  }
};