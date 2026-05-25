import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminShopsScreen from '../screens/admin/ShopsScreen';
import AdminMonitoringScreen from '../screens/admin/MonitoringScreen';
import AdminBillingScreen from '../screens/admin/BillingScreen';
import AdminMoreScreen from '../screens/admin/MoreScreen';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: [styles.tabBar, { paddingBottom: 8 + insets.bottom, height: 65 + insets.bottom }],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Shops') iconName = focused ? 'storefront' : 'storefront-outline';
          else if (route.name === 'Monitoring') iconName = focused ? 'tv' : 'tv-outline';
          else if (route.name === 'Billing') iconName = focused ? 'card' : 'card-outline';
          else if (route.name === 'More') iconName = focused ? 'grid' : 'grid-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Shops" component={AdminShopsScreen} />
      <Tab.Screen name="Monitoring" component={AdminMonitoringScreen} />
      <Tab.Screen name="Billing" component={AdminBillingScreen} />
      <Tab.Screen name="More" component={AdminMoreScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
    paddingTop: 8,
    height: 65,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  tabLabel: {
    ...typography.labelSmall,
    marginTop: 2,
  },
});
