const TAVUS_API_KEY = process.env.EXPO_PUBLIC_TAVUS_API_KEY || '';

export const generatePersonalizedVideo = async (
  userName: string, 
  emotion: string
): Promise<string | null> => {
  try {
    const script = `Hello ${userName}, I noticed you've been feeling ${emotion} today. Remember that every emotion is valid and you're doing an amazing job taking care of your mental health. Keep going, you've got this!`;

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
      throw new Error('Failed to generate video');
    }

    const data = await response.json();
    return data.download_url || data.video_url;
  } catch (error) {
    console.error('Error generating video:', error);
    return null;
  }
};