import React, { useState, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Search, X } from 'lucide-react-native'
import { Colors } from '@/theme/colors'
import { STRINGS } from '@/constants'
import { listingsApi } from '@/services/api'
import type { Listing } from '@/types'

const RECENT_SEARCHES_KEY = 'ray_recent_searches'

export const SearchScreen = () => {
  const navigation = useNavigation<any>()
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<Listing[]>([])
  const [isSearching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setSearching(true)
    setHasSearched(true)
    try {
      const res = await listingsApi.search({ query: q, sortBy: 'newest', page: 1, limit: 20 })
      setResults(res.listings)
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.inputWrap}>
          <Search size={16} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder={STRINGS.home.searchPlaceholder}
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setHasSearched(false) }}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {isSearching ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptySubtitle}>Try different keywords</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
            >
              <View style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <Text style={styles.price}>{STRINGS.currency.format(item.price)}</Text>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.location} numberOfLines={1}>{item.location.displayLabel}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  searchRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  inputWrap:   { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceModal, borderRadius: 14, paddingHorizontal: 12, height: 44, gap: 8 },
  searchIcon:  { flexShrink: 0 },
  input:       { flex: 1, color: Colors.textPrimary, fontSize: 14, fontFamily: 'DMSans' },
  cancel:      { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  list:        { padding: 12 },
  row:         { gap: 12, marginBottom: 12 },
  card:        { flex: 1, backgroundColor: Colors.surfaceCard, borderRadius: 16, overflow: 'hidden' },
  cardImage:   { height: 120, backgroundColor: Colors.surfaceModal },
  cardInfo:    { padding: 10, gap: 3 },
  price:       { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  title:       { color: Colors.textPrimary, fontWeight: '600', fontSize: 13 },
  location:    { color: Colors.textSecondary, fontSize: 11 },
  emptyState:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji:  { fontSize: 48 },
  emptyTitle:  { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  emptySubtitle: { color: Colors.textSecondary, fontSize: 13 },
})
