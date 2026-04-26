import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { salesAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

const FILTERS = ['all', 'approved', 'pending', 'rejected'];

export default function SalesShopsScreen() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchShops = useCallback(async () => {
    try {
      const data = await salesAPI.getMyShops();
      setShops(data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchShops(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchShops(); };

  const filtered = filter === 'all' ? shops : shops.filter(s => s.approval_status === filter);

  const approved = shops.filter(s => s.approval_status === 'approved').length;
  const pending = shops.filter(s => s.approval_status === 'pending').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>My Shops</Text>
        <Text style={styles.headerSubtitle}>{shops.length} registered</Text>
      </LinearGradient>

      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: shops.length, color: colors.primary },
          { label: 'Approved', value: approved, color: colors.success },
          { label: 'Pending', value: pending, color: colors.warning },
        ].map(s => (
          <View key={s.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
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
              <Ionicons name="storefront-outline" size={56} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No shops found</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all' ? 'Register your first shop to start earning' : `No ${filter} shops`}
              </Text>
            </View>
          ) : (
            filtered.map(shop => (
              <View key={shop.id} style={[styles.shopCard, shadows.sm]}>
                <View style={styles.shopIcon}>
                  <Ionicons name="storefront" size={20} color={colors.primary} />
                </View>
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                  <Text style={styles.shopMeta} numberOfLines={1}>
                    {shop.city || shop.address || 'No location'}
                  </Text>
                  <Text style={styles.shopDate}>
                    Registered {new Date(shop.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                  {shop.commission_rate && (
                    <Text style={styles.commission}>Commission: {shop.commission_rate}%</Text>
                  )}
                </View>
                <StatusBadge status={shop.approval_status} />
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
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
  emptySubtitle: { ...typography.bodyMedium, color: colors.textTertiary, textAlign: 'center' },
  shopCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  shopIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopInfo: { flex: 1 },
  shopName: { ...typography.titleSmall, color: colors.textPrimary },
  shopMeta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  shopDate: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 2 },
  commission: { ...typography.bodySmall, color: colors.primary, marginTop: 4 },
});
