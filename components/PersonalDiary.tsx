import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { BookOpen, Edit, Trash2, Save, WifiOff } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

interface DiaryEntry {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function PersonalDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { isOnline, saveOfflineDiaryEntry } = useOfflineStorage();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      if (!isOnline) {
        Alert.alert(
          'Sin conexión',
          'No se pudieron cargar las entradas. Verifica tu conexión a internet.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const saveEntry = async () => {
    if (!newEntry.trim()) {
      Alert.alert('Error', 'Por favor escribe algo antes de guardar');
      return;
    }

    setLoading(true);
    try {
      if (!isOnline) {
        // Save offline
        await saveOfflineDiaryEntry(newEntry.trim());
        Alert.alert(
          'Guardado offline',
          'Tu entrada se guardó localmente y se sincronizará cuando tengas conexión.'
        );
        setNewEntry('');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: user.id,
          content: newEntry.trim(),
        });

      if (error) throw error;

      setNewEntry('');
      await loadEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'No se pudo guardar la entrada');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setEditingContent(entry.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const saveEdit = async () => {
    if (!editingContent.trim()) {
      Alert.alert('Error', 'El contenido no puede estar vacío');
      return;
    }

    if (!isOnline) {
      Alert.alert(
        'Sin conexión',
        'No puedes editar entradas sin conexión a internet.'
      );
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('diary_entries')
        .update({ content: editingContent.trim() })
        .eq('id', editingId)
        .eq('user_id', user.id);

      if (error) throw error;

      setEditingId(null);
      setEditingContent('');
      await loadEntries();
    } catch (error) {
      console.error('Error updating entry:', error);
      Alert.alert('Error', 'No se pudo actualizar la entrada');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!isOnline) {
      Alert.alert(
        'Sin conexión',
        'No puedes eliminar entradas sin conexión a internet.'
      );
      return;
    }

    Alert.alert(
      'Eliminar entrada',
      '¿Estás seguro de que quieres eliminar esta entrada? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('Usuario no autenticado');

              const { error } = await supabase
                .from('diary_entries')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

              if (error) throw error;
              await loadEntries();
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'No se pudo eliminar la entrada');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && entries.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B73FF" />
        <Text style={styles.loadingText}>Cargando tu diario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <BookOpen size={24} color="#6B73FF" />
          <Text style={styles.title}>Mi Diario Personal</Text>
        </View>
        <Text style={styles.subtitle}>Reflexiona y escribe libremente</Text>
        
        {!isOnline && (
          <View style={styles.offlineIndicator}>
            <WifiOff size={16} color="#FF6B6B" />
            <Text style={styles.offlineText}>Modo offline</Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="¿Qué quieres escribir hoy?"
          placeholderTextColor="#A0A0A0"
          value={newEntry}
          onChangeText={setNewEntry}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!newEntry.trim() || loading) && styles.saveButtonDisabled
          ]}
          onPress={saveEntry}
          disabled={!newEntry.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Save size={16} color="white" />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.entriesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#E5E5EA" />
            <Text style={styles.emptyTitle}>Tu diario está vacío</Text>
            <Text style={styles.emptySubtitle}>
              Escribe tu primera entrada para empezar a reflexionar
            </Text>
          </View>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              {editingId === entry.id ? (
                <>
                  <TextInput
                    style={styles.editInput}
                    value={editingContent}
                    onChangeText={setEditingContent}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={cancelEditing}
                    >
                      <Ionicons name="close" size={16} color="#FF6B6B" />
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveEditButton}
                      onPress={saveEdit}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Save size={16} color="white" />
                          <Text style={styles.saveEditButtonText}>Guardar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.entryContent}>{entry.content}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(entry.created_at)}
                    {entry.updated_at !== entry.created_at && ' (editado)'}
                  </Text>
                  <View style={styles.entryActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => startEditing(entry)}
                      disabled={!isOnline}
                    >
                      <Edit size={16} color={isOnline ? "#6B73FF" : "#E5E5EA"} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteEntry(entry.id)}
                      disabled={!isOnline}
                    >
                      <Trash2 size={16} color={isOnline ? "#FF6B6B" : "#E5E5EA"} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
  },
  offlineText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  inputContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
  },
  saveButton: {
    backgroundColor: '#6B73FF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  entriesContainer: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  entryCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: '#2C3E50',
  },
  entryDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#6B73FF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
  saveEditButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#6B73FF',
    borderRadius: 8,
  },
  saveEditButtonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 