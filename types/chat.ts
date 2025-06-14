export type MessageType = 'text' | 'audio' | 'video';

export interface ChatMessage {
    id: string;
    text?: string;
    sender: 'user' | 'ai';
    audioUrl?: string;
    videoUrl?: string;
    createdAt: string;
    emotionAnalysis?: {
        emotion: string;
        intensity: number;
        tags: string[];
    };
}

export interface UserPreferences {
    id: string;
    user_id: string;
    response_type: 'text' | 'audio' | 'both';
    avatar_mode: boolean;
    created_at: string;
    updated_at: string;
} 