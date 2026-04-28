import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react-native'
import NetInfo from '@react-native-community/netinfo'
import { Colors } from '@/theme/colors'
import { useAuthStore } from '@/store/authStore'

// Screen imports
import { SplashScreen }         from '@/screens/auth/SplashScreen'
import { AuthScreens }          from '@/screens/auth/AuthScreens'
import { HomeScreen }           from '@/screens/home/HomeScreen'
import { SearchScreen }         from '@/screens/search/SearchScreen'
import { ListingDetailScreen }  from '@/screens/listing/ListingDetailScreen'
import { ListingGridScreen }    from '@/screens/listing/ListingGridScreen'
import { PostAdScreen }         from '@/screens/post/PostAdScreen'
import { ChatListScreen, ChatDetailScreen } from '@/screens/chat/ChatScreens'
import { ProfileScreen }        from '@/screens/profile/ProfileScreen'
import { SellerProfileScreen }  from '@/screens/profile/SellerProfileScreen'
import { EditProfileScreen }    from '@/screens/profile/EditProfileScreen'

// ─── Deep linking configuration ─────────────
const linking = {
  prefixes: ['ray://', 'https://ray.rw'],
  config: {
    screens: {
      Main: {
        screens: {
          Home:    '',
          Search:  'search',
          Chats:   'chat',
          Profile: 'account',
        },
      },
      ListingDetail:  'listing/:listingId',
      PostAd:         'post',
      ChatDetail:     'chat/:conversationId',
      SellerProfile:  'profile/:userId',
      ListingGrid:    'category/:category',
      EditProfile:    'account/edit',
    },
  },
}

const Tab   = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

// ─── Custom FAB-style center tab button ──────
function SellTabButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={fabStyles.wrap} onPress={onPress} activeOpacity={0.85}>
      <View style={fabStyles.btn}>
        <Plus size={26} color="#fff" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  )
}

const fabStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', top: -18 },
  btn:  {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12,
    elevation: 8,
    borderWidth: 3, borderColor: Colors.background,
  },
})

// ─── Main tab navigator ──────────────────────
function MainTabs({ navigation }: { navigation: any }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor:  Colors.tabBarBorder,
          borderTopWidth:  1,
          height:          Platform.OS === 'ios' ? 84 : 64,
          paddingBottom:   Platform.OS === 'ios' ? 24 : 8,
          paddingTop:      8,
        },
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, React.ReactNode> = {
            Home:    <Home size={size} color={color} />,
            Search:  <Search size={size} color={color} />,
            Sell:    null,
            Chats:   <MessageCircle size={size} color={color} />,
            Profile: <User size={size} color={color} />,
          }
          return icons[route.name] ?? null
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Search"  component={SearchScreen}  options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen
        name="Sell"
        component={PostAdScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => (
            <SellTabButton onPress={() => navigation.navigate('PostAd')} />
          ),
        }}
      />
      <Tab.Screen name="Chats"   component={ChatListScreen}  options={{ tabBarLabel: 'Chats' }} />
      <Tab.Screen name="Profile" component={ProfileScreen}   options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  )
}

// ─── Root stack navigator ────────────────────
export const AppNavigator = () => {
  const { isInitialized, firebaseUser } = useAuthStore()
  const [isOffline, setOffline] = useState(false)

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOffline(!(state.isConnected && state.isInternetReachable))
    })
    return unsub
  }, [])

  if (!isInitialized) return <SplashScreen />

  return (
    <View style={{ flex: 1 }}>
      {isOffline && (
        <View
          style={{
            backgroundColor: '#EF4444',
            paddingVertical: 8,
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 50 : 8,
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 12,
              fontWeight: '700',
              letterSpacing: 0.3,
            }}
          >
            You're offline — showing cached content
          </Text>
        </View>
      )}
      <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!firebaseUser ? (
            <Stack.Screen name="Auth" component={AuthScreens} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen
                name="ListingDetail"
                component={ListingDetailScreen}
                options={{ presentation: 'card', animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="ListingGrid"
                component={ListingGridScreen}
                options={{ presentation: 'card', animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="PostAd"
                component={PostAdScreen}
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="ChatDetail"
                component={ChatDetailScreen}
                options={{ presentation: 'card', animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="SellerProfile"
                component={SellerProfileScreen}
                options={{ presentation: 'card', animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ presentation: 'modal' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  )
}
