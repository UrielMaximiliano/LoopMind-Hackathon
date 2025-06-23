# Instrucciones de Deploy en Netlify

## Configuración del Proyecto

Este proyecto está configurado para deployarse en Netlify usando Expo SDK 53.

### Configuración de Netlify

1. **Build Command**: `npm run build:netlify`
2. **Publish Directory**: `dist`
3. **Node Version**: 18

### Variables de Entorno Requeridas

Asegúrate de configurar las siguientes variables de entorno en Netlify:

- `ELEVENLABS_API_KEY`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `GROK_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Comandos de Build

- `npm run build`: Build para web
- `npm run build:netlify`: Build específico para Netlify (limpia cache)
- `npm run build:web`: Build para web

### Estructura de Archivos

- El build se genera en el directorio `dist/`
- Los archivos estáticos se sirven desde la raíz del directorio `dist/`
- Las rutas se manejan con redirects para SPA

### Solución de Problemas

Si el deploy falla:

1. Verifica que todas las variables de entorno estén configuradas
2. Asegúrate de que el Node.js version sea 18 o superior
3. El comando de build debe ser `npm run build:netlify`
4. El directorio de publicación debe ser `dist` 