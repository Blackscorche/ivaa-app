import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

import OwnerDashboardScreen from '../screens/owner/DashboardScreen';
import OwnerContentScreen from '../screens/owner/ContentScreen';
import OwnerScreensScreen from '../screens/owner/ScreensScreen';
import OwnerBillingScreen from '../screens/owner/BillingScreen';
import OwnerMoreScreen from '../screens/owner/MoreScreen';

const Tab = createBottomTabNavigator();

export default function OwnerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Content') iconName = focused ? 'images' : 'images-outline';
          else if (route.name === 'Screens') iconName = focused ? 'tv' : 'tv-outline';
          else if (route.name === 'Billing') iconName = focused ? 'card' : 'card-outline';
          else if (route.name === 'More') iconName = focused ? 'grid' : 'grid-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={OwnerDashboardScreen} />
      <Tab.Screen name="Content" component={OwnerContentScreen} />
      <Tab.Screen name="Screens" component={OwnerScreensScreen} />
      <Tab.Screen name="Billing" component={OwnerBillingScreen} />
      <Tab.Screen name="More" component={OwnerMoreScreen} />
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
