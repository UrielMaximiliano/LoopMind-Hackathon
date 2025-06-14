const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

export async function transcribeAudio(audioUri: string): Promise<string> {
    if (!ELEVENLABS_API_KEY) {
        console.warn('ELEVENLABS_API_KEY no está configurada');
        return '';
    }

    try {
        const response = await fetch(audioUri);
        const audioBlob = await response.blob();
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.m4a');
        formData.append('model_id', 'whisper-1');
        formData.append('language', 'es');

        const transcriptionResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: formData
        });

        if (!transcriptionResponse.ok) {
            throw new Error('Error en la transcripción');
        }

        const data = await transcriptionResponse.json();
        return data.text;
    } catch (error) {
        console.error('Error en la transcripción:', error);
        return '';
    }
} 