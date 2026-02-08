import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { ThemeColors } from '@/constants/colors';

type Mode = 'login' | 'register';

export default function LoginScreen() {
  const { login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
  const colors = useColors();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const isLoading = isLoggingIn || isRegistering;
  const serverError = mode === 'login' ? loginError : registerError;

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalError(null);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: newMode === 'register' ? -20 : 20, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setMode(newMode);
      slideAnim.setValue(newMode === 'register' ? 20 : -20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  };

  const validate = (): boolean => {
    if (!email.trim()) {
      setLocalError('Please enter your email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setLocalError('Please enter a valid email');
      return false;
    }
    if (mode === 'register' && !username.trim()) {
      setLocalError('Please enter a username');
      return false;
    }
    if (mode === 'register' && username.trim().length < 2) {
      setLocalError('Username must be at least 2 characters');
      return false;
    }
    if (!password) {
      setLocalError('Please enter your password');
      return false;
    }
    if (mode === 'register' && password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLocalError(null);
    if (!validate()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), username.trim(), password);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      console.log('[login] Error:', msg);
      Alert.alert('Oops', msg);
    }
  };

  const displayError = localError || serverError;

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Sparkles size={32} color={colors.accent} />
              </View>
              <Text style={styles.appTitle}>From Dreaming{'\n'}to Doing</Text>
              <Text style={styles.appSubtitle}>
                Your momentum starts here
              </Text>
            </View>

            <View style={styles.tabRow}>
              <TouchableOpacity
                testID="login-tab"
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => switchMode('login')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="register-tab"
                style={[styles.tab, mode === 'register' && styles.tabActive]}
                onPress={() => switchMode('register')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            <Animated.View
              style={[
                styles.formContainer,
                { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
              ]}
            >
              {displayError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{displayError}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    testID="email-input"
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={(t) => { setEmail(t); setLocalError(null); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>

                {mode === 'register' && (
                  <View style={styles.inputWrapper}>
                    <User size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      testID="username-input"
                      style={styles.input}
                      placeholder="Username"
                      placeholderTextColor={colors.textMuted}
                      value={username}
                      onChangeText={(t) => { setUsername(t); setLocalError(null); }}
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>
                )}

                <View style={styles.inputWrapper}>
                  <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    testID="password-input"
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setLocalError(null); }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textMuted} />
                    ) : (
                      <Eye size={18} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                testID="submit-btn"
                style={[styles.submitBtn, isLoading && styles.submitBtnLoading]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Text>
                    <ArrowRight size={18} color={colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
              </Text>
              <TouchableOpacity
                onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}
              >
                <Text style={styles.footerLink}>
                  {mode === 'login' ? 'Create one' : 'Sign in'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardAlt,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.text,
  },
  formContainer: {
    gap: 20,
  },
  errorBanner: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
    height: '100%' as unknown as number,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeBtn: {
    position: 'absolute' as const,
    right: 16,
    height: '100%' as unknown as number,
    justifyContent: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingVertical: 16,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnLoading: {
    opacity: 0.8,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
  },
});
