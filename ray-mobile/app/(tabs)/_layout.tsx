import { Tabs } from 'expo-router'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Home, Search, MessageCircle, User, Plus } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { Colors, Radii, Shadows } from '@/src/theme/colors'

export default function TabLayout() {
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{
        headerShown:      false,
        tabBarStyle:      styles.tabBar,
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel:  true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: '',
          tabBarIcon: () => (
            <TouchableOpacity
              onPress={() => router.push('/post')}
              style={styles.fab}
              activeOpacity={0.85}
            >
              <Plus size={26} color={Colors.white} strokeWidth={2.5} />
            </TouchableOpacity>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <MessageCircle size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surfaceCard,
    borderTopColor:  Colors.border,
    borderTopWidth:  1,
    height:          64,
    paddingBottom:   8,
    paddingTop:      8,
  },
  tabLabel: {
    fontSize:   10,
    fontWeight: '600',
    marginTop:  2,
  },
  fab: {
    width:           58,
    height:          58,
    borderRadius:    Radii.full,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    24,
    ...Shadows.primary,
    borderWidth: 3,
    borderColor: Colors.background,
  },
})
