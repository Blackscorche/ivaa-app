import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Linking } from 'react-native';
import { ownerAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

export default function OwnerBillingScreen() {
  const [billing, setBilling] = useState<any[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [billingData, creditData] = await Promise.allSettled([
        ownerAPI.getBilling(),
        ownerAPI.getCreditBalance(),
      ]);
      if (billingData.status === 'fulfilled') setBilling(billingData.value || []);
      if (creditData.status === 'fulfilled') setCreditBalance(creditData.value?.credit_balance || 0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const totalPaid = billing.filter(b => b.payment_status === 'paid').reduce((s, b) => s + parseFloat(b.amount || 0), 0);
  const totalPending = billing.filter(b => b.payment_status !== 'paid').reduce((s, b) => s + parseFloat(b.amount || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>Billing</Text>
        <Text style={styles.headerSubtitle}>Manage your invoices & credits</Text>
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
          <View style={styles.creditCard}>
            <LinearGradient colors={gradients.primaryFull} style={styles.creditGradient}>
              <View style={styles.creditTop}>
                <View>
                  <Text style={styles.creditLabel}>Credit Balance</Text>
                  <Text style={styles.creditAmount}>£{creditBalance.toFixed(2)}</Text>
                </View>
                <View style={styles.creditIcon}>
                  <Ionicons name="wallet" size={24} color={colors.white} />
                </View>
              </View>
              <TouchableOpacity style={styles.topUpBtn} activeOpacity={0.85} onPress={() => Linking.openURL('https://ivaamedia.uk/topup')}>
                <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.topUpBtnText}>Top Up Balance</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryItem, shadows.sm]}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>£{totalPaid.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>Total Paid</Text>
            </View>
            <View style={[styles.summaryItem, shadows.sm]}>
              <Text style={[styles.summaryValue, { color: colors.warning }]}>£{totalPending.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>Outstanding</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Transaction History</Text>

          {billing.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
            </View>
          ) : (
            billing.map(item => (
              <View key={item.id} style={[styles.invoiceItem, shadows.sm]}>
                <View style={[styles.invoiceIcon, {
                  backgroundColor: item.payment_status === 'paid' ? colors.successFaint : colors.warningFaint,
                }]}>
                  <Ionicons
                    name={item.payment_status === 'paid' ? 'checkmark-circle' : 'time'}
                    size={20}
                    color={item.payment_status === 'paid' ? colors.success : colors.warning}
                  />
                </View>
                <View style={styles.invoiceInfo}>
                  <Text style={styles.invoiceDesc} numberOfLines={1}>
                    {item.description || item.type || 'Invoice'}
                  </Text>
                  <Text style={styles.invoiceDate}>
                    {new Date(item.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.invoiceRight}>
                  <Text style={styles.invoiceAmount}>£{parseFloat(item.amount || 0).toFixed(2)}</Text>
                  <StatusBadge status={item.payment_status || 'pending'} />
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
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  headerTitle: { ...typography.headlineMedium, color: colors.white },
  headerSubtitle: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: spacing.md },
  creditCard: { borderRadius: radius.md, overflow: 'hidden' },
  creditGradient: { padding: spacing.lg, gap: spacing.md },
  creditTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  creditLabel: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)' },
  creditAmount: { ...typography.displaySmall, color: colors.white, marginTop: 4 },
  creditIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  topUpBtnText: { ...typography.labelMedium, color: colors.primary },
  summaryRow: { flexDirection: 'row', gap: spacing.sm },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryValue: { ...typography.headlineSmall },
  summaryLabel: { ...typography.labelSmall, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: { ...typography.titleLarge, color: colors.textPrimary },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xl, gap: spacing.sm },
  emptyTitle: { ...typography.titleMedium, color: colors.textSecondary },
  invoiceItem: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  invoiceIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invoiceInfo: { flex: 1 },
  invoiceDesc: { ...typography.titleSmall, color: colors.textPrimary },
  invoiceDate: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 2 },
  invoiceRight: { alignItems: 'flex-end', gap: 4 },
  invoiceAmount: { ...typography.titleSmall, color: colors.textPrimary },
});
