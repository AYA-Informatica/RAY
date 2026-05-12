import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { ChevronLeft, Navigation } from 'lucide-react-native'
import { listingsApi } from '@/services/api'
import { useLocationStore } from '@/store/locationStore'
import { Colors } from '@/theme/colors'
import { CATEGORY_FIELDS } from '@/constants/categoryFields'
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
  const { userLocation, requestGpsLocation } = useLocationStore()

  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [metaFilters, setMetaFilters] = useState<Record<string, string>>({})
  const [distanceFilter, setDistanceFilter] = useState<number | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)

  const fetchListings = async (refresh = false, sort: SortOption = sortBy, meta: Record<string, string> = metaFilters, distance: number | undefined = distanceFilter) => {
    if (refresh) {
      setIsRefreshing(true)
      setPage(1)
    } else {
      setIsLoading(true)
    }

    try {
      const result = await listingsApi.search({
        category,
        sortBy:     distance !== undefined ? 'nearest' : sort,
        page:       refresh ? 1 : page,
        limit:      20,
        meta:       Object.fromEntries(Object.entries(meta).filter(([, v]) => v)),
        distanceKm: distance,
        userLat:    distance !== undefined ? userLocation?.lat : undefined,
        userLng:    distance !== undefined ? userLocation?.lng : undefined,
      })

      setListings(refresh ? result.listings : [...listings, ...result.listings])
      setHasMore(result.hasMore)
      if (!refresh) setPage(page + 1)
    } catch (err) {
      // Handle error
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [category, sortBy, metaFilters])

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
        <TouchableOpacity
          style={[styles.filterBtn, Object.values(metaFilters).some(Boolean) && styles.filterBtnActive]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={[styles.filterBtnText, Object.values(metaFilters).some(Boolean) && { color: '#fff' }]}>
            ⚙ Filter
          </Text>
        </TouchableOpacity>
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

    {/* Filter Modal */}
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
        activeOpacity={1}
        onPress={() => setShowFilters(false)}
      />
      <View style={styles.filterPanel}>
        <View style={styles.filterPanelHeader}>
          <Text style={styles.filterPanelTitle}>Filters</Text>
          <TouchableOpacity onPress={() => { setMetaFilters({}); setShowFilters(false) }}>
            <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '700' }}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Distance filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Distance</Text>
            {!userLocation ? (
              <TouchableOpacity
                style={styles.enableLocationBtn}
                onPress={requestGpsLocation}
              >
                <Navigation size={14} color={Colors.primary} />
                <Text style={styles.enableLocationBtnText}>Enable location for distance filter</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.filterChipsRow}>
                {([
                  { label: 'Any', value: undefined },
                  { label: '10 km', value: 10 },
                  { label: '20 km', value: 20 },
                  { label: '30 km', value: 30 },
                  { label: '50 km', value: 50 },
                ] as { label: string; value: number | undefined }[]).map(({ label, value }) => (
                  <TouchableOpacity
                    key={label}
                    style={[styles.filterChip, distanceFilter === value && styles.filterChipActive]}
                    onPress={() => setDistanceFilter(value)}
                  >
                    <Text style={[styles.filterChipText, distanceFilter === value && { color: '#fff' }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {CATEGORY_FIELDS[category]
            ?.filter((f) => f.type === 'select')
            .map((field) => (
              <View key={field.key} style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>{field.label}</Text>
                <View style={styles.filterChipsRow}>
                  {field.options?.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.filterChip, metaFilters[field.key] === opt && styles.filterChipActive]}
                      onPress={() =>
                        setMetaFilters((prev) => ({
                          ...prev,
                          [field.key]: prev[field.key] === opt ? '' : opt,
                        }))
                      }
                    >
                      <Text style={[styles.filterChipText, metaFilters[field.key] === opt && { color: '#fff' }]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          <View style={{ height: 20 }} />
        </ScrollView>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => {
            setShowFilters(false)
            fetchListings(true, sortBy, metaFilters, distanceFilter)
          }}
        >
          <Text style={styles.applyBtnText}>Show Results</Text>
        </TouchableOpacity>
      </View>
    </Modal>
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
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface.modal,
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  filterBtnText: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: Colors.surface.card,
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
  filterPanel: {
    backgroundColor: Colors.surface.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  filterPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterPanelTitle: {
    color: Colors.text.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface.modal,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  filterChipText: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  enableLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  enableLocationBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})
