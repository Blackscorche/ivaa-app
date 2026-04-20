import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface Props {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  bgColor?: string;
  trend?: { value: string; up: boolean };
  onPress?: () => void;
}

export default function StatCard({ title, value, icon, color = colors.primary, bgColor, trend, onPress }: Props) {
  const Wrapper: any = onPress ? TouchableOpacity : View;

  return (
    <Wrapper onPress={onPress} activeOpacity={0.8} style={[styles.card, shadows.sm]}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor || color + '18' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {trend && (
        <View style={styles.trendRow}>
          <Ionicons
            name={trend.up ? 'trending-up' : 'trending-down'}
            size={12}
            color={trend.up ? colors.success : colors.error}
          />
          <Text style={[styles.trendText, { color: trend.up ? colors.success : colors.error }]}>
            {trend.value}
          </Text>
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flex: 1,
    minWidth: 140,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    ...typography.headlineMedium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  title: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: spacing.xs,
  },
  trendText: {
    ...typography.labelSmall,
  },
});
