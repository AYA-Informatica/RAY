import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { ChevronLeft } from 'lucide-react-native'
import { listingsApi } from '@/services/api'
import { Colors } from '@/theme/colors'
import type { Listing, SortOption } from '@/types'

type RouteParams = {
  ListingGrid: {
    category: string
    title: string
  }
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
]

export const ListingGridScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'ListingGrid'>>()
  const navigation = useNavigation()
  const { category, title } = route.params

  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchListings = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true)
      setPage(1)
    } else {
      setIsLoading(true)
    }

    try {
      const result = await listingsApi.search({
        category,
        sortBy,
        page: refresh ? 1 : page,
        limit: 20,
      })
      
      if (refresh) {
        setListings(result.listings)
      } else {
        setListings((prev) => (page === 1 ? result.listings : [...prev, ...result.listings]))
      }
      
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [category, sortBy])

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setPage(1)
  }

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  const handleRefresh = () => {
    fetchListings(true)
  }

  const renderSkeleton = () => (
    <View style={styles.skeletonGrid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={styles.skeleton} />
      ))}
    </View>
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🏷️</Text>
      <Text style={styles.emptyTitle}>No listings in this category yet</Text>
      <Text style={styles.emptySubtitle}>Be the first to post one!</Text>
      <TouchableOpacity
        style={styles.postButton}
        onPress={() => navigation.navigate('PostAd' as never)}
      >
        <Text style={styles.postButtonText}>Post Ad</Text>
      </TouchableOpacity>
    </View>
  )

  const renderListingCard = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListingDetail' as never, { listingId: item.id } as never)}
    >
      <View style={styles.cardImage}>
        {/* Image would go here - placeholder for now */}
        <View style={styles.imagePlaceholder} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardPrice}>Rwf {item.price.toLocaleString()}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardLocation} numberOfLines={1}>
          {item.location.neighborhood}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Sort Pills */}
      <View style={styles.sortContainer}>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortPill,
              sortBy === option.value && styles.sortPillActive,
            ]}
            onPress={() => handleSortChange(option.value)}
          >
            <Text
              style={[
                styles.sortPillText,
                sortBy === option.value && styles.sortPillTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Listings Grid */}
      {isLoading && page === 1 ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && page > 1 ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : null
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  sortPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface.modal,
  },
  sortPillActive: {
    backgroundColor: Colors.primary,
  },
  sortPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  sortPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  columnWrapper: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface.modal,
  },
  cardContent: {
    padding: 12,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  skeleton: {
    width: '48%',
    height: 200,
    backgroundColor: Colors.surface.card,
    borderRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  postButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loader: {
    paddingVertical: 20,
  },
})
