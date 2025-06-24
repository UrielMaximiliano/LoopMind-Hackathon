export type MessageType = 'text' | 'audio' | 'video';

export interface ChatMessage {
    id: string;
    conversation_id: string;
    user_id: string;
    content: string;
    sender: 'user' | 'ai';
    audio_url?: string;
    created_at: string;
    emotionAnalysis?: {
        emotion: string;
        intensity: number;
        tags: string[];
    };
}

export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface UserPreferences {
    id: string;
    user_id: string;
    response_type: 'text' | 'audio' | 'both';
    avatar_mode: boolean;
    created_at: string;
    updated_at: string;
} 