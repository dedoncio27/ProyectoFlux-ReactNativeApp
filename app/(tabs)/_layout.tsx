import { Tabs } from 'expo-router';
import React from 'react';
import { Icon } from 'react-native-paper';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#ffffff',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 5,
          backgroundColor: '#1565c0',
          borderTopColor: '#1565c0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Principal',
          tabBarIcon: ({ color }) => <Icon source="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="foodscreen"
        options={{
          title: 'Alimentacion',
          tabBarIcon: ({ color }) => <Icon source="food" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: 'Entrenamiento',
          tabBarIcon: ({ color }) => <Icon source="dumbbell" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <Icon source="cog" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
