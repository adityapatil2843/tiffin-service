import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../../src/theme';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuthStore();

  const [loginType, setLoginType] = useState('userId'); // 'userId' or 'email'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!identifier.trim()) e.identifier = loginType === 'userId' ? 'User ID is required' : 'Email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const payload = loginType === 'userId'
      ? { userId: identifier.trim(), password }
      : { email: identifier.trim().toLowerCase(), password };

    const result = await login(payload);

    if (result.success) {
      Toast.show({ type: 'success', text1: 'Welcome back! 👋', text2: 'Login successful' });
      
      // Route based on role
      if (result.role === 'superAdmin') router.replace('/(super-admin)/(tabs)/dashboard');
      else if (result.role === 'owner') router.replace('/(owner)/(tabs)/dashboard');
      else router.replace('/(user)/(tabs)/home');
    } else {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: result.message });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background gradient blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + Branding */}
          <View style={styles.headerSection}>
            <LinearGradient
              colors={theme.colors.primary.gradient}
              style={styles.logoContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoEmoji}>🍱</Text>
            </LinearGradient>
            <Text style={styles.appName}>TFNS</Text>
            <Text style={styles.tagline}>Premium Tiffin Management</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Access your tiffin dashboard</Text>

            {/* Toggle: User ID vs Email */}
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, loginType === 'userId' && styles.toggleActive]}
                onPress={() => { setLoginType('userId'); setIdentifier(''); setErrors({}); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, loginType === 'userId' && styles.toggleTextActive]}>
                  User ID
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, loginType === 'email' && styles.toggleActive]}
                onPress={() => { setLoginType('email'); setIdentifier(''); setErrors({}); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, loginType === 'email' && styles.toggleTextActive]}>
                  Email
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Fields */}
            <View style={styles.fields}>
              <Input
                label={loginType === 'userId' ? 'User ID' : 'Email Address'}
                value={identifier}
                onChangeText={setIdentifier}
                placeholder={loginType === 'userId' ? 'e.g. AP0001 or admin' : 'your@email.com'}
                keyboardType={loginType === 'email' ? 'email-address' : 'default'}
                autoCapitalize={loginType === 'userId' ? 'characters' : 'none'}
                error={errors.identifier}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password}
              />
            </View>

            <Button
              title={isLoading ? '' : 'Sign In'}
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
              style={styles.loginBtn}
            />

            <Text style={styles.hint}>
              Contact your service owner or admin{'\n'}if you forgot your credentials.
            </Text>
          </View>

          <Text style={styles.footer}>TFNS • Tiffin Management System</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  blobTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: theme.colors.primary.main + '18',
  },
  blobBottom: {
    position: 'absolute',
    bottom: -60,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.secondary.main + '14',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[8],
    gap: theme.spacing[6],
  },
  headerSection: {
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
    ...theme.shadow.glow,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size['3xl'],
    color: theme.colors.textPrimary,
    letterSpacing: 3,
  },
  tagline: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.base,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[6],
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing[4],
    ...theme.shadow.lg,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size['2xl'],
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.base,
    color: theme.colors.textMuted,
    marginTop: -theme.spacing[2],
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: theme.colors.primary.main,
  },
  toggleText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
  },
  toggleTextActive: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  fields: {
    gap: theme.spacing[4],
  },
  loginBtn: {
    marginTop: theme.spacing[2],
  },
  hint: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
