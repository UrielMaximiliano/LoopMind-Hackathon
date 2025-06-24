#!/bin/bash

echo "🟣 Configurando LoopMind Wellness con Grok 3 mini..."
echo ""

# Verificar si Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no está instalado."
    echo "Instalando Supabase CLI..."
    npm install -g supabase
fi

# Verificar si el usuario está logueado
if ! supabase status &> /dev/null; then
    echo "🔐 Por favor, inicia sesión en Supabase:"
    supabase login
fi

# Verificar si el proyecto está linkeado
if [ ! -f "supabase/.temp/project_id" ]; then
    echo "🔗 Por favor, linkea tu proyecto de Supabase:"
    echo "Ejecuta: supabase link --project-ref TU_PROJECT_REF"
    exit 1
fi

echo "✅ Verificando configuración..."

# Verificar variables de entorno
if [ -z "$GROK_API_KEY" ]; then
    echo "⚠️  GROK_API_KEY no está configurada"
    echo "Configúrala en Supabase Dashboard > Settings > Edge Functions"
fi

if [ -z "$ELEVENLABS_API_KEY" ]; then
    echo "⚠️  ELEVENLABS_API_KEY no está configurada"
    echo "Configúrala en Supabase Dashboard > Settings > Edge Functions"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  SUPABASE_SERVICE_ROLE_KEY no está configurada"
    echo "Configúrala en Supabase Dashboard > Settings > Edge Functions"
fi

echo ""
echo "🚀 Desplegando Edge Functions..."

# Desplegar funciones
echo "📦 Desplegando analyze-emotion..."
supabase functions deploy analyze-emotion

echo "📦 Desplegando emotional-chat..."
supabase functions deploy emotional-chat

echo ""
echo "🗄️  Aplicando migraciones de base de datos..."
supabase db push

echo ""
echo "✅ ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura las variables de entorno en Supabase Dashboard"
echo "2. Prueba la conexión con: npm run test:grok"
echo "3. Ejecuta la aplicación: npm start"
echo ""
echo "📚 Documentación: GROK_MIGRATION.md" 