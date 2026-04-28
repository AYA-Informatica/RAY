import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  FlatList, RefreshControl, StyleSheet, Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Bell, Heart, MapPin, ChevronRight, Zap } from 'lucide-react-native'
import { ListingCard } from '@/components/molecules/ListingCard'
import { Skeleton } from '@/components/atoms'
import { listingsApi } from '@/services/api'
import { Colors, Typography, Radii, Spacing } from '@/theme/colors'
import { CATEGORIES } from '@/constants/categories'
import type { Listing } from '@/types'

const { width } = Dimensions.get('window')
const CARD_W     = width * 0.58

export const HomeScreen = () => {
  const router = useRouter()
  const [fresh, setFresh]     = useState<Listing[]>([])
  const [popular, setPopular] = useState<Listing[]>([])
  const [deals, setDeals]     = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = async () => {
    try {
      const [f, p, d] = await Promise.all([
        listingsApi.getFresh(),
        listingsApi.getPopular(),
        listingsApi.getBestDeals(),
      ])
      setFresh(f); setPopular(p); setDeals(d)
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const onRefresh = () => { setRefreshing(true); fetchAll() }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationBtn}>
          <MapPin size={14} color={Colors.primary} />
          <Text style={styles.locationText}>Rwanda</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
            <Bell size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/account/saved')} style={styles.iconBtn}>
            <Heart size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search bar ── */}
      <TouchableOpacity
        onPress={() => router.push('/search')}
        style={styles.searchBar}
        activeOpacity={0.85}
      >
        <Text style={styles.searchPlaceholder}>Search for items, brands, or categories...</Text>
      </TouchableOpacity>

      {/* ── Categories ── */}
      <View style={{ paddingHorizontal: Spacing[4], marginBottom: Spacing[5] }}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => router.push(`/category/${cat.id}`)}
              style={styles.categoryCard}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 28 }}>{cat.emoji}</Text>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
              {cat.listingCount !== undefined && (
                <Text style={styles.categoryCount}>
                  {cat.listingCount >= 1000 ? `${(cat.listingCount / 1000).toFixed(1)}k` : cat.listingCount}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Premium banner ── */}
      <View style={styles.premiumBanner}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Zap size={14} color={Colors.warning} />
            <Text style={styles.premiumTitle}>Sell Faster with Premium</Text>
          </View>
          <Text style={styles.premiumSub}>Get 3x more visibility for your listings</Text>
        </View>
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>

      {/* ── Fresh Near You ── */}
      <Section
        title="Fresh Near You"
        onSeeAll={() => router.push('/search?sort=newest')}
        loading={loading}
        horizontal
      >
        {fresh.map((l) => (
          <ListingCard key={l.id} listing={l} width={CARD_W} />
        ))}
      </Section>

      {/* ── Popular in Kigali ── */}
      <Section
        title="Popular in Kigali"
        onSeeAll={() => router.push('/search?sort=popular')}
        loading={loading}
      >
        <View style={styles.twoColGrid}>
          {popular.slice(0, 6).map((l) => (
            <View key={l.id} style={{ width: '48%' }}>
              <ListingCard listing={l} />
            </View>
          ))}
        </View>
      </Section>

      {/* ── Best Deals Today ── */}
      <Section
        title="Best Deals Today"
        onSeeAll={() => router.push('/search?sort=price_asc')}
        loading={loading}
        horizontal
      >
        {deals.map((l) => (
          <ListingCard key={l.id} listing={l} width={CARD_W} />
        ))}
      </Section>
    </ScrollView>
  )
}

// ─── Section wrapper ─────────────────────────
const Section = ({
  title, onSeeAll, loading, horizontal, children,
}: {
  title: string
  onSeeAll: () => void
  loading: boolean
  horizontal?: boolean
  children: React.ReactNode
}) => (
  <View style={{ marginBottom: Spacing[6] }}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.seeAll}>See all</Text>
        <ChevronRight size={14} color={Colors.primary} />
      </TouchableOpacity>
    </View>

    {loading ? (
      horizontal ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: Spacing[4] }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={{ width: CARD_W }}>
              <Skeleton height={CARD_W * 0.75} radius={Radii.xl} />
              <View style={{ padding: 10, gap: 8 }}>
                <Skeleton height={14} width="60%" />
                <Skeleton height={12} width="40%" />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.twoColGrid, { paddingHorizontal: Spacing[4] }]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={{ width: '48%', gap: 8 }}>
              <Skeleton height={120} radius={Radii.xl} />
              <Skeleton height={14} width="60%" />
              <Skeleton height={12} width="40%" />
            </View>
          ))}
        </View>
      )
    ) : horizontal ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: Spacing[4] }}
      >
        {children}
      </ScrollView>
    ) : (
      <View style={{ paddingHorizontal: Spacing[4] }}>{children}</View>
    )}
  </View>
)

const styles = StyleSheet.create({
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
  },
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceModal,
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: Radii.full, borderWidth: 1, borderColor: Colors.border,
  },
  locationText: { color: Colors.textPrimary, fontSize: Typography.sm, fontFamily: Typography.fontSansBold, fontWeight: '600' },
  headerRight:  { flexDirection: 'row', gap: 4 },
  iconBtn:      { padding: 8, borderRadius: Radii.lg },
  searchBar: {
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[5],
    backgroundColor: Colors.surfaceModal,
    borderRadius: Radii.xl,
    borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 13, paddingHorizontal: 16,
  },
  searchPlaceholder: { color: Colors.textMuted, fontSize: Typography.sm, fontFamily: Typography.fontSans },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  categoryCard: {
    width: (width - Spacing[4] * 2 - 30) / 4,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.xl,
    alignItems: 'center',
    padding: 10, gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  categoryLabel: { color: Colors.textPrimary, fontSize: Typography.xs, fontWeight: '600', fontFamily: Typography.fontSansBold, textAlign: 'center' },
  categoryCount: { color: Colors.textMuted, fontSize: 10, fontFamily: Typography.fontSans },
  premiumBanner: {
    marginHorizontal: Spacing[4], marginBottom: Spacing[6],
    backgroundColor: Colors.navy,
    borderRadius: Radii['2xl'],
    padding: Spacing[4],
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
  },
  premiumTitle: { color: Colors.white, fontSize: Typography.sm, fontWeight: '700', fontFamily: Typography.fontSansBold },
  premiumSub:   { color: 'rgba(255,255,255,0.7)', fontSize: Typography.xs, fontFamily: Typography.fontSans },
  upgradeBtn: {
    backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: Radii.xl,
  },
  upgradeBtnText: { color: Colors.white, fontSize: Typography.xs, fontWeight: '700', fontFamily: Typography.fontSansBold },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing[4], marginBottom: 12,
  },
  sectionTitle: {
    fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary,
    fontFamily: Typography.fontDisplay,
  },
  seeAll: { color: Colors.primary, fontSize: Typography.sm, fontWeight: '600', fontFamily: Typography.fontSansBold },
  twoColGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
})
