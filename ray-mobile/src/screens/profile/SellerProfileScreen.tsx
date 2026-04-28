import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { ChevronLeft, MapPin, Star } from 'lucide-react-native'
import { usersApi, listingsApi, chatApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Colors } from '@/theme/colors'
import { formatPrice } from '@/utils'
import type { User, Listing } from '@/types'

type RouteParams = {
  SellerProfile: {
    userId: string
  }
}

export const SellerProfileScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'SellerProfile'>>()
  const navigation = useNavigation()
  const { userId } = route.params
  const { user: currentUser } = useAuthStore()

  const [seller, setSeller] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sellerData, listingsData] = await Promise.all([
          usersApi.getProfile(userId),
          listingsApi.getByUser(userId),
        ])
        setSeller(sellerData)
        setListings(listingsData)
      } catch (err) {
        setError('User not found')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const handleChat = async () => {
    if (listings.length === 0) return
    try {
      const conversation = await chatApi.startConversation(listings[0].id)
      navigation.navigate('ChatDetail' as never, { conversationId: conversation.id } as never)
    } catch (err) {
      console.error('Failed to start conversation:', err)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (error || !seller) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const isOwnProfile = currentUser?.id === userId
  const memberSince = new Date(seller.memberSince).getFullYear()

  const renderListingCard = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => navigation.navigate('ListingDetail' as never, { listingId: item.id } as never)}
    >
      <View style={styles.listingImage}>
        <View style={styles.imagePlaceholder} />
      </View>
      <View style={styles.listingContent}>
        <Text style={styles.listingPrice}>{formatPrice(item.price)}</Text>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <ChevronLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>

      {/* Orange Strip */}
      <View style={styles.orangeStrip} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              {seller.avatar ? (
                <View style={styles.avatar}>
                  {/* Image would go here */}
                  <View style={styles.avatarPlaceholder} />
                </View>
              ) : (
                <View style={[styles.avatar, styles.avatarInitial]}>
                  <Text style={styles.avatarInitialText}>
                    {seller.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{seller.displayName}</Text>
              {seller.verificationStatus !== 'none' && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}
            </View>
            {seller.trustLevel === 3 && (
              <View style={styles.topSellerBadge}>
                <Text style={styles.topSellerText}>🏆 Top Seller</Text>
              </View>
            )}
            <View style={styles.locationRow}>
              <MapPin color={Colors.text.secondary} size={14} />
              <Text style={styles.locationText}>
                {seller.location?.displayLabel || 'Kigali'} • Member since {memberSince}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seller.activeListings || 0}</Text>
            <Text style={styles.statLabel}>Active Ads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seller.responseRate || 0}%</Text>
            <Text style={styles.statLabel}>Response Rate</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seller.completedDeals || 0}</Text>
            <Text style={styles.statLabel}>Completed Deals</Text>
          </View>
        </View>

        {/* Star Rating */}
        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                color={Colors.warning}
                fill={i < 4 ? Colors.warning : 'transparent'}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>4.5 (23 reviews)</Text>
        </View>

        {/* Listings Grid */}
        <View style={styles.listingsSection}>
          <Text style={styles.listingsTitle}>Listings ({listings.length})</Text>
          <FlatList
            data={listings}
            renderItem={renderListingCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.listingsColumnWrapper}
            contentContainerStyle={styles.listingsContent}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No active listings</Text>
            }
          />
        </View>

        {/* Bottom spacing for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Chat FAB */}
      {!isOwnProfile && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={handleChat}>
            <Text style={styles.fabText}>Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBack: {
    padding: 4,
  },
  orangeStrip: {
    height: 90,
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -40,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface.modal,
  },
  avatarInitial: {
    backgroundColor: '#E8390E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  nameSection: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  topSellerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.warning + '20',
    borderRadius: 12,
    marginBottom: 8,
  },
  topSellerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 24,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.surface.card,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  listingsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  listingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  listingsContent: {
    gap: 12,
  },
  listingsColumnWrapper: {
    gap: 12,
  },
  listingCard: {
    flex: 1,
    backgroundColor: Colors.surface.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface.modal,
  },
  listingContent: {
    padding: 12,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 32,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  fab: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
