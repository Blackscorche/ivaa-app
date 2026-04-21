import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { salesAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

export default function SalesCommissionsScreen() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommissions = useCallback(async () => {
    try {
      const data = await salesAPI.getCommissions();
      setCommissions(data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCommissions(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchCommissions(); };

  const totalEarned = commissions.reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const totalPending = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const totalPaid = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + parseFloat(c.amount || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primaryFull} style={styles.header}>
        <Text style={styles.headerTitle}>Commissions</Text>

        <View style={styles.earningsCard}>
          <View style={styles.earningMain}>
            <Text style={styles.earningLabel}>Total Earned</Text>
            <Text style={styles.earningAmount}>£{totalEarned.toFixed(2)}</Text>
          </View>
          <View style={styles.earningRow}>
            <View style={styles.earningItem}>
              <Text style={styles.earningItemValue}>£{totalPaid.toFixed(2)}</Text>
              <Text style={styles.earningItemLabel}>Paid Out</Text>
            </View>
            <View style={styles.earningDivider} />
            <View style={styles.earningItem}>
              <Text style={[styles.earningItemValue, { color: colors.secondaryLight }]}>£{totalPending.toFixed(2)}</Text>
              <Text style={styles.earningItemLabel}>Pending</Text>
            </View>
            <View style={styles.earningDivider} />
            <View style={styles.earningItem}>
              <Text style={styles.earningItemValue}>{commissions.length}</Text>
              <Text style={styles.earningItemLabel}>Transactions</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <Text style={styles.sectionTitle}>Transaction History</Text>

          {commissions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cash-outline" size={56} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No commissions yet</Text>
              <Text style={styles.emptySubtitle}>Register shops to start earning commissions</Text>
            </View>
          ) : (
            commissions.map(item => (
              <View key={item.id} style={[styles.commissionItem, shadows.sm]}>
                <View style={[styles.commissionIcon, {
                  backgroundColor: item.status === 'paid' ? colors.successFaint : colors.warningFaint,
                }]}>
                  <Ionicons
                    name={item.status === 'paid' ? 'cash' : 'time'}
                    size={20}
                    color={item.status === 'paid' ? colors.success : colors.warning}
                  />
                </View>
                <View style={styles.commissionInfo}>
                  <Text style={styles.commissionShop} numberOfLines={1}>
                    {item.shop_name || 'Shop'}
                  </Text>
                  <Text style={styles.commissionType}>
                    {item.type || 'Commission'}
                    {item.commission_rate ? `  ·  ${item.commission_rate}%` : ''}
                  </Text>
                  <Text style={styles.commissionDate}>
                    {new Date(item.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.commissionRight}>
                  <Text style={[styles.commissionAmount, item.status === 'paid' && { color: colors.success }]}>
                    £{parseFloat(item.amount || 0).toFixed(2)}
                  </Text>
                  <StatusBadge status={item.status || 'pending'} />
                </View>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  headerTitle: { ...typography.headlineMedium, color: colors.white },
  earningsCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: spacing.md,
  },
  earningMain: { alignItems: 'center' },
  earningLabel: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)' },
  earningAmount: { ...typography.displayMedium, color: colors.white, marginTop: 4 },
  earningRow: { flexDirection: 'row', alignItems: 'center' },
  earningItem: { flex: 1, alignItems: 'center' },
  earningItemValue: { ...typography.titleLarge, color: colors.white },
  earningItemLabel: { ...typography.labelSmall, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  earningDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: spacing.sm },
  sectionTitle: { ...typography.titleLarge, color: colors.textPrimary, marginBottom: spacing.xs },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xl, gap: spacing.sm },
  emptyTitle: { ...typography.titleLarge, color: colors.textSecondary },
  emptySubtitle: { ...typography.bodyMedium, color: colors.textTertiary, textAlign: 'center' },
  commissionItem: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  commissionIcon: { width: 44, height: 44, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' },
  commissionInfo: { flex: 1 },
  commissionShop: { ...typography.titleSmall, color: colors.textPrimary },
  commissionType: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  commissionDate: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 2 },
  commissionRight: { alignItems: 'flex-end', gap: 4 },
  commissionAmount: { ...typography.titleSmall, color: colors.textPrimary },
});
