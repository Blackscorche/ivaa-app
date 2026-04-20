import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

type Status =
  | 'pending' | 'approved' | 'rejected'
  | 'active' | 'inactive' | 'online' | 'offline'
  | 'published' | 'in_design' | 'designed' | 'paid' | 'unpaid'
  | string;

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: 'Pending',    bg: colors.warningFaint,  text: colors.warning },
  approved:   { label: 'Approved',   bg: colors.successFaint,  text: colors.success },
  rejected:   { label: 'Rejected',   bg: colors.errorFaint,    text: colors.error },
  active:     { label: 'Active',     bg: colors.successFaint,  text: colors.success },
  inactive:   { label: 'Inactive',   bg: colors.errorFaint,    text: colors.error },
  online:     { label: 'Online',     bg: colors.successFaint,  text: colors.success },
  offline:    { label: 'Offline',    bg: colors.errorFaint,    text: colors.error },
  published:  { label: 'Published',  bg: colors.successFaint,  text: colors.success },
  in_design:  { label: 'In Design',  bg: colors.warningFaint,  text: colors.warning },
  designed:   { label: 'Designed',   bg: colors.infoFaint,     text: colors.info },
  paid:       { label: 'Paid',       bg: colors.successFaint,  text: colors.success },
  unpaid:     { label: 'Unpaid',     bg: colors.errorFaint,    text: colors.error },
};

interface Props {
  status: Status;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const config = statusConfig[status] || {
    label: status.replace(/_/g, ' '),
    bg: colors.gray[100],
    text: colors.gray[600],
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'md' && styles.badgeMd]}>
      <Text style={[styles.text, { color: config.text }, size === 'md' && styles.textMd]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.labelSmall,
  },
  textMd: {
    ...typography.labelMedium,
  },
});
