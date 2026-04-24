import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../services/api';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

export default function AdminMoreScreen({ navigation }: any) {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await authAPI.logout();
          clearAuth();
        },
      },
    ]);
  };

  const sections = [
    {
      title: 'Management',
      items: [
        { icon: 'people-outline', label: 'Users', subtitle: 'Manage all user accounts', color: colors.secondary, onPress: () => navigation.navigate('AdminUsers') },
        { icon: 'bar-chart-outline', label: 'Reports', subtitle: 'Ads played & revenue analytics', color: colors.accent, onPress: () => navigation.navigate('Admin', { screen: 'Billing' }) },
        { icon: 'images-outline', label: 'All Content', subtitle: 'Review uploaded content', color: colors.info, onPress: () => navigation.navigate('Admin', { screen: 'Shops' }) },
        { icon: 'people-circle-outline', label: 'Referrals', subtitle: 'Track referral program', color: colors.warning, onPress: () => navigation.navigate('Support') },
      ],
    },
    {
      title: 'System',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', color: colors.info, onPress: () => navigation.navigate('Notifications') },
        { icon: 'settings-outline', label: 'Settings', color: colors.gray[600], onPress: () => navigation.navigate('Profile') },
        { icon: 'help-circle-outline', label: 'Support', color: colors.primary, onPress: () => navigation.navigate('Support') },
      ],
    },
    {
      title: '',
      items: [
        { icon: 'log-out-outline', label: 'Log Out', color: colors.error, onPress: handleLogout, danger: true },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primaryFull} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.full_name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{user?.full_name}</Text>
          <Text style={styles.headerEmail}>{user?.email}</Text>
        </View>
        <View style={styles.rolePill}>
          <Ionicons name="shield-checkmark" size={12} color={colors.white} />
          <Text style={styles.rolePillText}>Admin</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {sections.map((section, si) => (
          <View key={si} style={styles.section}>
            {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}
            <View style={[styles.menuGroup, shadows.sm]}>
              {section.items.map((item: any, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={[styles.menuLabel, item.danger && { color: colors.error }]}>{item.label}</Text>
                    {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
                  </View>
                  {!item.danger && <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <Text style={styles.version}>Ivaa AdSync v1.0.0  ·  Admin</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { ...typography.headlineSmall, color: colors.white },
  headerInfo: { flex: 1 },
  headerName: { ...typography.titleLarge, color: colors.white },
  headerEmail: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  rolePillText: { ...typography.labelSmall, color: colors.white },
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: spacing.sm },
  section: { gap: spacing.xs },
  sectionTitle: { ...typography.labelMedium, color: colors.textTertiary, paddingHorizontal: spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
  menuGroup: { backgroundColor: colors.white, borderRadius: radius.md, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 40, height: 40, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1 },
  menuLabel: { ...typography.titleSmall, color: colors.textPrimary },
  menuSubtitle: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 2 },
  version: { ...typography.bodySmall, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.md },
});
