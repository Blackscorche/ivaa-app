import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Linking } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { ownerAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

export default function OwnerDashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [shop, setShop] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [shopData, contentData, creditData] = await Promise.allSettled([
        ownerAPI.getShop(),
        ownerAPI.getContent(),
        ownerAPI.getCreditBalance(),
      ]);
      if (shopData.status === 'fulfilled') setShop(shopData.value);
      if (contentData.status === 'fulfilled') setContent(contentData.value || []);
      if (creditData.status === 'fulfilled') setCreditBalance(creditData.value?.credit_balance || 0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const stats = {
    total: content.length,
    published: content.filter(c => c.status === 'published').length,
    pending: content.filter(c => c.status === 'pending').length,
    inDesign: content.filter(c => ['in_design', 'designed'].includes(c.status)).length,
  };

  const recentContent = content.slice(0, 5);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={gradients.splash} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <LinearGradient colors={gradients.primaryFull} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good {getTimeOfDay()} 👋</Text>
              <Text style={styles.userName}>{user?.full_name}</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {shop && (
            <View style={styles.shopCard}>
              <View style={styles.shopCardLeft}>
                <View style={styles.shopIconContainer}>
                  <Ionicons name="storefront" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shopName}>{shop.name}</Text>
                  <Text style={styles.shopAddress} numberOfLines={1}>
                    {shop.address || shop.city || 'No address set'}
                  </Text>
                </View>
              </View>
              <StatusBadge status={shop.payment_status || 'active'} />
            </View>
          )}

          <View style={styles.creditCard}>
            <View style={styles.creditLeft}>
              <Ionicons name="wallet-outline" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.creditLabel}>Credit Balance</Text>
            </View>
            <View style={styles.creditRight}>
              <Text style={styles.creditAmount}>£{creditBalance.toFixed(2)}</Text>
              <TouchableOpacity style={styles.topUpButton} activeOpacity={0.8} onPress={() => Linking.openURL('https://ivaamedia.uk/topup')}>
                <Ionicons name="add" size={14} color={colors.primary} />
                <Text style={styles.topUpText}>Top Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <SectionHeader title="Content Overview" />
          <View style={styles.statsGrid}>
            <StatCard title="Total" value={stats.total} icon="images-outline" color={colors.primary} />
            <StatCard title="Published" value={stats.published} icon="checkmark-circle-outline" color={colors.success} />
            <StatCard title="In Design" value={stats.inDesign} icon="brush-outline" color={colors.warning} />
            <StatCard title="Pending" value={stats.pending} icon="time-outline" color={colors.info} />
          </View>

          <SectionHeader title="Quick Actions" />
          <View style={styles.actionsRow}>
            {[
              { icon: 'cloud-upload-outline', label: 'Upload', color: colors.primary, screen: 'Content' },
              { icon: 'tv-outline', label: 'Screens', color: colors.secondary, screen: 'Screens' },
              { icon: 'people-outline', label: 'Referral', color: colors.accent, screen: 'More' },
              { icon: 'card-outline', label: 'Billing', color: colors.success, screen: 'Billing' },
            ].map((action) => (
              <TouchableOpacity key={action.label} style={styles.actionItem} activeOpacity={0.75} onPress={() => navigation.navigate(action.screen)}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                  <Ionicons name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionHeader title="Recent Content" onSeeAll={() => navigation.navigate('Content')} />
          {recentContent.length === 0 ? (
            <View style={[styles.emptyCard, shadows.sm]}>
              <Ionicons name="images-outline" size={40} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No content yet</Text>
              <Text style={styles.emptySubtitle}>Upload your first content to get started</Text>
            </View>
          ) : (
            recentContent.map((item) => (
              <View key={item.id} style={[styles.contentItem, shadows.sm]}>
                <View style={styles.contentIcon}>
                  <Ionicons
                    name={item.file_type === 'video' ? 'videocam-outline' : 'image-outline'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.contentInfo}>
                  <Text style={styles.contentName} numberOfLines={1}>
                    {item.original_filename}
                  </Text>
                  <Text style={styles.contentDate}>
                    {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { ...typography.bodyMedium, color: 'rgba(255,255,255,0.75)' },
  userName: { ...typography.headlineMedium, color: colors.white, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { ...typography.titleLarge, color: colors.white },
  shopCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shopCardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  shopIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopName: { ...typography.titleMedium, color: colors.textPrimary },
  shopAddress: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  creditCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  creditLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  creditLabel: { ...typography.bodyMedium, color: 'rgba(255,255,255,0.8)' },
  creditRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  creditAmount: { ...typography.headlineSmall, color: colors.white },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  topUpText: { ...typography.labelSmall, color: colors.primary },
  body: { padding: spacing.lg, gap: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  actionItem: { alignItems: 'center', gap: spacing.xs, flex: 1 },
  actionIcon: { width: 56, height: 56, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { ...typography.labelSmall, color: colors.textSecondary },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.titleMedium, color: colors.textSecondary },
  emptySubtitle: { ...typography.bodySmall, color: colors.textTertiary, textAlign: 'center' },
  contentItem: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  contentIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: { flex: 1 },
  contentName: { ...typography.titleSmall, color: colors.textPrimary },
  contentDate: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 2 },
});
