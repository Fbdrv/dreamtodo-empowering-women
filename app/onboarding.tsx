import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { FocusArea } from '@/types';
import { FOCUS_AREAS, DREAM_SUGGESTIONS } from '@/mocks/data';
import { useApp } from '@/providers/AppProvider';


export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [selectedAreas, setSelectedAreas] = useState<FocusArea[]>([]);
  const [selectedDreams, setSelectedDreams] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (direction: 'forward' | 'back', callback: () => void) => {
    const toValue = direction === 'forward' ? -30 : 30;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === 'forward' ? 30 : -30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 3) {
      animateTransition('forward', () => setStep(s => s + 1));
    } else {
      completeOnboarding(name || 'Friend', selectedAreas, selectedDreams);
      router.replace('/');
    }
  };

  const goBack = () => {
    if (step > 0) {
      animateTransition('back', () => setStep(s => s - 1));
    }
  };

  const toggleArea = (area: FocusArea) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const toggleDream = (dream: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDreams(prev =>
      prev.includes(dream) ? prev.filter(d => d !== dream) : prev.length < 3 ? [...prev, dream] : prev
    );
  };

  const canContinue = () => {
    if (step === 0) return true;
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return selectedAreas.length > 0;
    if (step === 3) return true;
    return true;
  };

  const dreamOptions = selectedAreas.flatMap(area => 
    (DREAM_SUGGESTIONS[area] || []).map(d => d)
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={styles.welcomeIcon}>
              <Sparkles size={40} color={Colors.accent} />
            </View>
            <Text style={styles.welcomeTitle}>From Dreaming{'\n'}to Doing</Text>
            <Text style={styles.welcomeSubtitle}>
              Turn your big dreams into small, daily actions.{'\n'}No pressure. No guilt. Just momentum.
            </Text>
            <View style={styles.philosophyContainer}>
              {[
                'Small actions build confidence',
                'Consistency beats motivation',
                'Restarting is always allowed',
              ].map((text, i) => (
                <View key={i} style={styles.philosophyItem}>
                  <View style={styles.philosophyDot} />
                  <Text style={styles.philosophyText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case 1:
        return (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.stepContent}>
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={styles.stepTitle}>What should we call you?</Text>
            <Text style={styles.stepSubtitle}>We are glad you are here.</Text>
            <TextInput
              testID="name-input"
              style={styles.nameInput}
              placeholder="Your first name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCapitalize="words"
            />
          </KeyboardAvoidingView>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What lights you up?</Text>
            <Text style={styles.stepSubtitle}>Pick the areas you want to focus on.</Text>
            <ScrollView style={styles.areaScroll} contentContainerStyle={styles.areaGrid} showsVerticalScrollIndicator={false}>
              {FOCUS_AREAS.map(area => {
                const isSelected = selectedAreas.includes(area.id);
                return (
                  <TouchableOpacity
                    key={area.id}
                    testID={`area-${area.id}`}
                    style={[styles.areaCard, isSelected && styles.areaCardSelected]}
                    onPress={() => toggleArea(area.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.areaEmoji}>{area.emoji}</Text>
                    <Text style={[styles.areaLabel, isSelected && styles.areaLabelSelected]}>{area.label}</Text>
                    <Text style={styles.areaDesc} numberOfLines={2}>{area.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pick a dream or two</Text>
            <Text style={styles.stepSubtitle}>Choose up to 3 dream goals. You can always change these later.</Text>
            <ScrollView style={styles.dreamScroll} showsVerticalScrollIndicator={false}>
              {dreamOptions.map((dream, i) => {
                const isSelected = selectedDreams.includes(dream);
                return (
                  <TouchableOpacity
                    key={`${dream}-${i}`}
                    testID={`dream-option-${i}`}
                    style={[styles.dreamOption, isSelected && styles.dreamOptionSelected]}
                    onPress={() => toggleDream(dream)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dreamOptionText, isSelected && styles.dreamOptionTextSelected]}>
                      {dream}
                    </Text>
                    {isSelected && (
                      <View style={styles.dreamCheck}>
                        <Text style={styles.dreamCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          {step > 0 ? (
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <ArrowLeft size={20} color={Colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <View style={styles.progressDots}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]}
              />
            ))}
          </View>
          {step === 0 ? (
            <TouchableOpacity onPress={() => {
              completeOnboarding('Friend', [], []);
              router.replace('/');
            }}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <Animated.View
          style={[
            styles.contentContainer,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          {renderStep()}
        </Animated.View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            testID="continue-btn"
            style={[styles.continueBtn, !canContinue() && styles.continueBtnDisabled]}
            onPress={goNext}
            disabled={!canContinue()}
            activeOpacity={0.8}
          >
            <Text style={styles.continueBtnText}>
              {step === 0 ? "Let's Begin" : step === 3 ? "Start My Journey" : "Continue"}
            </Text>
            <ArrowRight size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  progressDots: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  dotDone: {
    backgroundColor: Colors.primaryLight,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContent: {
    flex: 1,
    paddingTop: 20,
  },
  welcomeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: Colors.text,
    lineHeight: 42,
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 36,
  },
  philosophyContainer: {
    gap: 16,
  },
  philosophyItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  philosophyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  philosophyText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  stepEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  areaScroll: {
    flex: 1,
  },
  areaGrid: {
    gap: 12,
    paddingBottom: 20,
  },
  areaCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  areaCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  areaEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  areaLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  areaLabelSelected: {
    color: Colors.primary,
  },
  areaDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dreamScroll: {
    flex: 1,
  },
  dreamOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dreamOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  dreamOptionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  dreamOptionTextSelected: {
    color: Colors.primary,
  },
  dreamCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  dreamCheckText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 12,
  },
  continueBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    paddingVertical: 16,
    gap: 8,
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
