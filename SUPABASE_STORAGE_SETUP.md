# 🔧 Configuración de Storage para Audio Messages en Supabase

## ❌ Problema
```
ERROR: 42501: must be owner of table objects
```

Este error ocurre porque no puedes modificar las políticas de `storage.objects` directamente desde el SQL Editor. Necesitas usar la interfaz web de Supabase.

## ✅ Solución - Configuración desde la Interfaz Web

### Paso 1: Crear el Bucket
1. Ve a tu proyecto en **Supabase Dashboard**
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"Create bucket"**
4. Configura el bucket:
   - **Name**: `audio-messages`
   - **Public bucket**: ✅ **Activado** (para que los audios sean accesibles)
   - **File size limit**: 10 MB (opcional)
   - **Allowed MIME types**: `audio/*` (opcional, para restringir solo audios)

### Paso 2: Configurar Políticas desde la Interfaz
1. En **Storage**, selecciona el bucket `audio-messages`
2. Ve a la pestaña **"Policies"**
3. Haz clic en **"Add policy"**

#### Política 1: Permitir Subida (INSERT)
```
Policy name: Allow authenticated users to upload
Operation: INSERT
Target roles: authenticated
Policy definition: true
```

#### Política 2: Permitir Lectura Pública (SELECT)
```
Policy name: Allow public read access
Operation: SELECT
Target roles: public
Policy definition: true
```

### Paso 3: Configuración Alternativa (Más Segura)

Si quieres más control, puedes usar estas políticas más específicas:

#### Política de Subida con Carpetas de Usuario
```sql
-- En el campo "Policy definition" para INSERT:
bucket_id = 'audio-messages' AND 
(storage.foldername(name))[1] = auth.uid()::text
```

#### Política de Lectura Específica
```sql
-- En el campo "Policy definition" para SELECT:
bucket_id = 'audio-messages'
```

## 🔍 Verificación

### Opción A: Desde la Interfaz
1. Ve a **Storage > audio-messages**
2. Intenta subir un archivo de prueba
3. Verifica que aparezca en la lista

### Opción B: Desde SQL Editor (Solo Consulta)
```sql
-- Verificar que el bucket existe
SELECT * FROM storage.buckets WHERE id = 'audio-messages';

-- Verificar políticas (solo lectura)
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%audio%';
```

## 🚀 Configuración Rápida (Recomendada)

**Para desarrollo rápido**, usa estas configuraciones simples:

1. **Bucket**: `audio-messages` (público)
2. **Política INSERT**: 
   - Name: `Allow all uploads`
   - Operation: `INSERT`
   - Target roles: `authenticated`
   - Policy: `true`

3. **Política SELECT**:
   - Name: `Allow all reads`
   - Operation: `SELECT` 
   - Target roles: `public`
   - Policy: `true`

## 🔒 Configuración Segura (Producción)

**Para producción**, usa configuraciones más restrictivas:

1. **Política INSERT**:
   ```sql
   bucket_id = 'audio-messages' AND 
   auth.role() = 'authenticated' AND
   (storage.foldername(name))[1] = auth.uid()::text
   ```

2. **Política SELECT**:
   ```sql
   bucket_id = 'audio-messages'
   ```

3. **Política UPDATE** (opcional):
   ```sql
   bucket_id = 'audio-messages' AND 
   auth.uid()::text = owner
   ```

4. **Política DELETE** (opcional):
   ```sql
   bucket_id = 'audio-messages' AND 
   auth.uid()::text = owner
   ```

## 📱 Testear la Funcionalidad

Después de configurar las políticas:

1. **Ir al chat** en tu app
2. **Grabar un audio** usando el botón de micrófono
3. **Verificar** que se sube sin errores
4. **Comprobar** que aparece en Storage > audio-messages

## 🐛 Troubleshooting

### Error: "new row violates row-level security policy"
- ✅ Verifica que el bucket `audio-messages` existe
- ✅ Verifica que hay una política INSERT para `authenticated`
- ✅ Verifica que el usuario está autenticado

### Error: "Unable to read file"
- ✅ Verifica que hay una política SELECT para `public`
- ✅ Verifica que el bucket es público

### Error: "Bucket not found"
- ✅ Crea el bucket desde Storage > Create bucket
- ✅ Asegúrate del nombre exacto: `audio-messages`

## 📝 Notas Importantes

- ⚠️ **No uses el SQL Editor** para políticas de storage
- ✅ **Usa siempre la interfaz web** de Supabase
- 🔄 **Las políticas se aplican inmediatamente**
- 📁 **Los archivos se organizan** por carpetas de usuario: `/{user_id}/audio_xxx.m4a` 