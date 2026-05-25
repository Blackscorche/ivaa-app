import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

import SalesDashboardScreen from '../screens/sales/DashboardScreen';
import SalesShopsScreen from '../screens/sales/ShopsScreen';
import SalesRegisterScreen from '../screens/sales/RegisterShopScreen';
import SalesCommissionsScreen from '../screens/sales/CommissionsScreen';
import SalesMoreScreen from '../screens/sales/MoreScreen';

const Tab = createBottomTabNavigator();

export default function SalesNavigator() {
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
          else if (route.name === 'My Shops') iconName = focused ? 'storefront' : 'storefront-outline';
          else if (route.name === 'Register') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Commissions') iconName = focused ? 'cash' : 'cash-outline';
          else if (route.name === 'More') iconName = focused ? 'grid' : 'grid-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={SalesDashboardScreen} />
      <Tab.Screen name="My Shops" component={SalesShopsScreen} />
      <Tab.Screen name="Register" component={SalesRegisterScreen} />
      <Tab.Screen name="Commissions" component={SalesCommissionsScreen} />
      <Tab.Screen name="More" component={SalesMoreScreen} />
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
