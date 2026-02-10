import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { X, Crown, Heart, Shield, Sparkles } from 'lucide-react-native';
import { useColors } from '@/providers/ThemeProvider';
import { ThemeColors } from '@/constants/colors';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const BENEFITS = [
  { icon: 'heart', label: 'Gentle Mode for low-energy days' },
  { icon: 'shield', label: 'Rest days that protect your streaks' },
  { icon: 'sparkles', label: 'Supportive wellness features' },
];

export default function PaywallModal({ visible, onClose, onSubscribe }: PaywallModalProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderIcon = (name: string) => {
    const iconColor = colors.primary;
    const size = 20;
    switch (name) {
      case 'heart': return <Heart size={size} color={iconColor} />;
      case 'shield': return <Shield size={size} color={iconColor} />;
      case 'sparkles': return <Sparkles size={size} color={iconColor} />;
      default: return null;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={() => {}}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.crownCircle}>
            <Crown size={32} color={colors.accent} />
          </View>

          <Text style={styles.title}>Unlock Premium</Text>
          <Text style={styles.subtitle}>
            Take care of yourself with features designed for your wellbeing.
          </Text>

          <View style={styles.benefitsList}>
            {BENEFITS.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  {renderIcon(b.icon)}
                </View>
                <Text style={styles.benefitText}>{b.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.priceAmount}>$4.99</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>

          <TouchableOpacity style={styles.subscribeBtn} onPress={onSubscribe} activeOpacity={0.8}>
            <Text style={styles.subscribeBtnText}>Start Free Trial</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Cancel anytime. No commitment required.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center' as const,
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    zIndex: 1,
  },
  crownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  benefitsList: {
    width: '100%',
    gap: 14,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
    flex: 1,
  },
  priceCard: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    marginBottom: 20,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.text,
  },
  pricePeriod: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textMuted,
    marginLeft: 2,
  },
  subscribeBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  subscribeBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.white,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center' as const,
  },
});
