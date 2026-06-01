import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList, Message } from '@/types';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAuthStore, useConversationsStore } from '@/services/store';
import { socketService } from '@/services/socket';
import { format } from 'date-fns';
import { Video, ImageIcon, ArrowUp, ChevronLeft, Paperclip } from 'lucide-react-native';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Chat'>;
  route: RouteProp<MainStackParamList, 'Chat'>;
};

export function ChatScreen({ navigation, route }: Props) {
  const { conversationId, user } = route.params;
  const { user: me } = useAuthStore();
  const { messages: allMessages, addMessage } = useConversationsStore();
  const messages = allMessages[conversationId] ?? [];
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Conectar socket y escuchar mensajes entrantes
    socketService.connect();
    const unsubscribe = socketService.onMessage((msg: any) => {
      if (msg.conversation_id === conversationId || msg.conversationId === conversationId) {
        const newMsg: Message = {
          id: msg.id,
          senderId: msg.sender_id ?? msg.senderId,
          receiverId: me?.id ?? '',
          type: msg.type ?? 'text',
          content: msg.content,
          mediaId: msg.media_id ?? msg.mediaId,
          viewsAllowed: -1,
          viewCount: 0,
          captureAttempted: false,
          sentAt: new Date(msg.created_at ?? msg.sentAt),
          status: 'delivered',
        };
        addMessage(conversationId, newMsg);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    });
    return () => unsubscribe();
  }, [conversationId]);

  function sendText() {
    if (!text.trim() || !me) return;
    const draft = text.trim();
    setText('');
    // Enviar por socket — el servidor lo devolverá via message_sent
    socketService.sendMessage({
      conversationId,
      content: draft,
      type: 'text',
    });
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function renderMessage({ item }: { item: Message }) {
    const isMine = item.senderId === me?.id;

    if (item.type !== 'text') {
      return (
        <TouchableOpacity
          style={[styles.mediaBubble, isMine && styles.mediaBubbleMine]}
          onPress={() => {
            if (item.mediaId) {
              navigation.navigate('SecureViewer', {
                messageId: item.id,
                mediaId: item.mediaId,
                senderId: item.senderId,
              });
            }
          }}
        >
          <View style={styles.mediaBubbleIcon}>
            {item.type === 'image'
              ? <ImageIcon size={28} color={colors.primary} strokeWidth={1.8} />
              : <Video size={28} color={colors.primary} strokeWidth={1.8} />
            }
          </View>
          <View>
            <Text style={styles.mediaBubbleType}>
              {item.type === 'image' ? 'Private photo' : 'Private video'}
            </Text>
            <Text style={styles.mediaBubbleHint}>
              {item.status === 'viewed' ? '✓ Viewed' :
               item.status === 'expired' ? '⏱ Expired' : 'Tap to view'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
          {item.content}
        </Text>
        <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>
          {format(new Date(item.sentAt), 'HH:mm')}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={26} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{user.displayName}</Text>
          <Text style={styles.headerStatus}>
            {user.isOnline ? '● Online' : 'Offline'}
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.displayName.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        {/* Messages */}
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔒</Text>
            <Text style={styles.emptyText}>
              This conversation is end-to-end encrypted.{'\n'}
              Say hello or send a private video.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />
        )}

        {/* Input bar */}
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.mediaBtn}
            onPress={() => navigation.navigate('SendMedia', {
              recipientId: user.id,
              recipientName: user.displayName,
              conversationId: route.params.conversationId,
            })}
          >
            <ImageIcon size={20} color={colors.textSecondary} strokeWidth={1.8} />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={sendText}
            disabled={!text.trim()}
          >
            <ArrowUp size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  backText: { color: colors.primary, fontSize: typography.xl },
  headerInfo: { flex: 1 },
  headerName: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  headerStatus: { fontSize: typography.xs, color: colors.textMuted },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: typography.md, fontWeight: typography.bold, color: '#fff' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontSize: typography.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageList: { padding: 16, gap: 8, flexGrow: 1 },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
  bubbleTheirs: { alignSelf: 'flex-start' },
  bubbleMine: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  bubbleText: { fontSize: typography.md, color: colors.textPrimary, lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  bubbleTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.6)' },
  mediaBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 14,
    alignSelf: 'flex-start',
    maxWidth: '70%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaBubbleMine: { alignSelf: 'flex-end', borderColor: colors.primary },
  mediaBubbleIcon: { fontSize: 28 },
  mediaBubbleType: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  mediaBubbleHint: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  mediaBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaBtnIcon: { fontSize: 18 },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: typography.md,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendBtnIcon: { color: '#fff', fontSize: 20, fontWeight: typography.bold },
});
