import { useState } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TAB_BAR_STYLES, HEADER_STYLES } from '@navigation/constants';
import { useBabyTabVisible } from '@navigation/hooks/use-baby-tab-visible';
import { useBabyPalette } from '@navigation/hooks/use-baby-palette';

const TabLayout = () => {
  const isBabyTabVisible = useBabyTabVisible();
  const [activeTab, setActiveTab] = useState<string>('learn');
  const isBabyActive = activeTab === 'baby';
  const palette = useBabyPalette(isBabyActive);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: TAB_BAR_STYLES.height,
          backgroundColor: palette.backgroundColor,
          borderTopWidth: TAB_BAR_STYLES.borderTopWidth,
          borderTopColor: TAB_BAR_STYLES.borderTopColor,
        },
        tabBarActiveTintColor: palette.activeTint,
        tabBarInactiveTintColor: palette.inactiveTint,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        ...HEADER_STYLES,
      }}
      screenListeners={{
        tabPress: (event) => {
          const routeName = event.target?.split('-')[0];
          if (routeName) {
            setActiveTab(routeName);
          }
        },
      }}
    >
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'music-note' : 'music-note-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="metronome"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="baby"
        options={{
          title: 'Baby',
          href: isBabyTabVisible ? '/(tabs)/baby' : null,
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'baby-face' : 'baby-face-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'cog' : 'cog-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

// Expo Router requires default export
export default TabLayout;
