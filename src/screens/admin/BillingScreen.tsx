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
import StatusBadge from '../../components/common/StatusBadge';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

const TABS = ['billing', 'subscriptions'];

export default function AdminBillingScreen() {
  const [billing, setBilling] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('billing');

  const fetchData = useCallback(async () => {
    try {
      const [billingData, subData] = await Promise.allSettled([
        adminAPI.getBilling(),
        adminAPI.getReportsSubscriptions(),
      ]);
      if (billingData.status === 'fulfilled') setBilling(billingData.value || []);
      if (subData.status === 'fulfilled') setSubscriptions(subData.value?.shops || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const totalRevenue = billing.filter(b => b.status === 'paid').reduce((s, b) => s + parseFloat(b.amount || 0), 0);
  const outstanding = billing.filter(b => b.status !== 'paid').reduce((s, b) => s + parseFloat(b.amount || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primaryFull} style={styles.header}>
        <Text style={styles.headerTitle}>Billing & Revenue</Text>
        <View style={styles.revenueRow}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueValue}>£{totalRevenue.toFixed(2)}</Text>
            <Text style={styles.revenueLabel}>Total Collected</Text>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueItem}>
            <Text style={[styles.revenueValue, { color: colors.secondaryLight }]}>£{outstanding.toFixed(2)}</Text>
            <Text style={styles.revenueLabel}>Outstanding</Text>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueItem}>
            <Text style={styles.revenueValue}>{subscriptions.length}</Text>
            <Text style={styles.revenueLabel}>Active Shops</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
          {activeTab === 'billing' ? (
            billing.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No billing records</Text>
              </View>
            ) : (
              billing.map(item => (
                <View key={item.id} style={[styles.billingItem, shadows.sm]}>
                  <View style={[styles.billingIcon, {
                    backgroundColor: item.status === 'paid' ? colors.successFaint : colors.warningFaint,
                  }]}>
                    <Ionicons
                      name={item.status === 'paid' ? 'checkmark-circle' : 'time'}
                      size={20}
                      color={item.status === 'paid' ? colors.success : colors.warning}
                    />
                  </View>
                  <View style={styles.billingInfo}>
                    <Text style={styles.billingShop} numberOfLines={1}>{item.shop_name || 'Shop'}</Text>
                    <Text style={styles.billingDesc} numberOfLines={1}>{item.description || item.type || 'Invoice'}</Text>
                    <Text style={styles.billingDate}>
                      {new Date(item.bill_date || item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.billingRight}>
                    <Text style={styles.billingAmount}>£{parseFloat(item.amount || 0).toFixed(2)}</Text>
                    <StatusBadge status={item.status || 'pending'} />
                  </View>
                </View>
              ))
            )
          ) : (
            subscriptions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="storefront-outline" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No subscription data</Text>
              </View>
            ) : (
              subscriptions.map((shop: any) => (
                <View key={shop.id || shop.shop_id} style={[styles.subItem, shadows.sm]}>
                  <View style={styles.subIcon}>
                    <Ionicons name="storefront" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.subInfo}>
                    <Text style={styles.subName}>{shop.name || shop.shop_name}</Text>
                    <Text style={styles.subPlan}>{shop.plan || 'Standard'}</Text>
                  </View>
                  <View style={styles.subRight}>
                    <Text style={styles.subAmount}>£{parseFloat(shop.monthly_revenue || 0).toFixed(2)}/mo</Text>
                    <StatusBadge status={shop.payment_status || 'active'} />
                  </View>
                </View>
              ))
            )
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
  revenueRow: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  revenueItem: { flex: 1, alignItems: 'center' },
  revenueValue: { ...typography.headlineSmall, color: colors.white },
  revenueLabel: { ...typography.labelSmall, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  revenueDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { ...typography.titleSmall, color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: spacing.sm },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xl, gap: spacing.sm },
  emptyTitle: { ...typography.titleMedium, color: colors.textSecondary },
  billingItem: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  billingIcon: { width: 44, height: 44, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' },
  billingInfo: { flex: 1 },
  billingShop: { ...typography.titleSmall, color: colors.textPrimary },
  billingDesc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  billingDate: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 2 },
  billingRight: { alignItems: 'flex-end', gap: 4 },
  billingAmount: { ...typography.titleSmall, color: colors.textPrimary },
  subItem: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subIcon: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.primaryFaint, justifyContent: 'center', alignItems: 'center' },
  subInfo: { flex: 1 },
  subName: { ...typography.titleSmall, color: colors.textPrimary },
  subPlan: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  subRight: { alignItems: 'flex-end', gap: 4 },
  subAmount: { ...typography.titleSmall, color: colors.primary },
});
