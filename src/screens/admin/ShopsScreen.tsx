import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { adminAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';
import api from '../../services/api';

const FILTERS = ['all', 'pending', 'approved', 'rejected'];

export default function AdminShopsScreen() {
  const [shops, setShops] = useState<any[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [selectedDesignerId, setSelectedDesignerId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchShops = useCallback(async () => {
    try {
      const [shopsData, designersData] = await Promise.allSettled([
        adminAPI.getShops(),
        api.get('/admin/designers'),
      ]);
      if (shopsData.status === 'fulfilled') setShops(shopsData.value || []);
      if (designersData.status === 'fulfilled') setDesigners(designersData.value.data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchShops(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchShops(); };

  const filtered = filter === 'all' ? shops : shops.filter(s => s.approval_status === filter);

  const handleApprove = async (shop: any) => {
    if (!selectedDesignerId) {
      Alert.alert('Select Designer', 'Please select a designer to assign to this shop.');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/admin/shops/${shop.id}/approve`, { status: 'approved', designer_id: selectedDesignerId });
      fetchShops();
      setSelectedShop(null);
      setSelectedDesignerId(null);
      Alert.alert('Approved', `${shop.name} has been approved`);
    } catch {
      Alert.alert('Error', 'Failed to approve shop');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedShop) return;
    if (!rejectReason.trim()) {
      Alert.alert('Required', 'Please enter a reason for rejection');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/admin/shops/${selectedShop.id}/approve`, { status: 'rejected', rejection_reason: rejectReason.trim() });
      fetchShops();
      setSelectedShop(null);
      setShowRejectModal(false);
      setRejectReason('');
    } catch {
      Alert.alert('Error', 'Failed to reject shop');
    } finally {
      setActionLoading(false);
    }
  };

  const pending = shops.filter(s => s.approval_status === 'pending').length;
  const approved = shops.filter(s => s.approval_status === 'approved').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>Shops</Text>
        <Text style={styles.headerSubtitle}>{shops.length} total · {pending} pending</Text>
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
            </View>
          ) : (
            filtered.map(shop => (
              <TouchableOpacity
                key={shop.id}
                style={[styles.shopCard, shadows.sm]}
                onPress={() => setSelectedShop(shop)}
                activeOpacity={0.85}
              >
                <View style={styles.shopIcon}>
                  <Ionicons name="storefront" size={20} color={colors.primary} />
                </View>
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{shop.name}</Text>
                  <Text style={styles.shopMeta}>
                    {shop.owner_name || shop.owner_email || ''}
                    {(shop.owner_name || shop.owner_email) && (shop.city || shop.address) ? '  ·  ' : ''}
                    {shop.city || shop.address || ''}
                  </Text>
                  <Text style={styles.shopDate}>
                    Registered {new Date(shop.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <StatusBadge status={shop.approval_status} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={!!selectedShop && !showRejectModal} transparent animationType="slide" onRequestClose={() => setSelectedShop(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            {selectedShop && (
              <>
                <Text style={styles.modalTitle}>{selectedShop.name}</Text>
                <View style={styles.detailRows}>
                  {[
                    { icon: 'person-outline', label: selectedShop.owner_name || selectedShop.owner_email || '—' },
                    { icon: 'location-outline', label: selectedShop.address || selectedShop.city || 'No address' },
                    { icon: 'call-outline', label: selectedShop.phone || 'No phone' },
                    { icon: 'calendar-outline', label: `Registered ${new Date(selectedShop.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` },
                  ].map((row, i) => (
                    <View key={i} style={styles.detailRow}>
                      <Ionicons name={row.icon as any} size={16} color={colors.textTertiary} />
                      <Text style={styles.detailText}>{row.label}</Text>
                    </View>
                  ))}
                </View>

                {selectedShop.approval_status === 'pending' && (
                  <>
                    {designers.length > 0 && (
                      <View style={styles.designerSection}>
                        <Text style={styles.rejectLabel}>Assign Designer</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.designerRow}>
                          {designers.map((d: any) => (
                            <TouchableOpacity
                              key={d.id}
                              style={[styles.designerChip, selectedDesignerId === d.id && styles.designerChipActive]}
                              onPress={() => setSelectedDesignerId(d.id)}
                              activeOpacity={0.75}
                            >
                              <Text style={[styles.designerChipText, selectedDesignerId === d.id && styles.designerChipTextActive]}>
                                {d.full_name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                      >
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.approveBtn, actionLoading && { opacity: 0.7 }]}
                        onPress={() => handleApprove(selectedShop)}
                        disabled={actionLoading}
                        activeOpacity={0.85}
                      >
                        <LinearGradient colors={gradients.success} style={styles.approveBtnGradient}>
                          {actionLoading ? (
                            <ActivityIndicator color={colors.white} size="small" />
                          ) : (
                            <Text style={styles.approveBtnText}>Approve</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedShop(null)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showRejectModal} transparent animationType="slide" onRequestClose={() => setShowRejectModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Reject Shop</Text>
            <Text style={styles.rejectLabel}>Reason (optional)</Text>
            <TextInput
              style={styles.rejectInput}
              placeholder="Enter reason for rejection..."
              placeholderTextColor={colors.textTertiary}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
            />
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => setShowRejectModal(false)}>
                <Text style={styles.rejectBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.approveBtn, actionLoading && { opacity: 0.7 }]}
                onPress={handleReject}
                disabled={actionLoading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[colors.error, '#CC2020']} style={styles.approveBtnGradient}>
                  {actionLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.approveBtnText}>Confirm Reject</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  shopCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.gray[300],
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.headlineSmall, color: colors.textPrimary, marginBottom: spacing.md },
  detailRows: { gap: spacing.sm, marginBottom: spacing.lg },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailText: { ...typography.bodyMedium, color: colors.textSecondary, flex: 1 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  rejectBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rejectBtnText: { ...typography.titleSmall, color: colors.textSecondary },
  approveBtn: { flex: 2, borderRadius: radius.md, overflow: 'hidden' },
  approveBtnGradient: { paddingVertical: spacing.md, alignItems: 'center' },
  approveBtnText: { ...typography.titleSmall, color: colors.white },
  closeBtn: { paddingVertical: spacing.md, alignItems: 'center' },
  closeBtnText: { ...typography.bodyMedium, color: colors.textTertiary },
  designerSection: { marginBottom: spacing.md },
  designerRow: { gap: spacing.xs, paddingVertical: 4 },
  designerChip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.gray[100], borderWidth: 1, borderColor: colors.border },
  designerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  designerChipText: { ...typography.labelMedium, color: colors.textSecondary },
  designerChipTextActive: { color: colors.white },
  rejectLabel: { ...typography.labelMedium, color: colors.textSecondary, marginBottom: spacing.sm },
  rejectInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.bodyMedium,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
    minHeight: 80,
  },
});
