import React, { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Image, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import { Camera, X, ChevronRight, ChevronLeft, MapPin } from 'lucide-react-native'
import { Colors } from '@/theme/colors'
import { STRINGS, CATEGORIES, KIGALI_NEIGHBORHOODS } from '@/constants'
import { listingsApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const TOTAL_STEPS = 6

interface FormData {
  category:    string
  subcategory: string
  images:      string[]
  title:       string
  condition:   'new' | 'like_new' | 'good' | 'fair'
  price:       string
  negotiable:  boolean
  description: string
  neighborhood:string
  phone:       string
  hidePhone:   boolean
  makeFeatured:boolean
}

const CONDITIONS = [
  { value: 'new' as const,      label: 'New',      desc: 'Brand new, unused' },
  { value: 'like_new' as const, label: 'Like New', desc: 'Used once or twice' },
  { value: 'good' as const,     label: 'Good',     desc: 'Works great, minor wear' },
  { value: 'fair' as const,     label: 'Fair',     desc: 'Functional with visible wear' },
]

export const PostAdScreen = () => {
  const navigation = useNavigation<any>()
  const { user }   = useAuthStore()

  const [step, setStep]       = useState(1)
  const [posting, setPosting] = useState(false)
  const [form, setForm]       = useState<FormData>({
    category: '', subcategory: '', images: [],
    title: '', condition: 'good', price: '', negotiable: false,
    description: '', neighborhood: '', phone: user?.phone ?? '',
    hidePhone: false, makeFeatured: false,
  })

  const update = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((f) => ({ ...f, [key]: val }))
  }, [])

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri).slice(0, 10 - form.images.length)
      update('images', [...form.images, ...uris])
    }
  }

  const goNext = () => {
    // Step-level validation
    if (step === 1 && !form.category) { Alert.alert('Select a category'); return }
    if (step === 2 && form.images.length === 0) { Alert.alert('Add at least one photo'); return }
    if (step === 3 && !form.title.trim()) { Alert.alert('Add a title'); return }
    if (step === 5 && !form.neighborhood) { Alert.alert('Select your location'); return }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  const goBack = () => setStep((s) => Math.max(1, s - 1))

  const handlePost = async () => {
    setPosting(true)
    try {
      const fd = new FormData()
      form.images.forEach((uri, i) => {
        fd.append('images', {
          uri,
          name: `photo_${i}.jpg`,
          type: 'image/jpeg',
        } as never)
      })
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'images') fd.append(k, String(v))
      })
      const listing = await listingsApi.create(fd)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      navigation.replace('ListingDetail', { listingId: listing.id })
    } catch {
      Alert.alert('Error', STRINGS.errors.generic)
    } finally {
      setPosting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <X size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{STRINGS.postAd.title}</Text>
        <Text style={styles.stepLabel}>
          {step}/{TOTAL_STEPS}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">

        {/* ── STEP 1: CATEGORY ── */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What are you selling?</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catItem, form.category === cat.id && styles.catItemActive]}
                  onPress={() => update('category', cat.id)}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.catLabel, form.category === cat.id && styles.catLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Subcategory */}
            {form.category && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Subcategory</Text>
                <View style={styles.subRow}>
                  {CATEGORIES.find((c) => c.id === form.category)?.subcategories.map((sub) => (
                    <TouchableOpacity
                      key={sub}
                      style={[styles.subChip, form.subcategory === sub && styles.subChipActive]}
                      onPress={() => update('subcategory', sub)}
                    >
                      <Text style={[styles.subChipText, form.subcategory === sub && { color: '#fff' }]}>
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── STEP 2: PHOTOS ── */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add Photos</Text>
            <View style={styles.nudgeBanner}>
              <Text style={styles.nudgeText}>{STRINGS.postAd.nudge}</Text>
            </View>
            <View style={styles.photoGrid}>
              {form.images.map((uri, i) => (
                <View key={i} style={styles.photoCell}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                  {i === 0 && (
                    <View style={styles.coverLabel}>
                      <Text style={styles.coverText}>Cover</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => update('images', form.images.filter((_, j) => j !== i))}
                  >
                    <X size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {form.images.length < 10 && (
                <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
                  <Camera size={28} color={Colors.textMuted} />
                  <Text style={styles.addPhotoText}>
                    {form.images.length === 0 ? 'Add photos' : 'Add more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── STEP 3: DETAILS ── */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Item Details</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Ad Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., iPhone 14 Pro Max 256GB"
                placeholderTextColor={Colors.textMuted}
                value={form.title}
                onChangeText={(v) => update('title', v)}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Condition</Text>
              <View style={styles.conditionGrid}>
                {CONDITIONS.map(({ value, label, desc }) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.condCard, form.condition === value && styles.condCardActive]}
                    onPress={() => update('condition', value)}
                  >
                    <Text style={[styles.condLabel, form.condition === value && { color: Colors.primary }]}>
                      {label}
                    </Text>
                    <Text style={styles.condDesc}>{desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Price</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currencyPrefix}>Rwf</Text>
                <TextInput
                  style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(v) => update('price', v)}
                />
              </View>
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => update('negotiable', !form.negotiable)}
              >
                <View style={[styles.checkbox, form.negotiable && styles.checkboxChecked]}>
                  {form.negotiable && <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>}
                </View>
                <Text style={styles.checkLabel}>Price is negotiable</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── STEP 4: DESCRIPTION ── */}
        {step === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Description <Text style={styles.optional}>(Optional)</Text></Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Include details like condition, features, reason for selling..."
              placeholderTextColor={Colors.textMuted}
              value={form.description}
              onChangeText={(v) => update('description', v)}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{form.description.length}/500</Text>
          </View>
        )}

        {/* ── STEP 5: LOCATION ── */}
        {step === 5 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Location</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Neighborhood</Text>
              <View style={styles.pickerWrap}>
                <MapPin size={16} color={Colors.primary} style={{ marginRight: 8 }} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {KIGALI_NEIGHBORHOODS.map((n) => (
                      <TouchableOpacity
                        key={n.name}
                        style={[styles.locationChip, form.neighborhood === n.displayLabel && styles.locationChipActive]}
                        onPress={() => update('neighborhood', n.displayLabel)}
                      >
                        <Text style={[styles.locationChipText, form.neighborhood === n.displayLabel && { color: '#fff' }]}>
                          {n.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+250 7xx xxx xxxx"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(v) => update('phone', v)}
              />
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => update('hidePhone', !form.hidePhone)}
              >
                <View style={[styles.checkbox, form.hidePhone && styles.checkboxChecked]}>
                  {form.hidePhone && <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>}
                </View>
                <Text style={styles.checkLabel}>Hide phone number in ad</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── STEP 6: REVIEW ── */}
        {step === 6 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & Post</Text>

            {/* Preview card */}
            <View style={styles.previewCard}>
              {form.images[0] && (
                <Image source={{ uri: form.images[0] }} style={styles.previewImage} resizeMode="cover" />
              )}
              <View style={styles.previewInfo}>
                <Text style={styles.previewPrice}>
                  {form.price ? `Rwf ${Number(form.price).toLocaleString()}` : 'Price not set'}
                </Text>
                <Text style={styles.previewTitle} numberOfLines={2}>
                  {form.title || 'Your title here'}
                </Text>
                <Text style={styles.previewLocation}>{form.neighborhood || 'Location not set'}</Text>
              </View>
            </View>

            {/* Featured upsell */}
            <TouchableOpacity
              style={[styles.featuredUpsell, form.makeFeatured && styles.featuredUpsellActive]}
              onPress={() => update('makeFeatured', !form.makeFeatured)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.featuredTitle}>Make it Featured</Text>
                <Text style={styles.featuredDesc}>Get 3x more views and sell faster</Text>
              </View>
              <View>
                <Text style={styles.featuredPrice}>Rwf 499</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.postBtn, posting && styles.postBtnDisabled]}
              onPress={handlePost}
              disabled={posting}
            >
              {posting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.postBtnText}>Post Ad</Text>}
            </TouchableOpacity>

            <Text style={styles.terms}>By posting you agree to our Terms & Conditions</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navBar}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <ChevronLeft size={18} color={Colors.textPrimary} />
            <Text style={styles.backBtnText}>{STRINGS.postAd.back}</Text>
          </TouchableOpacity>
        )}
        {step < TOTAL_STEPS && (
          <TouchableOpacity style={[styles.nextBtn, step === 1 && { flex: 1 }]} onPress={goNext}>
            <Text style={styles.nextBtnText}>{STRINGS.postAd.continue}</Text>
            <ChevronRight size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: Colors.background },
  header:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  headerTitle:        { flex: 1, textAlign: 'center', color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  stepLabel:          { color: Colors.textSecondary, fontSize: 13 },
  progressTrack:      { height: 3, backgroundColor: Colors.surfaceModal, marginHorizontal: 16, borderRadius: 2 },
  progressFill:       { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  body:               { flex: 1 },
  stepContent:        { padding: 20, gap: 16 },
  stepTitle:          { color: Colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  optional:           { color: Colors.textMuted, fontSize: 14, fontWeight: '400' },
  categoryGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catItem:            { width: '30%', alignItems: 'center', padding: 14, backgroundColor: Colors.surfaceCard, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border },
  catItemActive:      { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  catEmoji:           { fontSize: 28, marginBottom: 6 },
  catLabel:           { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  catLabelActive:     { color: Colors.primary },
  subSection:         { marginTop: 8 },
  subTitle:           { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  subRow:             { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subChip:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.surfaceModal, borderWidth: 1, borderColor: Colors.border },
  subChipActive:      { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  subChipText:        { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  nudgeBanner:        { backgroundColor: Colors.primary + '20', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.primary + '40' },
  nudgeText:          { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  photoGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoCell:          { width: 100, height: 100, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoThumb:         { width: '100%', height: '100%' },
  coverLabel:         { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 3, alignItems: 'center' },
  coverText:          { color: '#fff', fontSize: 10, fontWeight: '700' },
  removePhoto:        { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  addPhotoBtn:        { width: 100, height: 100, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', gap: 4 },
  addPhotoText:       { color: Colors.textMuted, fontSize: 11 },
  field:              { gap: 8 },
  fieldLabel:         { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  textInput:          { backgroundColor: Colors.surfaceModal, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: Colors.textPrimary, fontSize: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 4 },
  textArea:           { height: 140, paddingTop: 12 },
  charCount:          { color: Colors.textMuted, fontSize: 11, textAlign: 'right' },
  conditionGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  condCard:           { width: '47%', padding: 12, backgroundColor: Colors.surfaceCard, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border },
  condCardActive:     { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  condLabel:          { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  condDesc:           { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  priceRow:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currencyPrefix:     { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
  checkRow:           { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  checkbox:           { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkLabel:         { color: Colors.textSecondary, fontSize: 13 },
  pickerWrap:         { flexDirection: 'row', alignItems: 'center' },
  locationChip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceModal, borderWidth: 1, borderColor: Colors.border },
  locationChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  locationChipText:   { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  previewCard:        { backgroundColor: Colors.surfaceCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  previewImage:       { width: '100%', height: 180 },
  previewInfo:        { padding: 14, gap: 4 },
  previewPrice:       { color: Colors.primary, fontSize: 22, fontWeight: '800' },
  previewTitle:       { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  previewLocation:    { color: Colors.textSecondary, fontSize: 12 },
  featuredUpsell:     { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: Colors.surfaceCard, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border },
  featuredUpsellActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  featuredTitle:      { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  featuredDesc:       { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  featuredPrice:      { color: Colors.primary, fontSize: 15, fontWeight: '800' },
  postBtn:            { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  postBtnDisabled:    { opacity: 0.6 },
  postBtnText:        { color: '#fff', fontSize: 16, fontWeight: '700' },
  terms:              { color: Colors.textMuted, fontSize: 11, textAlign: 'center' },
  navBar:             { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.background },
  backBtn:            { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: Colors.border },
  backBtnText:        { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  nextBtn:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14 },
  nextBtnText:        { color: '#fff', fontSize: 15, fontWeight: '700' },
})
