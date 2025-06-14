const GROK_API_KEY = process.env.GROK_API_KEY;

export async function generateResponse(message: string, emotionAnalysis: any): Promise<string> {
    if (!GROK_API_KEY) {
        console.warn('GROK_API_KEY no está configurada');
        return 'Lo siento, no puedo responder en este momento.';
    }

    try {
        const response = await fetch('https://api.grok.ai/v1/chat/completions', {
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
                        content: `Eres un asistente empático y comprensivo. 
                        Reglas importantes:
                        - Responde siempre en español
                        - Sé empático y comprensivo
                        - Valida los sentimientos del usuario
                        - Sugiere estrategias de afrontamiento cuando sea apropiado
                        - Mantén un tono cálido y profesional
                        
                        Contexto emocional actual: ${JSON.stringify(emotionAnalysis)}`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta de Grok');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error generando respuesta:', error);
        return 'Lo siento, hubo un error al procesar tu mensaje.';
    }
} 