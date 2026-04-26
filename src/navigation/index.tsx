import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import { colors, gradients, spacing, radius, typography } from '../theme';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OwnerNavigator from './OwnerNavigator';
import AdminNavigator from './AdminNavigator';
import SalesNavigator from './SalesNavigator';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import SupportScreen from '../screens/shared/SupportScreen';
import AdminUsersScreen from '../screens/admin/UsersScreen';
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '../services/notifications';

function UnsupportedRoleScreen() {
  const { clearAuth } = useAuthStore();
  return (
    <View style={unsupStyles.container}>
      <LinearGradient colors={gradients.splash} style={StyleSheet.absoluteFillObject} />
      <View style={unsupStyles.card}>
        <Ionicons name="laptop-outline" size={52} color={colors.primary} style={{ marginBottom: spacing.md }} />
        <Text style={unsupStyles.title}>Web Access Only</Text>
        <Text style={unsupStyles.subtitle}>
          Your account role requires the web dashboard.{'\n'}Please visit ivaamedia.uk to continue.
        </Text>
        <TouchableOpacity
          style={unsupStyles.logoutBtn}
          onPress={async () => { await authAPI.logout(); clearAuth(); }}
          activeOpacity={0.85}
        >
          <Text style={unsupStyles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const unsupStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  card: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.xxl, alignItems: 'center', width: '100%',
  },
  title: { ...typography.headlineSmall, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.bodyMedium, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  logoutBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xxl,
  },
  logoutText: { ...typography.titleMedium, color: colors.white },
});

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isLoading, user, loadAuth } = useAuthStore();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    registerForPushNotifications();
    notificationListener.current = addNotificationReceivedListener(() => {});
    responseListener.current = addNotificationResponseListener(() => {});
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A0033' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : user?.role === 'owner' ? (
          <Stack.Screen name="Owner" component={OwnerNavigator} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="Admin" component={AdminNavigator} />
        ) : user?.role === 'sales' ? (
          <Stack.Screen name="Sales" component={SalesNavigator} />
        ) : (
          <Stack.Screen name="UnsupportedRole" component={UnsupportedRoleScreen} />
        )}
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ presentation: 'card' }} />
        <Stack.Screen name="Support" component={SupportScreen} options={{ presentation: 'card' }} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ presentation: 'card' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
