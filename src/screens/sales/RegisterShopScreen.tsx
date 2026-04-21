import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { salesAPI } from '../../services/api';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

type Field = {
  key: string;
  label: string;
  placeholder: string;
  icon: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  required?: boolean;
};

const FIELDS: Field[] = [
  { key: 'name', label: 'Shop Name', placeholder: 'Enter shop name', icon: 'storefront-outline', required: true },
  { key: 'owner_name', label: "Owner's Name", placeholder: 'Full name', icon: 'person-outline', required: true },
  { key: 'email', label: 'Email Address', placeholder: 'shop@example.com', icon: 'mail-outline', keyboardType: 'email-address', required: true },
  { key: 'phone', label: 'Phone Number', placeholder: '+44 0000 000000', icon: 'call-outline', keyboardType: 'phone-pad' },
  { key: 'address', label: 'Street Address', placeholder: 'Street address', icon: 'location-outline' },
  { key: 'city', label: 'City', placeholder: 'City', icon: 'map-outline' },
  { key: 'postcode', label: 'Postcode', placeholder: 'Postcode', icon: 'navigate-outline' },
  { key: 'website', label: 'Website', placeholder: 'https://example.com', icon: 'globe-outline', keyboardType: 'url' },
  { key: 'notes', label: 'Additional Notes', placeholder: 'Any additional information...', icon: 'document-text-outline', multiline: true },
];

export default function RegisterShopScreen() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!form.name?.trim() || !form.owner_name?.trim() || !form.email?.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await salesAPI.registerShop(form);
      setSubmitted(true);
      setForm({});
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to register shop';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.primaryFull} style={styles.successBg}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Shop Registered!</Text>
          <Text style={styles.successSubtitle}>
            The shop has been submitted and is pending admin approval.
          </Text>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => setSubmitted(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.successBtnText}>Register Another</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>Register Shop</Text>
        <Text style={styles.headerSubtitle}>Submit a new shop for approval</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.formCard, shadows.sm]}>
            {FIELDS.map((field, i) => (
              <View key={field.key} style={[styles.fieldGroup, i < FIELDS.length - 1 && styles.fieldBorder]}>
                <Text style={styles.fieldLabel}>
                  {field.label}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
                <View style={styles.inputRow}>
                  <Ionicons name={field.icon as any} size={18} color={colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, field.multiline && styles.inputMultiline]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textTertiary}
                    value={form[field.key] || ''}
                    onChangeText={val => setForm(prev => ({ ...prev, [field.key]: val }))}
                    keyboardType={field.keyboardType || 'default'}
                    autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'words'}
                    multiline={field.multiline}
                    numberOfLines={field.multiline ? 3 : 1}
                    textAlignVertical={field.multiline ? 'top' : 'center'}
                  />
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient colors={gradients.primary} style={styles.submitBtnGradient}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
                  <Text style={styles.submitBtnText}>Submit Registration</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Shops will be reviewed by an admin before activation.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  headerTitle: { ...typography.headlineMedium, color: colors.white },
  headerSubtitle: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: spacing.md },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  fieldGroup: { padding: spacing.md },
  fieldBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  fieldLabel: { ...typography.labelMedium, color: colors.textSecondary, marginBottom: spacing.xs },
  required: { color: colors.error },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  inputMultiline: {
    minHeight: 60,
    paddingTop: 4,
  },
  submitBtn: { borderRadius: radius.md, overflow: 'hidden' },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  submitBtnText: { ...typography.titleMedium, color: colors.white },
  disclaimer: { ...typography.bodySmall, color: colors.textTertiary, textAlign: 'center' },
  successBg: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: { ...typography.displaySmall, color: colors.white, textAlign: 'center' },
  successSubtitle: { ...typography.bodyLarge, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  successBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  successBtnText: { ...typography.titleMedium, color: colors.primary },
});
