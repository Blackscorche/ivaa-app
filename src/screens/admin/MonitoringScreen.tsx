import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { adminAPI } from '../../services/api';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

const FILTERS = ['all', 'online', 'offline'];

export default function AdminMonitoringScreen() {
  const [screens, setScreens] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      const [screensData, statsData] = await Promise.allSettled([
        adminAPI.getMonitoring(),
        adminAPI.getMonitoringStats(),
      ]);
      if (screensData.status === 'fulfilled') setScreens(screensData.value || []);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const isOnline = (screen: any) => screen.status === 'online';

  const filtered = filter === 'all'
    ? screens
    : screens.filter(s => (filter === 'online' ? isOnline(s) : !isOnline(s)));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>Screen Monitoring</Text>
        <Text style={styles.headerSubtitle}>Real-time display status</Text>
      </LinearGradient>

      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: stats?.total_screens || screens.length, color: colors.primary },
          { label: 'Online', value: stats?.online || screens.filter(isOnline).length, color: colors.success },
          { label: 'Offline', value: stats?.offline || screens.filter(s => !isOnline(s)).length, color: colors.error },
        ].map(s => (
          <View key={s.label} style={styles.statItem}>
            <View style={styles.statValueRow}>
              <View style={[styles.statDot, { backgroundColor: s.color }]} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            </View>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="tv-outline" size={56} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No screens found</Text>
            </View>
          ) : (
            filtered.map(screen => {
              const online = isOnline(screen);
              return (
                <View key={screen.id} style={[styles.screenCard, shadows.sm]}>
                  <View style={[styles.statusBar, { backgroundColor: online ? colors.success : colors.error }]} />
                  <View style={styles.screenIcon}>
                    <Ionicons name="tv" size={20} color={online ? colors.success : colors.gray[400]} />
                  </View>
                  <View style={styles.screenInfo}>
                    <Text style={styles.screenName}>{screen.screenName || `Screen ${screen.id}`}</Text>
                    <Text style={styles.screenShop}>{screen.shopName || '—'}</Text>
                    {screen.lastSeen && (
                      <Text style={styles.screenTime}>Last seen {formatTimeAgo(screen.lastSeen)}</Text>
                    )}
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: online ? colors.successFaint : colors.errorFaint }]}>
                    <View style={[styles.pillDot, { backgroundColor: online ? colors.success : colors.error }]} />
                    <Text style={[styles.statusText, { color: online ? colors.success : colors.error }]}>
                      {online ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function formatTimeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  headerTitle: { ...typography.headlineMedium, color: colors.white },
  headerSubtitle: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statValue: { ...typography.headlineSmall },
  statLabel: { ...typography.labelSmall, color: colors.textSecondary, marginTop: 2 },
  filterScroll: { maxHeight: 52, backgroundColor: colors.white },
  filterContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.gray[100] },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipText: { ...typography.labelMedium, color: colors.textSecondary },
  filterChipTextActive: { color: colors.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1 },
  listContent: { padding: spacing.md, paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xxxl, gap: spacing.sm },
  emptyTitle: { ...typography.titleLarge, color: colors.textSecondary },
  screenCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  statusBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  screenIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  screenInfo: { flex: 1 },
  screenName: { ...typography.titleSmall, color: colors.textPrimary },
  screenShop: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  screenTime: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...typography.labelSmall },
});
