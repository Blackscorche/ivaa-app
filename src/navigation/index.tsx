import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import LoginScreen from '../screens/auth/LoginScreen';
import OwnerNavigator from './OwnerNavigator';
import AdminNavigator from './AdminNavigator';
import SalesNavigator from './SalesNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isLoading, user, loadAuth } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, []);

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
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user?.role === 'owner' ? (
          <Stack.Screen name="Owner" component={OwnerNavigator} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="Admin" component={AdminNavigator} />
        ) : user?.role === 'sales' ? (
          <Stack.Screen name="Sales" component={SalesNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
