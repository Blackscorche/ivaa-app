import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, typography } from '../../theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: { icon: string; onPress: () => void };
  gradient?: boolean;
}

export default function ScreenHeader({ title, subtitle, onBack, rightAction, gradient = false }: Props) {
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={gradient ? colors.white : colors.textPrimary} />
          </TouchableOpacity>
        ) : <View style={styles.backButton} />}

        <View style={styles.titleContainer}>
          <Text style={[styles.title, gradient && styles.titleWhite]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, gradient && styles.subtitleWhite]}>{subtitle}</Text>}
        </View>

        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name={rightAction.icon as any} size={24} color={gradient ? colors.white : colors.primary} />
          </TouchableOpacity>
        ) : <View style={styles.backButton} />}
      </View>
    </View>
  );

  if (gradient) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {content}
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.plain}>{content}</View>
    </>
  );
}

const styles = StyleSheet.create({
  plain: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...typography.headlineSmall,
    color: colors.textPrimary,
  },
  titleWhite: {
    color: colors.white,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subtitleWhite: {
    color: 'rgba(255,255,255,0.75)',
  },
});
