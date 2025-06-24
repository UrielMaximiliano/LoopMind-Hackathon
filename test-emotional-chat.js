// Script de prueba para la función emotional-chat
const SUPABASE_URL = 'https://nohidscqwprvpcqbvidw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vaGlkc2Nxd3BydnBjYnZpZHciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTY4ODc2NCwiZXhwIjoyMDUxMjY0NzY0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

async function testEmotionalChat() {
  try {
    console.log('🧪 Probando función emotional-chat...');
    console.log('📡 URL:', `${SUPABASE_URL}/functions/v1/emotional-chat`);
    
    const payload = {
      message: 'Hola, me siento un poco estresado hoy',
      userId: 'test-user-123'
    };
    
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/emotional-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(payload)
    });

    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Error JSON:', errorJson);
      } catch (e) {
        console.error('❌ Error text (not JSON):', errorText);
      }
      return;
    }

    const data = await response.json();
    console.log('✅ Respuesta exitosa:', JSON.stringify(data, null, 2));
    
    if (data.response) {
      console.log('💬 Respuesta de Grok:', data.response);
      console.log('🆔 Conversation ID:', data.conversationId);
    } else {
      console.error('❌ No se recibió respuesta de Grok');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('❌ Error stack:', error.stack);
  }
}

// Ejecutar la prueba
testEmotionalChat(); 