import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

export default function ProfileScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Too Short', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel: Record<string, string> = {
    owner: 'Shop Owner',
    admin: 'Administrator',
    sales: 'Sales Representative',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primaryFull} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.full_name?.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.userName}>{user?.full_name}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{roleLabel[user?.role || ''] || user?.role}</Text>
            </View>
          </View>

          <View style={[styles.infoCard, shadows.sm]}>
            {[
              { icon: 'person-outline', label: 'Full Name', value: user?.full_name },
              { icon: 'mail-outline', label: 'Email', value: user?.email },
              { icon: 'shield-outline', label: 'Role', value: roleLabel[user?.role || ''] || user?.role },
            ].map((row, i) => (
              <View key={i} style={[styles.infoRow, i < 2 && styles.infoRowBorder]}>
                <View style={styles.infoIconBox}>
                  <Ionicons name={row.icon as any} size={18} color={colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value || '—'}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Change Password</Text>

          <View style={[styles.passwordCard, shadows.sm]}>
            <View style={styles.passwordField}>
              <Text style={styles.fieldLabel}>Current Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textTertiary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrent}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.passwordField, styles.fieldBorder]}>
              <Text style={styles.fieldLabel}>New Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="At least 8 characters"
                  placeholderTextColor={colors.textTertiary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.passwordField, styles.fieldBorder]}>
              <Text style={styles.fieldLabel}>Confirm New Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Repeat new password"
                  placeholderTextColor={colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.changeBtn, loading && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient colors={gradients.primary} style={styles.changeBtnGradient}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.white} />
                  <Text style={styles.changeBtnText}>Update Password</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.lg,
  },
  backBtn: { width: 38, height: 38, justifyContent: 'center' },
  headerTitle: { ...typography.headlineSmall, color: colors.white },
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: spacing.md },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  avatar: {
    width: 80, height: 80, borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    ...shadows.md,
  },
  avatarText: { ...typography.displaySmall, color: colors.white },
  userName: { ...typography.headlineSmall, color: colors.textPrimary },
  rolePill: {
    backgroundColor: colors.primaryFaint, paddingHorizontal: spacing.md,
    paddingVertical: 5, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.borderStrong,
  },
  rolePillText: { ...typography.labelMedium, color: colors.primary },
  infoCard: { backgroundColor: colors.white, borderRadius: radius.md, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoIconBox: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: colors.primaryFaint, justifyContent: 'center', alignItems: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: { ...typography.labelSmall, color: colors.textTertiary },
  infoValue: { ...typography.titleSmall, color: colors.textPrimary, marginTop: 2 },
  sectionTitle: { ...typography.titleLarge, color: colors.textPrimary },
  passwordCard: { backgroundColor: colors.white, borderRadius: radius.md, overflow: 'hidden' },
  passwordField: { padding: spacing.md },
  fieldBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  fieldLabel: { ...typography.labelMedium, color: colors.textSecondary, marginBottom: spacing.xs },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, ...typography.bodyMedium, color: colors.textPrimary, paddingVertical: 0 },
  changeBtn: { borderRadius: radius.md, overflow: 'hidden' },
  changeBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  changeBtnText: { ...typography.titleMedium, color: colors.white },
});
