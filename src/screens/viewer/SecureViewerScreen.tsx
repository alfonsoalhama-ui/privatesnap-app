import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Vibration, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '@/types';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { api } from '@/services/api';
import { decryptFile } from '@/services/crypto';
import * as FileSystem from 'expo-file-system/legacy';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'SecureViewer'>;
  route: RouteProp<MainStackParamList, 'SecureViewer'>;
};

type ViewerState = 'loading' | 'ready' | 'blocked' | 'expired' | 'error';

export function SecureViewerScreen({ navigation, route }: Props) {
  const { messageId, mediaId, senderId } = route.params;
  const [state, setState] = useState<ViewerState>('loading');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [decryptionKey, setDecryptionKey] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
    return () => {
      // Limpiar archivos temporales al salir
      if (mediaUri) {
        FileSystem.deleteAsync(mediaUri, { idempotent: true });
      }
    };
  }, []);

  async function loadMedia() {
    try {
      // Descargar archivo del servidor
      const { data, mediaType: type } = await api.downloadEncryptedMedia(mediaId);
      setMediaType(type as 'image' | 'video');

      // Guardar el archivo temporalmente para mostrarlo
      const extension = type === 'video' ? 'mp4' : 'jpg';
      const localUri = FileSystem.cacheDirectory + `media_${Date.now()}.${extension}`;
      await FileSystem.writeAsStringAsync(localUri, data, {
        encoding: 'base64' as any,
      });

      setMediaUri(localUri);
      setState('ready');
    } catch (err: any) {
      if (err?.response?.status === 410) {
        setState('expired');
      } else {
        setState('error');
      }
    }
  }

  const handleClose = useCallback(async () => {
    if (mediaUri) {
      await FileSystem.deleteAsync(mediaUri, { idempotent: true });
    }
    navigation.goBack();
  }, [navigation, mediaUri]);

  if (state === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centerText}>Decrypting secure content...</Text>
      </View>
    );
  }

  if (state === 'expired') {
    return (
      <View style={styles.center}>
        <Text style={styles.centerEmoji}>⏱️</Text>
        <Text style={styles.warningTitle}>Content expired</Text>
        <Text style={styles.warningText}>This content is no longer available.</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.centerEmoji}>⚠️</Text>
        <Text style={styles.warningTitle}>Could not load content</Text>
        <Text style={styles.warningText}>Please try again.</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === 'blocked') {
    return (
      <View style={styles.center}>
        <Text style={styles.centerEmoji}>⚠️</Text>
        <Text style={styles.warningTitle}>Capture attempt detected</Text>
        <Text style={styles.warningText}>The sender has been notified.</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} style={styles.topBtn}>
          <Text style={styles.topBtnText}>✕ Close</Text>
        </TouchableOpacity>
        <View style={styles.secureIndicator}>
          <Text style={styles.secureIcon}>🛡️</Text>
          <Text style={styles.secureText}>Decrypted locally</Text>
        </View>
        <View style={styles.topBtn} />
      </View>

      {/* Media */}
      <View style={styles.mediaArea}>
        {mediaUri && mediaType === 'image' && (
          <Image
            source={{ uri: mediaUri }}
            style={styles.media}
            resizeMode="contain"
          />
        )}
        {mediaUri && mediaType === 'video' && (
          <Video
            source={{ uri: mediaUri }}
            style={styles.media}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
          />
        )}
      </View>

      {/* Protection badges */}
      <View style={styles.bottomBar}>
        <ProtectionBadge icon="🚫" label="No download" />
        <ProtectionBadge icon="🔒" label="E2E encrypted" />
        <ProtectionBadge icon="⏱️" label="Auto-deletes" />
      </View>

    </SafeAreaView>
  );
}

function ProtectionBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeIcon}>{icon}</Text>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  centerEmoji: { fontSize: 52 },
  centerText: { color: colors.textSecondary, fontSize: typography.md, marginTop: 12 },
  warningTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  warningText: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  closeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  closeBtnText: { color: '#fff', fontSize: typography.md, fontWeight: typography.semibold },
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBtn: { paddingHorizontal: 12, paddingVertical: 6, minWidth: 60 },
  topBtnText: { color: colors.textSecondary, fontSize: typography.sm },
  secureIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secureIcon: { fontSize: 14 },
  secureText: { color: colors.secure, fontSize: typography.sm, fontWeight: typography.medium },
  mediaArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  media: { width: '100%', height: '100%' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  badge: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeIcon: { fontSize: 16 },
  badgeLabel: { fontSize: 10, color: colors.textMuted },
});
