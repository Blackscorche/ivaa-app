import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../theme';
export default function OwnerContentScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>ContentScreen</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  text: { ...typography.headlineMedium, color: colors.textPrimary },
});
