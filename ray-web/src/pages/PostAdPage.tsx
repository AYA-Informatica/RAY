import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Camera, X, ChevronRight, ChevronLeft, MapPin,
  AlertCircle, Sparkles, Eye,
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Badge } from '@/components/atoms/Badge'
import { useAuthStore } from '@/store/authStore'
import { listingsApi } from '@/services/api'
import { CATEGORIES } from '@/constants/categories'
import { KIGALI_NEIGHBORHOODS } from '@/constants/locations'
import { STRINGS } from '@/constants/strings'
import type { ListingCategory, ListingCondition } from '@/types'

const TOTAL_STEPS = 6

// ── Zod schema ──
const postAdSchema = z.object({
  category: z.string().min(1, 'Select a category'),
  subcategory: z.string().optional(),
  images: z.array(z.string()).min(1, 'Add at least one photo'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  condition: z.enum(['new', 'like_new', 'good', 'fair']),
  price: z.number({ invalid_type_error: 'Enter a valid price' }).positive('Price must be greater than 0'),
  negotiable: z.boolean(),
  description: z.string().max(500).optional(),
  neighborhood: z.string().min(1, 'Select your location'),
  phone: z.string().min(10, STRINGS.errors.validation.invalidPhone),
  hidePhone: z.boolean(),
  makeFeatured: z.boolean(),
})

type PostAdFormData = z.infer<typeof postAdSchema>

const CONDITIONS: { label: string; value: ListingCondition; desc: string }[] = [
  { label: 'New', value: 'new', desc: 'Brand new, unused, original packaging' },
  { label: 'Like New', value: 'like_new', desc: 'Used once or twice, excellent condition' },
  { label: 'Good', value: 'good', desc: 'Works great, minor signs of use' },
  { label: 'Fair', value: 'fair', desc: 'Functional with visible wear' },
]

export const PostAdPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<PostAdFormData>({
    resolver: zodResolver(postAdSchema),
    defaultValues: {
      negotiable: false,
      hidePhone: false,
      makeFeatured: false,
      phone: user?.phone ?? '',
      images: [],
    },
  })

  const watchedCategory = watch('category') as ListingCategory | undefined
  const watchedTitle = watch('title')
  const watchedPrice = watch('price')
  const watchedCondition = watch('condition')

  // ── Image handling ──
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      const remaining = 10 - imageFiles.length
      const toAdd = files.slice(0, remaining)
      const newFiles = [...imageFiles, ...toAdd]
      const newPreviews = toAdd.map((f) => URL.createObjectURL(f))
      setImageFiles(newFiles)
      setImagePreviews((prev) => [...prev, ...newPreviews])
      setValue('images', newFiles.map((_, i) => `img_${i}`))
    },
    [imageFiles, setValue]
  )

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    URL.revokeObjectURL(imagePreviews[index])
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
    setValue('images', newFiles.map((_, i) => `img_${i}`))
  }

  // ── Step navigation ──
  const stepFields: Record<number, (keyof PostAdFormData)[]> = {
    1: ['category'],
    2: ['images'],
    3: ['title', 'condition', 'price'],
    4: [],
    5: ['neighborhood', 'phone'],
    6: [],
  }

  const goNext = async () => {
    const valid = await trigger(stepFields[step])
    if (valid) setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  const goBack = () => setStep((s) => Math.max(1, s - 1))

  // ── Submit ──
  const onSubmit = async (data: PostAdFormData) => {
    setIsPosting(true)
    setPostError(null)
    try {
      const form = new FormData()
      imageFiles.forEach((file) => form.append('images', file))
      Object.entries(data).forEach(([k, v]) => {
        if (k !== 'images' && v !== undefined) form.append(k, String(v))
      })
      const listing = await listingsApi.create(form)
      navigate(`/listing/${listing.id}?posted=1`)
    } catch (err) {
      setPostError(err instanceof Error ? err.message : STRINGS.errors.generic)
    } finally {
      setIsPosting(false)
    }
  }

  const selectedCat = CATEGORIES.find((c) => c.id === watchedCategory)

  return (
    <>
      <Helmet>
        <title>Post Your Ad | RAY</title>
      </Helmet>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Progress bar ── */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-bold text-text-primary text-xl">
              {STRINGS.postAd.title}
            </h1>
            <span className="text-sm font-sans text-text-secondary">
              {STRINGS.postAd.progressLabel(step, TOTAL_STEPS)}
            </span>
          </div>
          <div className="h-1.5 bg-surface-modal rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          {/* ══════════════ STEP 1: CATEGORY ══════════════ */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-slide-up">
              <div>
                <h2 className="font-display font-bold text-text-primary text-lg">
                  {STRINGS.postAd.step1.title}
                </h2>
                <p className="text-sm text-text-secondary font-sans mt-1">
                  {STRINGS.postAd.step1.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setValue('category', cat.id)}
                    className={clsx(
                      'flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-150',
                      watchedCategory === cat.id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-surface-card border-border hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    <span className="text-3xl">{cat.emoji}</span>
                    <span
                      className={clsx(
                        'text-xs font-semibold font-sans text-center',
                        watchedCategory === cat.id ? 'text-primary' : 'text-text-secondary'
                      )}
                    >
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>

              {errors.category && (
                <p className="text-sm text-danger font-sans flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {errors.category.message}
                </p>
              )}

              {/* Subcategory */}
              {selectedCat && (
                <div className="flex flex-col gap-2 animate-fade-in">
                  <p className="text-sm font-semibold text-text-secondary font-sans">Subcategory</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCat.subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setValue('subcategory', sub)}
                        className={clsx(
                          'px-3 py-1.5 rounded-full text-sm font-sans border transition-colors',
                          watch('subcategory') === sub
                            ? 'bg-primary text-white border-primary'
                            : 'bg-surface-modal text-text-secondary border-border hover:border-primary'
                        )}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ STEP 2: PHOTOS ══════════════ */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-slide-up">
              <div>
                <h2 className="font-display font-bold text-text-primary text-lg">
                  {STRINGS.postAd.step2.title}
                </h2>
                <p className="text-sm text-text-secondary font-sans mt-1">
                  {STRINGS.postAd.step2.max}. {STRINGS.postAd.step2.subtitle}
                </p>
              </div>

              {/* Nudge banner */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-2xl">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm font-sans text-primary font-semibold">
                  {STRINGS.postAd.step2.nudge}
                </p>
              </div>

              {/* Photo grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-surface-modal group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-center">
                        <span className="text-[10px] text-white font-semibold font-sans">
                          {STRINGS.postAd.step2.coverLabel}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {imagePreviews.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 transition-colors group"
                  >
                    <Camera className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors" />
                    <span className="text-xs text-text-muted font-sans group-hover:text-primary">
                      {imagePreviews.length === 0 ? 'Add photo' : 'Add more'}
                    </span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />

              {errors.images && (
                <p className="text-sm text-danger font-sans flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {errors.images.message}
                </p>
              )}
            </div>
          )}

          {/* ══════════════ STEP 3: DETAILS ══════════════ */}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-slide-up">
              <h2 className="font-display font-bold text-text-primary text-lg">
                {STRINGS.postAd.step3.title}
              </h2>

              <Input
                label={STRINGS.postAd.step3.titleLabel}
                placeholder={STRINGS.postAd.step3.titlePlaceholder}
                hint={STRINGS.postAd.step3.titleHint}
                error={errors.title?.message}
                {...register('title')}
              />

              {/* Condition selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary font-sans">
                  {STRINGS.postAd.step3.conditionLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map(({ label, value, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue('condition', value)}
                      className={clsx(
                        'flex flex-col gap-0.5 p-3 rounded-2xl border text-left transition-all',
                        watchedCondition === value
                          ? 'bg-primary/10 border-primary'
                          : 'bg-surface-card border-border hover:border-primary/50'
                      )}
                    >
                      <span
                        className={clsx(
                          'text-sm font-semibold font-sans',
                          watchedCondition === value ? 'text-primary' : 'text-text-primary'
                        )}
                      >
                        {label}
                      </span>
                      <span className="text-xs text-text-muted font-sans">{desc}</span>
                    </button>
                  ))}
                </div>
                {errors.condition && (
                  <p className="text-sm text-danger font-sans">{errors.condition.message}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary font-sans">
                  {STRINGS.postAd.step3.priceLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-semibold font-sans text-sm">
                    Rwf
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    min={0}
                    className={clsx(
                      'w-full pl-12 pr-4 py-3 bg-surface-modal border rounded-2xl',
                      'font-sans text-sm text-text-primary placeholder:text-text-muted',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                      errors.price ? 'border-danger' : 'border-border'
                    )}
                    {...register('price', { valueAsNumber: true })}
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-danger font-sans">{errors.price.message}</p>
                )}

                <Controller
                  control={control}
                  name="negotiable"
                  render={({ field }) => (
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="text-sm font-sans text-text-secondary">
                        {STRINGS.postAd.step3.negotiable}
                      </span>
                    </label>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══════════════ STEP 4: DESCRIPTION ══════════════ */}
          {step === 4 && (
            <div className="flex flex-col gap-5 animate-slide-up">
              <div>
                <h2 className="font-display font-bold text-text-primary text-lg">
                  {STRINGS.postAd.step4.title}{' '}
                  <span className="text-text-muted text-base font-sans font-normal">
                    {STRINGS.postAd.step4.optional}
                  </span>
                </h2>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary font-sans">
                  {STRINGS.postAd.step4.label}
                </label>
                <div className="relative">
                  <textarea
                    rows={6}
                    placeholder={STRINGS.postAd.step4.placeholder}
                    maxLength={STRINGS.postAd.step4.maxChars}
                    className={clsx(
                      'w-full px-4 py-3 bg-surface-modal border border-border rounded-2xl resize-none',
                      'font-sans text-sm text-text-primary placeholder:text-text-muted',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    )}
                    {...register('description')}
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-text-muted font-sans">
                    {(watch('description') ?? '').length}/{STRINGS.postAd.step4.maxChars}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ STEP 5: LOCATION ══════════════ */}
          {step === 5 && (
            <div className="flex flex-col gap-5 animate-slide-up">
              <h2 className="font-display font-bold text-text-primary text-lg">
                {STRINGS.postAd.step5.title}
              </h2>

              {/* Location selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary font-sans">
                  {STRINGS.postAd.step5.label}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                  <select
                    className={clsx(
                      'w-full pl-10 pr-4 py-3 bg-surface-modal border rounded-2xl appearance-none',
                      'font-sans text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary',
                      errors.neighborhood ? 'border-danger' : 'border-border'
                    )}
                    {...register('neighborhood')}
                  >
                    <option value="">{STRINGS.postAd.step5.label}</option>
                    {KIGALI_NEIGHBORHOODS.map((n) => (
                      <option key={n.name} value={n.displayLabel}>
                        {n.displayLabel}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.neighborhood && (
                  <p className="text-sm text-danger font-sans">{errors.neighborhood.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <Input
                  label={STRINGS.postAd.step5.phoneLabel}
                  placeholder={STRINGS.postAd.step5.phonePlaceholder}
                  type="tel"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <Controller
                  control={control}
                  name="hidePhone"
                  render={({ field }) => (
                    <label className="flex items-center gap-2.5 cursor-pointer px-1">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="text-sm font-sans text-text-secondary">
                        {STRINGS.postAd.step5.hidePhone}
                      </span>
                    </label>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══════════════ STEP 6: REVIEW ══════════════ */}
          {step === 6 && (
            <div className="flex flex-col gap-5 animate-slide-up">
              <h2 className="font-display font-bold text-text-primary text-lg">
                {STRINGS.postAd.step6.title}
              </h2>

              {/* Preview card */}
              <div className="bg-surface-card rounded-3xl overflow-hidden border border-border">
                {imagePreviews[0] && (
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img src={imagePreviews[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 flex flex-col gap-2">
                  <p className="text-primary font-bold text-xl font-sans">
                    {watchedPrice ? STRINGS.currency.format(watchedPrice) : '—'}
                  </p>
                  <p className="text-text-primary font-semibold font-sans">
                    {watchedTitle || 'Your title here'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {watchedCondition && (
                      <Badge variant={watchedCondition === 'new' ? 'success' : 'muted'}>
                        {STRINGS.listing.condition[watchedCondition]}
                      </Badge>
                    )}
                    {selectedCat && (
                      <Badge variant="muted">{selectedCat.label}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary font-sans flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {watch('neighborhood') || 'Location not set'}
                  </p>
                </div>
              </div>

              {/* Featured upsell */}
              <Controller
                control={control}
                name="makeFeatured"
                render={({ field }) => (
                  <div
                    className={clsx(
                      'flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer',
                      field.value
                        ? 'bg-primary/10 border-primary'
                        : 'bg-surface-card border-border hover:border-primary/40'
                    )}
                    onClick={() => field.onChange(!field.value)}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary font-sans">
                        {STRINGS.postAd.step6.makeFeatured}
                      </p>
                      <p className="text-xs text-text-secondary font-sans mt-0.5">
                        {STRINGS.postAd.step6.featuredBenefit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-muted font-sans line-through">Rwf 999</p>
                      <p className="text-sm font-bold text-primary font-sans">
                        {STRINGS.postAd.featuredPrice}
                      </p>
                    </div>
                  </div>
                )}
              />

              {postError && (
                <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <p className="text-sm font-sans text-danger">{postError}</p>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="xl"
                loading={isPosting}
                leftIcon={<Eye className="w-4 h-4" />}
              >
                {STRINGS.postAd.step6.postAd}
              </Button>

              <p className="text-xs text-text-muted font-sans text-center">
                {STRINGS.postAd.step6.terms}
              </p>
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={goBack}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            )}
            {step < TOTAL_STEPS && (
              <Button
                type="button"
                size="lg"
                fullWidth
                onClick={goNext}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            )}
          </div>
        </form>
      </main>
    </>
  )
}
