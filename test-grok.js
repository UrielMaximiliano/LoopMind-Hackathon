const fetch = require('node-fetch'); // Si usas Node 18+ puedes usar global fetch

const GROK_API_KEY = 'xai-GoLZK2R3bb4PrPO9GtYzboUujzjkObcT25mOy6APEhLCgrjpciHUIfKiMGiaH4jgceAU8IxvVnLA4msc'; // Pon aquí tu API key de Grok

async function testGrok() {
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
              content: 'Responde SOLO con un JSON válido en español con las claves: analysis, emotion, confidence, intensity, tags. No agregues explicaciones ni texto antes o después.',
            },
            {
              role: 'user',
              content: 'Me siento estresado y cansado hoy.',
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

  const data = await response.json();
  console.log('Respuesta completa de Grok:', JSON.stringify(data, null, 2));
  console.log('\nSolo el contenido:', data.choices?.[0]?.message?.content);
}

testGrok();