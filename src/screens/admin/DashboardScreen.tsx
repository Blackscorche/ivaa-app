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
import { adminAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import SectionHeader from '../../components/common/SectionHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

export default function AdminDashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [screens, setScreens] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, screensData, shopsData] = await Promise.allSettled([
        adminAPI.getMonitoringStats(),
        adminAPI.getMonitoring(),
        adminAPI.getShops(),
      ]);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (screensData.status === 'fulfilled') setScreens(screensData.value || []);
      if (shopsData.status === 'fulfilled') setShops(shopsData.value || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const pendingShops = shops.filter(s => s.approval_status === 'pending').length;
  const recentScreens = screens.slice(0, 5);

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
              <Text style={styles.greeting}>Admin Panel</Text>
              <Text style={styles.userName}>{user?.full_name}</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.full_name?.charAt(0).toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <Text style={styles.pillText}>{stats?.online || 0} Online</Text>
            </View>
            <View style={styles.pill}>
              <View style={[styles.dot, { backgroundColor: colors.error }]} />
              <Text style={styles.pillText}>{stats?.offline || 0} Offline</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.pillText}>{pendingShops} Pending</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <SectionHeader title="Overview" />
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Shops"
              value={shops.length}
              icon="storefront-outline"
              color={colors.primary}
            />
            <StatCard
              title="Total Screens"
              value={stats?.total_screens || 0}
              icon="tv-outline"
              color={colors.info}
            />
            <StatCard
              title="Online Now"
              value={stats?.online || 0}
              icon="wifi-outline"
              color={colors.success}
            />
            <StatCard
              title="Pending Approval"
              value={pendingShops}
              icon="hourglass-outline"
              color={colors.warning}
            />
          </View>

          <SectionHeader title="Quick Actions" />
          <View style={styles.actionsRow}>
            {[
              { icon: 'storefront-outline', label: 'Shops', color: colors.primary, onPress: () => navigation.navigate('Shops') },
              { icon: 'people-outline', label: 'Users', color: colors.secondary, onPress: () => navigation.navigate('AdminUsers') },
              { icon: 'bar-chart-outline', label: 'Reports', color: colors.accent, onPress: () => navigation.navigate('Billing') },
              { icon: 'card-outline', label: 'Billing', color: colors.success, onPress: () => navigation.navigate('Billing') },
            ].map((action) => (
              <TouchableOpacity key={action.label} style={styles.actionItem} activeOpacity={0.75} onPress={action.onPress}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                  <Ionicons name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {pendingShops > 0 && (
            <TouchableOpacity style={styles.alertCard} activeOpacity={0.85} onPress={() => navigation.navigate('Shops')}>
              <View style={styles.alertIcon}>
                <Ionicons name="alert-circle" size={22} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{pendingShops} shop{pendingShops > 1 ? 's' : ''} awaiting approval</Text>
                <Text style={styles.alertSubtitle}>Review and approve pending registrations</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.warning} />
            </TouchableOpacity>
          )}

          <SectionHeader title="Screen Status" onSeeAll={() => navigation.navigate('Monitoring')} />
          {recentScreens.length === 0 ? (
            <View style={[styles.emptyCard, shadows.sm]}>
              <Ionicons name="tv-outline" size={40} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No screens registered</Text>
            </View>
          ) : (
            recentScreens.map((screen) => {
              const isOnline = screen.status === 'online';
              return (
                <View key={screen.id} style={[styles.screenItem, shadows.sm]}>
                  <View style={[styles.screenDot, { backgroundColor: isOnline ? colors.success : colors.error }]} />
                  <View style={styles.screenInfo}>
                    <Text style={styles.screenName} numberOfLines={1}>{screen.screenName || `Screen ${screen.id}`}</Text>
                    <Text style={styles.screenShop} numberOfLines={1}>{screen.shopName || '—'}</Text>
                  </View>
                  <View style={styles.screenMeta}>
                    <Text style={[styles.screenStatus, { color: isOnline ? colors.success : colors.error }]}>
                      {isOnline ? 'Online' : 'Offline'}
                    </Text>
                    {screen.lastSeen && (
                      <Text style={styles.screenTime}>
                        {formatTimeAgo(screen.lastSeen)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTimeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
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
  pillsRow: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { ...typography.labelSmall, color: 'rgba(255,255,255,0.9)' },
  body: { padding: spacing.lg, gap: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  actionItem: { alignItems: 'center', gap: spacing.xs, flex: 1 },
  actionIcon: { width: 56, height: 56, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { ...typography.labelSmall, color: colors.textSecondary },
  alertCard: {
    backgroundColor: colors.warningFaint,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning + '40',
    marginBottom: spacing.sm,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: { ...typography.titleSmall, color: colors.warning },
  alertSubtitle: { ...typography.bodySmall, color: colors.warning + 'CC', marginTop: 2 },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.titleMedium, color: colors.textSecondary },
  screenItem: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  screenDot: { width: 10, height: 10, borderRadius: 5 },
  screenInfo: { flex: 1 },
  screenName: { ...typography.titleSmall, color: colors.textPrimary },
  screenShop: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  screenMeta: { alignItems: 'flex-end' },
  screenStatus: { ...typography.labelSmall },
  screenTime: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 2 },
});
