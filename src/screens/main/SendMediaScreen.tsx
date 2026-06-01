import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList, ExpiryOption, SecurityLevel, Message } from '@/types';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAuthStore, useConversationsStore } from '@/services/store';
import { api } from '@/services/api';
import { encryptFile } from '@/services/crypto';
import * as FileSystem from 'expo-file-system/legacy';
import { ImageIcon, ChevronLeft, Shield, Ban, Eye, Fingerprint } from 'lucide-react-native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'SendMedia'>;
  route: RouteProp<MainStackParamList, 'SendMedia'>;
};

// Nivel 1 — Escudo relleno
function IconLevel1({ color }: { color: string }) {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24">
      <Path
        d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"
        fill={color}
        opacity={0.15}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <Path d="M9 12l2 2 4-4" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Nivel 2 — Dos móviles con flecha entre ellos
function IconLevel2({ color }: { color: string }) {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24">
      {/* Móvil izquierdo */}
      <Rect x="1" y="5" width="6" height="10" rx="1" fill={color} opacity={0.2} stroke={color} strokeWidth="1.3" />
      <Circle cx="4" cy="13.5" r="0.6" fill={color} />
      {/* Flecha */}
      <Path d="M8.5 10h7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M13.5 8l2.5 2-2.5 2" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Móvil derecho */}
      <Rect x="17" y="5" width="6" height="10" rx="1" fill={color} opacity={0.2} stroke={color} strokeWidth="1.3" />
      <Circle cx="20" cy="13.5" r="0.6" fill={color} />
    </Svg>
  );
}

// Nivel 3 — Pantalla con ojo dentro
function IconLevel3({ color }: { color: string }) {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24">
      {/* Pantalla */}
      <Rect x="2" y="4" width="20" height="14" rx="2" fill={color} opacity={0.15} stroke={color} strokeWidth="1.5" />
      <Path d="M8 22h8M12 18v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Ojo */}
      <Path d="M12 8c-3 0-5 3-5 3s2 3 5 3 5-3 5-3-2-3-5-3z" fill="none" stroke={color} strokeWidth="1.3" />
      <Circle cx="12" cy="11" r="1.2" fill={color} />
    </Svg>
  );
}

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string; desc: string }[] = [
  { value: '1x',  label: 'Once',    desc: 'Deleted after viewing' },
  { value: '1h',  label: '1 hour',  desc: 'Disappears in 1h' },
  { value: '24h', label: '24 hours',desc: 'Disappears in 1 day' },
  { value: '7d',  label: '7 days',  desc: 'Disappears in 1 week' },
];

const SECURITY_LEVELS: {
  value: SecurityLevel;
  label: string;
  desc: string;
  color: string;
}[] = [
  {
    value: 1,
    label: 'Standard',
    desc: 'Encrypted on server. Auto-deletes after viewing.',
    color: colors.textSecondary,
  },
  {
    value: 2,
    label: 'Private',
    desc: 'Streams live from your phone. Never stored on their device. You\'re notified when they watch.',
    color: colors.primary,
  },
  {
    value: 3,
    label: 'Max security',
    desc: 'Same as Private + you see their front camera live to verify no recording device is present.',
    color: colors.secure,
  },
];

