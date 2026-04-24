import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import api from '../../services/api';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

const TOPICS = ['General Enquiry', 'Technical Issue', 'Billing', 'Content Upload', 'Screen Problem', 'Other'];

export default function SupportScreen({ navigation }: any) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Missing Message', 'Please describe your issue.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/inquiries', { subject: topic, message: message.trim() });
      setSent(true);
    } catch {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.primaryFull} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support</Text>
          <View style={{ width: 38 }} />
        </LinearGradient>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Message Sent!</Text>
          <Text style={styles.successSubtitle}>Our team will get back to you within 24 hours.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <LinearGradient colors={gradients.primary} style={styles.doneBtnGradient}>
              <Text style={styles.doneBtnText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primaryFull} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('mailto:support@ivaamedia.uk')} activeOpacity={0.8}>
              <View style={[styles.contactIcon, { backgroundColor: colors.infoFaint }]}>
                <Ionicons name="mail-outline" size={22} color={colors.info} />
              </View>
              <Text style={styles.contactLabel}>Email Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('tel:+441234567890')} activeOpacity={0.8}>
              <View style={[styles.contactIcon, { backgroundColor: colors.successFaint }]}>
                <Ionicons name="call-outline" size={22} color={colors.success} />
              </View>
              <Text style={styles.contactLabel}>Call Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('https://ivaamedia.uk')} activeOpacity={0.8}>
              <View style={[styles.contactIcon, { backgroundColor: colors.primaryFaint }]}>
                <Ionicons name="globe-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.contactLabel}>Website</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Send a Message</Text>

          <View style={[styles.formCard, shadows.sm]}>
            <Text style={styles.fieldLabel}>Topic</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicScroll} contentContainerStyle={styles.topicContent}>
              {TOPICS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.topicChip, topic === t && styles.topicChipActive]}
                  onPress={() => setTopic(t)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.topicChipText, topic === t && styles.topicChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.divider} />

            <Text style={styles.fieldLabel}>Your Message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Describe your issue in detail..."
              placeholderTextColor={colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
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
                  <Ionicons name="send-outline" size={18} color={colors.white} />
                  <Text style={styles.submitBtnText}>Send Message</Text>
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
  contactRow: { flexDirection: 'row', gap: spacing.sm },
  contactItem: { flex: 1, alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs, ...shadows.sm },
  contactIcon: { width: 48, height: 48, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' },
  contactLabel: { ...typography.labelMedium, color: colors.textSecondary },
  sectionTitle: { ...typography.titleLarge, color: colors.textPrimary },
  formCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  fieldLabel: { ...typography.labelMedium, color: colors.textSecondary },
  topicScroll: { marginHorizontal: -spacing.md },
  topicContent: { paddingHorizontal: spacing.md, gap: spacing.xs },
  topicChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.gray[100] },
  topicChipActive: { backgroundColor: colors.primary },
  topicChipText: { ...typography.labelMedium, color: colors.textSecondary },
  topicChipTextActive: { color: colors.white },
  divider: { height: 1, backgroundColor: colors.border },
  messageInput: {
    ...typography.bodyMedium, color: colors.textPrimary,
    minHeight: 120, paddingVertical: spacing.sm,
  },
  submitBtn: { borderRadius: radius.md, overflow: 'hidden' },
  submitBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  submitBtnText: { ...typography.titleMedium, color: colors.white },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
  successIcon: { width: 100, height: 100, borderRadius: radius.full, backgroundColor: colors.successFaint, justifyContent: 'center', alignItems: 'center' },
  successTitle: { ...typography.headlineMedium, color: colors.textPrimary },
  successSubtitle: { ...typography.bodyLarge, color: colors.textSecondary, textAlign: 'center' },
  doneBtn: { borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.sm },
  doneBtnGradient: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md },
  doneBtnText: { ...typography.titleMedium, color: colors.white },
});
