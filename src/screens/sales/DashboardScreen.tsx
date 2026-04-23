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
import { useAuthStore } from '../../store/authStore';
import { salesAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

export default function SalesDashboardScreen() {
  const { user } = useAuthStore();
  const [shops, setShops] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [shopsData, commissionsData] = await Promise.allSettled([
        salesAPI.getMyShops(),
        salesAPI.getCommissions(),
      ]);
      if (shopsData.status === 'fulfilled') setShops(shopsData.value || []);
      if (commissionsData.status === 'fulfilled') setCommissions(commissionsData.value || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const approvedShops = shops.filter(s => s.approval_status === 'approved').length;
  const pendingShops = shops.filter(s => s.approval_status === 'pending').length;
  const totalEarned = commissions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
  const pendingCommission = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

  const recentShops = shops.slice(0, 5);

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
              <Text style={styles.greeting}>Sales Dashboard</Text>
              <Text style={styles.userName}>{user?.full_name}</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.full_name?.charAt(0).toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.commissionCard}>
            <View style={styles.commissionItem}>
              <Text style={styles.commissionAmount}>£{totalEarned.toFixed(2)}</Text>
              <Text style={styles.commissionLabel}>Total Earned</Text>
            </View>
            <View style={styles.commissionDivider} />
            <View style={styles.commissionItem}>
              <Text style={[styles.commissionAmount, { color: colors.secondaryLight }]}>
                £{pendingCommission.toFixed(2)}
              </Text>
              <Text style={styles.commissionLabel}>Pending</Text>
            </View>
            <View style={styles.commissionDivider} />
            <View style={styles.commissionItem}>
              <Text style={styles.commissionAmount}>{shops.length}</Text>
              <Text style={styles.commissionLabel}>My Shops</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <SectionHeader title="Portfolio Overview" />
          <View style={styles.statsGrid}>
            <StatCard title="Total Shops" value={shops.length} icon="storefront-outline" color={colors.primary} />
            <StatCard title="Approved" value={approvedShops} icon="checkmark-circle-outline" color={colors.success} />
            <StatCard title="Pending" value={pendingShops} icon="time-outline" color={colors.warning} />
            <StatCard
              title="Commission"
              value={`£${totalEarned.toFixed(0)}`}
              icon="cash-outline"
              color={colors.secondary}
            />
          </View>

          <SectionHeader title="Quick Actions" />
          <View style={styles.actionsRow}>
            {[
              { icon: 'add-circle-outline', label: 'Register', color: colors.primary },
              { icon: 'storefront-outline', label: 'My Shops', color: colors.secondary },
              { icon: 'cash-outline', label: 'Commission', color: colors.success },
              { icon: 'person-outline', label: 'Profile', color: colors.accent },
            ].map((action) => (
              <TouchableOpacity key={action.label} style={styles.actionItem} activeOpacity={0.75}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                  <Ionicons name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionHeader title="Recent Shops" onSeeAll={() => {}} />
          {recentShops.length === 0 ? (
            <TouchableOpacity style={[styles.registerCta, shadows.sm]} activeOpacity={0.85}>
              <LinearGradient colors={gradients.primary} style={styles.registerCtaGradient}>
                <Ionicons name="add-circle-outline" size={32} color={colors.white} />
                <Text style={styles.registerCtaTitle}>Register Your First Shop</Text>
                <Text style={styles.registerCtaSubtitle}>Start earning commissions today</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            recentShops.map((shop) => (
              <View key={shop.id} style={[styles.shopItem, shadows.sm]}>
                <View style={styles.shopIcon}>
                  <Ionicons name="storefront" size={20} color={colors.primary} />
                </View>
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{shop.name}</Text>
                  <Text style={styles.shopMeta}>
                    {shop.city || shop.address || 'No location'}
                  </Text>
                </View>
                <StatusBadge status={shop.approval_status} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
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
  commissionCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  commissionItem: { flex: 1, alignItems: 'center' },
  commissionAmount: { ...typography.headlineSmall, color: colors.white },
  commissionLabel: { ...typography.labelSmall, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  commissionDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  body: { padding: spacing.lg, gap: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  actionItem: { alignItems: 'center', gap: spacing.xs, flex: 1 },
  actionIcon: { width: 56, height: 56, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { ...typography.labelSmall, color: colors.textSecondary },
  registerCta: { borderRadius: radius.md, overflow: 'hidden' },
  registerCtaGradient: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  registerCtaTitle: { ...typography.headlineSmall, color: colors.white },
  registerCtaSubtitle: { ...typography.bodyMedium, color: 'rgba(255,255,255,0.8)' },
  shopItem: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  shopIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopInfo: { flex: 1 },
  shopName: { ...typography.titleSmall, color: colors.textPrimary },
  shopMeta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
});
