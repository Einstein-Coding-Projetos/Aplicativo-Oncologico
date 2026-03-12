import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import DailyCheckinFab from '../../components/DailyCheckinFab';
import { HapticTab } from '../../components/haptic-tab';
import { IconSymbol } from '../../components/ui/icon-symbol';

const activeTint = '#EAF9FF';
const inactiveTint = 'rgba(202, 219, 245, 0.72)';

function GlassTabBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <BlurView intensity={70} tint="dark" style={styles.blurLayer} />
      <View style={styles.glowLayer} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View className="flex-1 bg-[#070F21]">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTint,
          tabBarInactiveTintColor: inactiveTint,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => <GlassTabBackground />,
          tabBarItemStyle: styles.tabItem,
          tabBarLabelStyle: styles.tabLabel,
          tabBarHideOnKeyboard: true,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="diario"
          options={{
            title: 'Diario',
            tabBarIcon: ({ color }) => <IconSymbol size={22} name="book.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="index"
          options={{
            title: 'Progresso',
            tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="relatos"
          options={{
            title: 'Relatos',
            tabBarIcon: ({ color }) => <IconSymbol size={22} name="paperplane.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="agendamento"
          options={{
            title: 'Agenda',
            tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
          }}
        />

        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} />,
          }}
        />

        <Tabs.Screen name="historico" options={{ href: null }} />
      </Tabs>

      <DailyCheckinFab />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    height: 84,
    paddingBottom: 12,
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopWidth: 0,
    borderRadius: 30,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    shadowColor: '#8BE9FF',
    shadowOpacity: 0.24,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  blurLayer: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(195, 233, 255, 0.18)',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(10, 20, 40, 0.18)' : 'rgba(10, 20, 40, 0.92)',
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  tabItem: {
    borderRadius: 20,
    marginHorizontal: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.25,
    marginTop: Platform.OS === 'ios' ? 2 : 0,
  },
});
