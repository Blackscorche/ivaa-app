import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ownerAPI } from '../../services/api';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

export default function OwnerScreensScreen() {
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScreens = useCallback(async () => {
    try {
      const shop = await ownerAPI.getShop();
      if (shop?.id) {
        const data = await ownerAPI.getScreens(shop.id);
        setScreens(data || []);
      }
    } catch {
      Alert.alert('Error', 'Failed to load screens');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchScreens(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchScreens(); };

  const online = screens.filter(s => {
    if (s.status === 'online') return true;
    if (s.last_seen) {
      return Date.now() - new Date(s.last_seen).getTime() < 5 * 60 * 1000;
    }
    return false;
  }).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>My Screens</Text>
        <Text style={styles.headerSubtitle}>{screens.length} registered</Text>
      </LinearGradient>

      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: screens.length, color: colors.primary },
          { label: 'Online', value: online, color: colors.success },
          { label: 'Offline', value: screens.length - online, color: colors.error },
        ].map(s => (
          <View key={s.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

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
          {screens.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="tv-outline" size={56} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No screens found</Text>
              <Text style={styles.emptySubtitle}>Screens will appear here once registered by your shop</Text>
            </View>
          ) : (
            screens.map(screen => {
              const isOnline = screen.status === 'online' ||
                (screen.last_seen && Date.now() - new Date(screen.last_seen).getTime() < 5 * 60 * 1000);
              return (
                <View key={screen.id} style={[styles.screenCard, shadows.sm]}>
                  <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.error }]} />
                  <View style={styles.screenIcon}>
                    <Ionicons name="tv" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.screenInfo}>
                    <Text style={styles.screenName}>{screen.name || screen.screen_name || `Screen ${screen.id}`}</Text>
                    <Text style={styles.screenMeta}>
                      {isOnline ? 'Online' : 'Offline'}
                      {screen.last_seen ? `  ·  ${formatTimeAgo(screen.last_seen)}` : ''}
                    </Text>
                    {screen.device_id && (
                      <Text style={styles.deviceId} numberOfLines={1}>ID: {screen.device_id}</Text>
                    )}
                  </View>
                  <View style={[styles.onlinePill, { backgroundColor: isOnline ? colors.successFaint : colors.errorFaint }]}>
                    <Text style={[styles.onlinePillText, { color: isOnline ? colors.success : colors.error }]}>
                      {isOnline ? 'Online' : 'Offline'}
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
  statValue: { ...typography.headlineSmall },
  statLabel: { ...typography.labelSmall, color: colors.textSecondary, marginTop: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1 },
  listContent: { padding: spacing.md, paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xxxl, gap: spacing.sm },
  emptyTitle: { ...typography.titleLarge, color: colors.textSecondary },
  emptySubtitle: { ...typography.bodyMedium, color: colors.textTertiary, textAlign: 'center', paddingHorizontal: spacing.xl },
  screenCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, position: 'absolute', top: spacing.md, left: spacing.md },
  screenIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  screenInfo: { flex: 1 },
  screenName: { ...typography.titleSmall, color: colors.textPrimary },
  screenMeta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  deviceId: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 2 },
  onlinePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  onlinePillText: { ...typography.labelSmall },
});