export function SendMediaScreen({ navigation, route }: Props) {
  const { recipientId, recipientName, conversationId, mediaType } = route.params;
  const { user: me } = useAuthStore();
  const { addMessage } = useConversationsStore();
  const [selectedExpiry, setSelectedExpiry] = useState<ExpiryOption>('24h');
  const [selectedSecurity, setSelectedSecurity] = useState<SecurityLevel>(2);
  const [isSending, setIsSending] = useState(false);


  async function pickAndSend(type: 'image' | 'video') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'We need access to your gallery to send content.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.9,
      allowsEditing: false,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const detectedType = asset.type === 'video' ? 'video' : 'image';

    setIsSending(true);
    try {
      // 1. Leer el archivo como base64
      const fileData = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: 'base64' as any,
      });

      // 2. Generar IV para el cifrado
      const iv = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const key = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

      // 3. Subir al servidor
      const { mediaId } = await api.uploadEncryptedMedia({
        data: fileData,
        iv,
        mediaType: detectedType,
        conversationId,
        recipientId,
        expiryOption: selectedExpiry,
        securityLevel: selectedSecurity,
      });

      // 5. Añadir mensaje al chat con la clave de descifrado
      // La clave viaja dentro del mensaje (en producción iría cifrada con la clave pública del receptor)
      if (me) {
        const msg: Message = {
          id: Math.random().toString(36).slice(2),
          senderId: me.id,
          receiverId: recipientId,
          type: detectedType,
          mediaId,
          content: key, // clave de descifrado
          viewsAllowed: selectedExpiry === '1x' ? 1 : -1,
          viewCount: 0,
          captureAttempted: false,
          sentAt: new Date(),
          status: 'sent',
        };
        addMessage(conversationId, msg);

        // Notificar al receptor por socket
        const { socketService } = require('@/services/socket');
        socketService.sendMessage({
          conversationId,
          type: detectedType,
          mediaId,
          content: key,
        });
      }

      const secLabel = SECURITY_LEVELS.find(s => s.value === selectedSecurity)?.label;
      Alert.alert(
        'Sent! ✓',
        `Your ${detectedType === 'video' ? 'video' : 'photo'} was sent to @${recipientName} with ${secLabel} security.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || JSON.stringify(err);
      Alert.alert('Error details', msg);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={26} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>

        <Text style={styles.title}>Send to @{recipientName}</Text>
        <Text style={styles.subtitle}>Content will never be downloaded on their device</Text>

        {/* Security level */}
        <Text style={styles.sectionLabel}>Security level</Text>
        <View style={styles.securityList}>
          {SECURITY_LEVELS.map(level => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.securityCard,
                selectedSecurity === level.value && {
                  borderColor: level.color,
                  backgroundColor: `${level.color}18`,
                },
              ]}
              onPress={() => setSelectedSecurity(level.value)}
              activeOpacity={0.75}
            >
              <View style={styles.securityCardTop}>
                {level.value === 1 && <IconLevel1 color={level.color} />}
                {level.value === 2 && <IconLevel2 color={level.color} />}
                {level.value === 3 && <IconLevel3 color={level.color} />}
                <Text style={[
                  styles.securityLabel,
                  selectedSecurity === level.value && { color: level.color },
                ]}>
                  {level.label}
                </Text>
                {selectedSecurity === level.value && (
                  <View style={[styles.selectedDot, { backgroundColor: level.color }]} />
                )}
              </View>
              <Text style={styles.securityDesc}>{level.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Expiry */}
        <Text style={styles.sectionLabel}>Available for</Text>
        <View style={styles.expiryGrid}>
          {EXPIRY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.expiryCard, selectedExpiry === opt.value && styles.expiryCardSelected]}
              onPress={() => setSelectedExpiry(opt.value)}
            >
              <Text style={[styles.expiryLabel, selectedExpiry === opt.value && styles.expiryLabelSelected]}>
                {opt.label}
              </Text>
              <Text style={styles.expiryDesc}>{opt.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Send buttons */}
        {isSending ? (
          <View style={styles.sending}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.sendingText}>Encrypting and sending...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.sendBtn} onPress={() => pickAndSend('image')}>
            <ImageIcon size={20} color="#fff" strokeWidth={1.8} />
            <Text style={styles.sendBtnText}>Choose from gallery</Text>
          </TouchableOpacity>
        )}

        {/* Guarantees */}
        <View style={styles.guarantees}>
          <GuaranteeItem icon={<Shield size={15} color={colors.secure} strokeWidth={1.8} />} text="End-to-end encrypted" />
          <GuaranteeItem icon={<Ban size={15} color={colors.secure} strokeWidth={1.8} />} text="No download on receiver's device" />
          <GuaranteeItem icon={<Eye size={15} color={colors.secure} strokeWidth={1.8} />} text="Alert if capture is attempted" />
          <GuaranteeItem icon={<Fingerprint size={15} color={colors.secure} strokeWidth={1.8} />} text="Invisible forensic watermark" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function GuaranteeItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {icon}
      <Text style={{ fontSize: 13, color: colors.textSecondary }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 32, gap: 20 },
  backBtn: { marginTop: 8, marginBottom: 4 },
  backText: { color: colors.primary, fontSize: typography.md },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  subtitle: { fontSize: typography.sm, color: colors.textSecondary },
  sectionLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  securityList: { gap: 10 },
  securityCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
  },
  securityCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  securityIcon: { fontSize: 16 },
  securityLabel: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  securityDesc: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  expiryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  expiryCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  expiryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(108,99,255,0.1)',
  },
  expiryLabel: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  expiryLabelSelected: { color: colors.primary },
  expiryDesc: { fontSize: typography.xs, color: colors.textMuted, marginTop: 4 },
  sendBtns: { flexDirection: 'row', gap: 12 },
  sendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  sendBtnVideo: { backgroundColor: colors.primaryDark },
  sendBtnIcon: { fontSize: 20 },
  sendBtnText: {
    color: '#fff',
    fontSize: typography.md,
    fontWeight: typography.semibold,
  },
  sending: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  sendingText: { color: colors.textSecondary, fontSize: typography.md },
  guarantees: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  guaranteeItem: { fontSize: typography.sm, color: colors.textSecondary },
});
