// Script de prueba usando el cliente de Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nohidscqwprvpcqbvidw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vaGlkc2Nxd3BydnBjYnZpZHciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTY4ODc2NCwiZXhwIjoyMDUxMjY0NzY0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmotionalChatWithSupabase() {
  try {
    console.log('🧪 Probando función emotional-chat con cliente Supabase...');
    
    const payload = {
      message: 'Hola, me siento un poco estresado hoy',
      userId: 'test-user-123'
    };
    
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    const { data, error } = await supabase.functions.invoke('emotional-chat', {
      body: payload
    });

    if (error) {
      console.error('❌ Error de Supabase:', error);
      return;
    }

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
testEmotionalChatWithSupabase(); 