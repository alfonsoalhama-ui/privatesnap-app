import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://sunny-stillness-production-dc44.up.railway.app';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Añadir token a cada petición
    this.client.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Manejo de errores global
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await SecureStore.deleteItemAsync('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  // ─── Auth ────────────────────────────────────────────────────────────────

  async register(username: string, password: string) {
    const res = await this.client.post('/auth/register', { username, password });
    if (res.data.token) await SecureStore.setItemAsync('auth_token', res.data.token);
    return res.data;
  }

  async login(username: string, password: string) {
    const res = await this.client.post('/auth/login', { username, password });
    if (res.data.token) await SecureStore.setItemAsync('auth_token', res.data.token);
    return res.data;
  }

  async findUser(username: string) {
    const res = await this.client.get(`/auth/user/${username}`);
    return res.data;
  }

  // ─── Conversaciones ──────────────────────────────────────────────────────

  async startConversation(username: string) {
    const res = await this.client.post('/conversations/start', { username });
    return res.data;
  }

  async getConversations() {
    const res = await this.client.get('/conversations');
    return res.data;
  }

  async getMessages(conversationId: string) {
    const res = await this.client.get(`/conversations/${conversationId}/messages`);
    return res.data;
  }

  async sendTextMessage(conversationId: string, content: string) {
    const res = await this.client.post(`/conversations/${conversationId}/messages`, { content });
    return res.data;
  }

  // ─── Media cifrada ───────────────────────────────────────────────────────

  async uploadEncryptedMedia(params: {
    data: string;       // base64 del archivo cifrado
    iv: string;         // vector de inicialización
    mediaType: 'image' | 'video';
    conversationId: string;
    recipientId: string;
    expiryOption: string;
    securityLevel: number;
  }) {
    const res = await this.client.post('/media/upload', params);
    return res.data as { mediaId: string };
  }

  async downloadEncryptedMedia(mediaId: string) {
    const res = await this.client.get(`/media/${mediaId}`);
    return res.data as { data: string; iv: string; mediaType: string };
  }
}

export const api = new ApiService();
