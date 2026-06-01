// ─── Tipos globales de PrivateSnap ───────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: Date;
  isVerified: boolean; // Verificación de edad completada
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  type: 'text' | 'image' | 'video';
  content?: string;        // Solo para mensajes de texto
  mediaId?: string;        // ID del contenido multimedia en el servidor
  expiresAt?: Date;        // Cuándo se auto-destruye
  viewsAllowed: number;    // -1 = ilimitado, 1 = una sola vez
  viewCount: number;
  captureAttempted: boolean; // Si el receptor intentó capturar
  sentAt: Date;
  viewedAt?: Date;
  status: 'sending' | 'sent' | 'delivered' | 'viewed' | 'expired';
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

export interface SecureMedia {
  id: string;
  uploaderId: string;
  type: 'image' | 'video';
  durationSeconds?: number;  // Solo para vídeos
  sizeBytes: number;
  watermarkUserId: string;   // ID del destinatario incrustado en la marca de agua
  streamUrl?: string;        // URL firmada y efímera (válida 30s)
  expiresAt: Date;
  createdAt: Date;
}

export type ExpiryOption = '1x' | '1h' | '24h' | '7d';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Tipos de navegación ──────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

// Niveles de seguridad
export type SecurityLevel = 1 | 2 | 3;

export type MainTabParamList = {
  Conversations: undefined;
  Camera: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  Chat: { conversationId: string; user: User };
  SecureViewer: { messageId: string; mediaId: string; senderId: string; decryptionKey?: string };
  SendMedia: { recipientId: string; recipientName: string; conversationId: string; mediaType?: 'image' | 'video' };
  UserProfile: { userId: string };
};
