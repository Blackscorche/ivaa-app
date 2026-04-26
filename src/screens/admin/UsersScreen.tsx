import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { adminAPI } from '../../services/api';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

const ROLE_COLORS: Record<string, string> = {
  owner: colors.primary,
  admin: colors.secondary,
  sales: colors.success,
  design: colors.info,
};

export default function AdminUsersScreen({ navigation }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchUsers(); };

  const roles = ['all', 'owner', 'sales', 'admin', 'design'];
  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.primary} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Users</Text>
          <Text style={styles.headerSubtitle}>{users.length} total</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {roles.map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.filterChip, filter === r && styles.filterChipActive]}
            onPress={() => setFilter(r)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, filter === r && styles.filterChipTextActive]}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No users found</Text>
            </View>
          ) : (
            filtered.map(u => {
              const roleColor = ROLE_COLORS[u.role] || colors.gray[500];
              return (
                <View key={u.id} style={[styles.userCard, shadows.sm]}>
                  <View style={[styles.userAvatar, { backgroundColor: roleColor + '22' }]}>
                    <Text style={[styles.userAvatarText, { color: roleColor }]}>
                      {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>{u.full_name || '—'}</Text>
                    <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
                    <Text style={styles.userDate}>
                      Joined {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={[styles.rolePill, { backgroundColor: roleColor + '18', borderColor: roleColor + '40' }]}>
                    <Text style={[styles.rolePillText, { color: roleColor }]}>{u.role}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.lg,
  },
  backBtn: { width: 38, height: 38, justifyContent: 'center' },
  headerText: { flex: 1, alignItems: 'center' },
  headerTitle: { ...typography.headlineSmall, color: colors.white },
  headerSubtitle: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)' },
  filterScroll: { maxHeight: 52, backgroundColor: colors.white },
  filterContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.gray[100] },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipText: { ...typography.labelMedium, color: colors.textSecondary },
  filterChipTextActive: { color: colors.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: spacing.sm },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xxxl, gap: spacing.sm },
  emptyTitle: { ...typography.titleLarge, color: colors.textSecondary },
  userCard: {
    backgroundColor: colors.white, borderRadius: radius.md,
    padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  userAvatar: {
    width: 44, height: 44, borderRadius: radius.full,
    justifyContent: 'center', alignItems: 'center',
  },
  userAvatarText: { ...typography.titleLarge },
  userInfo: { flex: 1 },
  userName: { ...typography.titleSmall, color: colors.textPrimary },
  userEmail: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  userDate: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 2 },
  rolePill: {
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1,
  },
  rolePillText: { ...typography.labelSmall },
});
