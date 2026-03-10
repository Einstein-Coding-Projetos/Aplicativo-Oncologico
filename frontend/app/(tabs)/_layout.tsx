import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { View } from 'react-native';
import { HapticTab } from '../../components/haptic-tab';
import DailyCheckinFab from '../../components/DailyCheckinFab';

const activeTint = '#00C2FF';
const inactiveTint = '#7A8BAE';
const tabBackground = '#0A1428';
const borderColor = '#1F2D4F';

export default function TabsLayout() {
  return (
    <View className="flex-1 bg-[#070F21]">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTint,
          tabBarInactiveTintColor: inactiveTint,
          tabBarStyle: {
            backgroundColor: tabBackground,
            borderTopColor: borderColor,
            borderTopWidth: 1,
            height: 82,
            paddingBottom: 12,
            paddingTop: 10,
            shadowColor: '#00C2FF',
            shadowOpacity: 0.16,
            shadowRadius: 16,
            elevation: 14,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.3,
          },
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >

        <Tabs.Screen
          name="diario"
          options={{
            title: "Diario",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={22} name="book.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="index"
          options={{
            title: "Progresso",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="relatos"
          options={{
            title: "Relatos",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={22} name="paperplane.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="agendamento"
          options={{
            title: "Agenda",
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

        <Tabs.Screen name="historico" options={{ href: null }} />
      </Tabs>
      <DailyCheckinFab />
      </View>
  )}
      