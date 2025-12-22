import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

const activeTint = "#4338ca";
const inactiveTint = "#6B7280";
const tabBackground = "#ffffff";
const borderColor = "#E5E7EB";

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarStyle: {
          backgroundColor: tabBackground,
          borderTopColor: borderColor,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="diario"
        options={{
          title: "Diario",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book.fill" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="relatos"
        options={{
          title: "Relatos",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="agendamento"
        options={{
          title: "Agendamento",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" color={color} size={size} />
          ),
        }}
      />
      

    </Tabs>
  );
}
