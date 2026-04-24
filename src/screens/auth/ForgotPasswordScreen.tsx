import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { authAPI } from '../../services/api';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.splash} style={StyleSheet.absoluteFillObject} />
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-outline" size={48} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successSubtitle}>
            We've sent a password reset link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.backBtnText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.splash} style={StyleSheet.absoluteFillObject} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <LinearGradient colors={gradients.primary} style={styles.logoGradient}>
                <Ionicons name="lock-open-outline" size={36} color={colors.white} />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>Reset Password</Text>
            <Text style={styles.appTagline}>We'll send a reset link to your email</Text>
          </View>

          <View style={[styles.card, shadows.lg]}>
            <Text style={styles.cardTitle}>Forgot your password?</Text>
            <Text style={styles.cardSubtitle}>Enter your email and we'll send you instructions to reset it.</Text>

            <View style={styles.form}>
              <TextInput
                label="Email address"
                value={email}
                onChangeText={(v) => { setEmail(v); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                mode="outlined"
                left={<TextInput.Icon icon="email-outline" color={colors.primary} />}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                style={styles.input}
                disabled={loading}
                onSubmitEditing={handleSubmit}
                returnKeyType="send"
              />

              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.submitButton, loading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
                  {loading ? (
                    <View style={styles.btnRow}>
                      <Ionicons name="sync" size={18} color={colors.white} />
                      <Text style={styles.submitBtnText}>Sending...</Text>
                    </View>
                  ) : (
                    <View style={styles.btnRow}>
                      <Text style={styles.submitBtnText}>Send Reset Link</Text>
                      <Ionicons name="send-outline" size={18} color={colors.white} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signInLink} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Text style={styles.signInLinkText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0033' },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.xxl },
  backArrow: { marginBottom: spacing.lg, width: 40, height: 40, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: spacing.xxl },
  logoWrapper: { marginBottom: spacing.md, ...shadows.lg },
  logoGradient: {
    width: 80, height: 80, borderRadius: radius.xl,
    justifyContent: 'center', alignItems: 'center',
  },
  appName: { ...typography.displaySmall, color: colors.white, letterSpacing: 0.5 },
  appTagline: { ...typography.bodyMedium, color: 'rgba(255,255,255,0.6)', marginTop: spacing.xs },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.xl },
  cardTitle: { ...typography.headlineMedium, color: colors.textPrimary, marginBottom: spacing.xs },
  cardSubtitle: { ...typography.bodyMedium, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 22 },
  form: { gap: spacing.md },
  input: { backgroundColor: colors.white },
  errorContainer: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.errorFaint, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  errorText: { ...typography.bodySmall, color: colors.error, flex: 1 },
  submitButton: { borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.xs, ...shadows.md },
  submitGradient: { paddingVertical: spacing.md + 2, alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  submitBtnText: { ...typography.titleLarge, color: colors.white },
  signInLink: { alignItems: 'center', paddingVertical: spacing.sm },
  signInLinkText: { ...typography.bodyMedium, color: colors.primary },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
  successIcon: {
    width: 100, height: 100, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  successTitle: { ...typography.displaySmall, color: colors.white, textAlign: 'center' },
  successSubtitle: { ...typography.bodyLarge, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 26 },
  emailHighlight: { color: colors.accent, fontWeight: '600' },
  backBtn: {
    backgroundColor: colors.white, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md, borderRadius: radius.full, marginTop: spacing.sm,
  },
  backBtnText: { ...typography.titleMedium, color: colors.primary },
});
