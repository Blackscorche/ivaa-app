import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
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
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ presentation: 'card' }} />
        <Stack.Screen name="Support" component={SupportScreen} options={{ presentation: 'card' }} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ presentation: 'card' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
