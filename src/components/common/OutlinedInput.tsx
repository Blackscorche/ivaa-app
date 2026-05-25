import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';

interface Props extends TextInputProps {
  label: string;
  icon?: string;
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function OutlinedInput({ label, icon, secure, containerStyle, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = !!rest.value || focused;

  const borderColor = focused ? colors.primary : colors.border;
  const labelColor = focused ? colors.primary : colors.textTertiary;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Animated.Text style={[styles.label, { top: hasValue ? -9 : spacing.md, fontSize: hasValue ? 11 : 16, color: labelColor, backgroundColor: hasValue ? colors.white : 'transparent', paddingHorizontal: hasValue ? 4 : 0 }]}>
        {label}
      </Animated.Text>

      <View style={[styles.border, { borderColor }]}>
        {icon && (
          <Ionicons name={icon as any} size={20} color={focused ? colors.primary : colors.textTertiary} style={{ marginRight: spacing.sm }} />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secure && !showPassword}
          {...rest}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingTop: spacing.sm },
  label: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
    ...typography.labelSmall,
  },
  border: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    ...typography.bodyLarge,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
});
