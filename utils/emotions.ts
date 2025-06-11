import { EmotionType } from '@/types/emotion';

export const getEmotionEmoji = (emotion: string): string => {
  const emojiMap: Record<string, string> = {
    happiness: '😊',
    sadness: '😢',
    stress: '😰',
    anxiety: '😟',
    anger: '😡',
    calm: '😌',
    excitement: '🤩',
    fear: '😨',
    neutral: '😐',
    love: '🥰',
    gratitude: '🙏',
    hope: '🌟',
    frustration: '😤',
    loneliness: '😔',
  };
  return emojiMap[emotion.toLowerCase()] || '😐';
};

export const getEmotionColor = (emotion: string): string => {
  const colorMap: Record<string, string> = {
    happiness: '#4CAF50',
    sadness: '#2196F3',
    stress: '#FF9800',
    anxiety: '#FF5722',
    anger: '#F44336',
    calm: '#00BCD4',
    excitement: '#E91E63',
    fear: '#9C27B0',
    neutral: '#9E9E9E',
    love: '#E91E63',
    gratitude: '#4CAF50',
    hope: '#FFD700',
    frustration: '#FF5722',
    loneliness: '#607D8B',
  };
  return colorMap[emotion.toLowerCase()] || '#9E9E9E';
};

export const getEmotionGradient = (emotion: string): [string, string] => {
  const gradientMap: Record<string, [string, string]> = {
    happiness: ['#4CAF50', '#81C784'],
    sadness: ['#2196F3', '#64B5F6'],
    stress: ['#FF9800', '#FFB74D'],
    anxiety: ['#FF5722', '#FF8A65'],
    anger: ['#F44336', '#E57373'],
    calm: ['#00BCD4', '#4DD0E1'],
    excitement: ['#E91E63', '#F06292'],
    fear: ['#9C27B0', '#BA68C8'],
    neutral: ['#9E9E9E', '#BDBDBD'],
    love: ['#E91E63', '#F8BBD9'],
    gratitude: ['#4CAF50', '#A5D6A7'],
    hope: ['#FFD700', '#FFF176'],
    frustration: ['#FF5722', '#FFAB91'],
    loneliness: ['#607D8B', '#90A4AE'],
  };
  return gradientMap[emotion.toLowerCase()] || ['#9E9E9E', '#BDBDBD'];
};

export const getEmotionIntensityColor = (intensity: number): string => {
  if (intensity <= 3) return '#4CAF50'; // Verde para baja intensidad
  if (intensity <= 6) return '#FF9800'; // Naranja para intensidad media
  return '#F44336'; // Rojo para alta intensidad
};

export const getEmotionCategory = (emotion: string): 'positive' | 'negative' | 'neutral' => {
  const positiveEmotions = ['happiness', 'calm', 'excitement', 'love', 'gratitude', 'hope'];
  const negativeEmotions = ['sadness', 'stress', 'anxiety', 'anger', 'fear', 'frustration', 'loneliness'];
  
  if (positiveEmotions.includes(emotion.toLowerCase())) return 'positive';
  if (negativeEmotions.includes(emotion.toLowerCase())) return 'negative';
  return 'neutral';
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateLong = (date: string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getRelativeTime = (date: string): string => {
  const now = new Date();
  const entryDate = new Date(date);
  const diffInHours = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Hace menos de una hora';
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `Hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
};

export const getMoodMessage = (emotion: string, intensity: number): string => {
  const category = getEmotionCategory(emotion);
  
  if (category === 'positive') {
    if (intensity >= 7) return '¡Te sientes genial! Disfruta este momento.';
    if (intensity >= 5) return 'Te sientes bien. Es un buen día.';
    return 'Hay algo de positividad en tu día.';
  }
  
  if (category === 'negative') {
    if (intensity >= 7) return 'Parece que estás pasando por un momento difícil. Recuerda que esto pasará.';
    if (intensity >= 5) return 'Hay algunos desafíos hoy. Tómate un momento para respirar.';
    return 'Hay algunas emociones complicadas, pero estás manejándolo bien.';
  }
  
  return 'Estás en un estado equilibrado. Mantén la calma.';
};

export const getWellnessTip = (emotion: string): string => {
  const tips: Record<string, string> = {
    happiness: 'Comparte tu alegría con otros. La felicidad se multiplica cuando se comparte.',
    sadness: 'Está bien sentirse triste. Permítete sentir y busca apoyo cuando lo necesites.',
    stress: 'Practica respiración profunda. Inhala por 4 segundos, mantén por 4, exhala por 6.',
    anxiety: 'Enfócate en el presente. Nombra 5 cosas que puedes ver, 4 que puedes tocar, 3 que puedes oír.',
    anger: 'Toma una pausa antes de reaccionar. Cuenta hasta 10 y respira profundamente.',
    calm: 'Aprovecha esta tranquilidad para reflexionar y planificar tu día.',
    excitement: 'Canaliza esta energía positiva hacia tus metas y proyectos.',
    fear: 'El miedo es normal. Identifica qué lo causa y toma pequeños pasos para enfrentarlo.',
    neutral: 'Un estado neutral es perfecto para la introspección y el autoconocimiento.',
    love: 'El amor es una fuerza poderosa. Compártelo y exprésalo libremente.',
    gratitude: 'La gratitud transforma lo que tenemos en suficiente. Sigue cultivándola.',
    hope: 'La esperanza es el ancla del alma. Mantén viva esa llama interior.',
    frustration: 'La frustración señala que algo es importante para ti. Busca nuevas estrategias.',
    loneliness: 'La soledad es temporal. Conecta con otros o disfruta tu propia compañía.',
  };
  
  return tips[emotion.toLowerCase()] || 'Recuerda que todas las emociones son válidas y temporales.';
};