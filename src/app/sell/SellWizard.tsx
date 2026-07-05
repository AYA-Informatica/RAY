"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, X, Check, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { CategorySelector } from "@/components/search/CategorySelector";
import { PriceTag } from "@/components/listings/PriceTag";
import { useSellDraft } from "@/store/useSellDraft";
import { useI18n } from "@/i18n/I18nProvider";
import { uploadImages, isHeicFile } from "@/lib/storage/upload";
import { safeGetItem } from "@/lib/safeStorage";
import { PermissionPrompt } from "@/components/shared/PermissionPrompt";
import { cn } from "@/lib/utils/cn";
import { RWANDA_CITIES } from "@/constants/locations";
import { parseAttributeOptions, isAttributeVisible } from "@/lib/utils/categoryAttributes";
import type { CategoryWithAttributes } from "@/types";

interface SellCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

const STEP_COUNT = 6;

/** Sentinel value for the auto-appended "Other" option on SELECT attributes. */
const OTHER_VALUE = "__OTHER__";

/**
 * Maps category-specific condition labels → global Condition enum values.
 * Used when a category owns its own condition attribute so we can still
 * persist a meaningful global condition for search/filtering without
 * showing the seller a redundant second picker.
 */
const CONDITION_MAP: Record<string, string> = {
  // Beauty
  "New / Sealed": "NEW",
  "Used — Like New": "LIKE_NEW",
  // Bikes / Kitchen (mirror the global labels exactly)
  "New": "NEW",
  "Like New": "LIKE_NEW",
  "Good": "GOOD",
  "Fair": "FAIR",
  "Used": "USED",
  // Construction
  "New / Unused": "NEW",
  "Used / Surplus": "USED",
  // Machinery
  "Excellent — like new": "NEW",
  "Good — fully operational": "GOOD",
  "Fair — needs minor repair": "FAIR",
  "For parts / Not working": "USED",
};

/**
 * 6-step posting flow (Build Prompt + Product Experience):
 * Category -> Photos -> Basic Details -> Dynamic Specs -> Location -> Review.
 * Target: under 60s. "Structure without intimidation."
 */
export function SellWizard({
  userId,
  categories,
  profileLocation,
}: {
  userId: string | null;
  categories: SellCategory[];
  profileLocation?: { city: string; district: string; neighborhood: string };
}) {
  const router = useRouter();
  const { draft, step, set, setStep, reset } = useSellDraft();
  const { t } = useI18n();

  // Translate a DB attribute label by its key, falling back to the English
  // label stored in the DB when no i18n entry is registered for that key.
  const tLabel = (key: string, fallback: string) => {
    const r = t(`attr.${key}`);
    return r === `attr.${key}` ? fallback : r;
  };
  // Translate a DB attribute option value, falling back to the raw English string.
  // The `value` prop always stores the raw English string so CONDITION_MAP and
  // back-end storage remain locale-independent.
  const tOption = (opt: string) => {
    const r = t(`attrOpt.${opt}`);
    return r === `attrOpt.${opt}` ? opt : r;
  };

  const STEP_LABELS = [
    t("sell.stepCategory"),
    t("sell.stepPhotos"),
    t("sell.stepSpecs"),
    t("sell.stepDetails"),
    t("sell.stepLocation"),
    t("sell.stepReview"),
  ];

  const CONDITIONS = [
    { value: "NEW", label: t("condition.NEW") },
    { value: "LIKE_NEW", label: t("condition.LIKE_NEW") },
    { value: "GOOD", label: t("condition.GOOD") },
    { value: "FAIR", label: t("condition.FAIR") },
    { value: "USED", label: t("condition.USED") },
  ];

  const [schema, setSchema] = useState<CategoryWithAttributes | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [permissionPrompt, setPermissionPrompt] = useState<"camera" | "location" | null>(null);
  const [draftNotice, setDraftNotice] = useState(
    // Show the notice on first render if there's a saved draft worth restoring.
    Boolean(draft.title || draft.images.length > 0 || draft.categoryId),
  );
  const [error, setError] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  // Custom "Other" text per attribute id, keyed only when that attribute is
  // currently in free-text mode (i.e. its dropdown is set to "Other").
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const hasProfileLocation = Boolean(profileLocation?.city);
  // Skip the location step entirely for returning sellers — their profile
  // location is already pre-filled. A "Change" link on the Review step lets
  // them override for a specific listing if needed.
  const skipLocation = hasProfileLocation;
  const [locationMode, setLocationMode] = useState<"profile" | "manual" | "gps">(
    hasProfileLocation ? "profile" : "manual",
  );

  // Pre-fill the draft from the user's profile location, but only for a
  // brand-new session — never overwrite a draft the user already started.
  useEffect(() => {
    if (typeof window === "undefined" || !profileLocation?.city) return;
    if (safeGetItem("ray_sell_draft")) return;
    set({
      city: profileLocation.city,
      district: profileLocation.district,
      neighborhood: profileLocation.neighborhood,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCategory = categories.find((c) => c.id === draft.categoryId);

  // Load the dynamic attribute schema when a category is chosen.
  useEffect(() => {
    if (!selectedCategory) {
      setSchema(null);
      return;
    }
    let active = true;
    void fetchSchema(selectedCategory.slug).then((s) => {
      if (!active) return;
      setSchema(s);
      // A saved draft may hold a custom value for a SELECT attribute (typed
      // via "Other" in a previous session) — restore free-text mode for it.
      setOtherValues((prev) => {
        const next = { ...prev };
        for (const attr of s?.attributes ?? []) {
          if (attr.type !== "SELECT") continue;
          const val = draft.attributes[attr.id];
          const opts = Array.isArray(attr.options) ? (attr.options as string[]) : [];
          if (val && !opts.includes(val)) next[attr.id] = val;
        }
        return next;
      });
    });
    return () => {
      active = false;
    };
  }, [selectedCategory?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const districts = useMemo(() => {
    const city = RWANDA_CITIES.find((c) => c.city === draft.city);
    return city?.districts ?? [];
  }, [draft.city]);

  const neighborhoods = useMemo(() => {
    return districts.find((d) => d.name === draft.district)?.neighborhoods ?? [];
  }, [districts, draft.district]);

  // Skip Specs only when the category truly has no attributes at all.
  // Previously this skipped whenever no attribute was *required*, which silently
  // dropped Jobs (job_type, remote) and Services (service_type) entirely.
  const skipSpecs = (schema?.attributes ?? []).length === 0;

  // When the category supplies its own "condition" attribute in Specs, hide the
  // global Condition picker in step 3 to avoid asking the seller twice.
  const conditionAttr = schema?.attributes.find((a) => a.key === "condition") ?? null;
  const hasOwnCondition = conditionAttr !== null;

  // Jobs and Services are non-physical: the global condition and price fields
  // don't apply (a job posting isn't "Like New"; a service can be quoted).
  const isNonPhysical =
    selectedCategory?.slug === "jobs" || selectedCategory?.slug === "services";

  const hideCondition = hasOwnCondition || isNonPhysical;
  const noPriceRequired = isNonPhysical;

  // After the seller fills Specs, try to pre-populate the title field from
  // key attribute values (Brand, Model, Year, etc.) so they don't have to
  // retype information already captured. Never overwrites an existing title.
  function tryAutoTitle() {
    if (!schema || draft.title.trim().length >= 3) return;
    const get = (key: string): string => {
      const attr = schema.attributes.find((a) => a.key === key);
      return attr ? (draft.attributes[attr.id] ?? "").trim() : "";
    };
    const parts: string[] = [];
    const year = get("year");
    if (year) parts.push(year);
    const brand = get("brand");
    if (brand) parts.push(brand);
    const model = get("model");
    if (model) parts.push(model);
    if (!model) {
      const type =
        get("type") ||
        get("bike_type") ||
        get("item_type") ||
        get("job_type") ||
        get("service_type") ||
        get("property_type") ||
        get("listing_type");
      if (type) parts.push(type);
    }
    const storage = get("storage");
    if (storage) parts.push(storage);
    const suggested = parts.join(" ").trim();
    if (suggested) set({ title: suggested });
  }

  function next() {
    setError(null);
    setDraftNotice(false);
    if (step < STEP_COUNT - 1) {
      const target = step + 1;
      // Specs are now step 2 — skip forward to Details (3) when no attributes exist.
      if (target === 2 && skipSpecs) setStep(3);
      // Location is step 4 — skip to Review (5) when profile location is pre-filled.
      else if (target === 4 && skipLocation) setStep(5);
      else {
        // Auto-generate a title from specs when advancing from Specs → Details.
        if (step === 2) tryAutoTitle();
        setStep(target);
      }
    }
  }
  function back() {
    setError(null);
    if (step > 0) {
      const target = step - 1;
      // Mirror the forward skips when navigating backwards.
      if (target === 2 && skipSpecs) setStep(1);
      else if (target === 4 && skipLocation) setStep(3);
      else setStep(target);
    } else router.replace("/home");
  }

  async function handleFiles(files: FileList | null) {
    if (!files || !userId) return;
    const allFiles = Array.from(files);
    if (allFiles.some(isHeicFile)) {
      setError(t("sell.heicNotSupported"));
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const remaining = 7 - draft.images.length;
      const urls = await uploadImages(allFiles.slice(0, remaining), "listings", userId);
      set({ images: [...draft.images, ...urls].slice(0, 7) });
    } catch {
      setError(t("sell.uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) return;
    // Show RAY's explanation before the OS permission dialog.
    setPermissionPrompt("location");
  }

  function doDetectLocation() {
    setDetectingLocation(true);
    setLocationNote(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { Accept: "application/json" } },
          );
          if (!res.ok) throw new Error("lookup failed");
          const data = (await res.json()) as { address?: Record<string, string> };
          const addr = data.address ?? {};
          // Nominatim returns names like "City of Kigali" / "Musanze District" —
          // strip those wrappers before comparing against RWANDA_CITIES.
          const normalize = (raw: string) =>
            raw.replace(/^city of\s+/i, "").replace(/\s+(district|province|sector|cell)$/i, "").trim();

          const rawCity = addr.city || addr.town || addr.village || addr.county || "";
          const detectedCity = normalize(rawCity);
          const districtCandidates = [addr.suburb, addr.city_district, addr.county, addr.state_district]
            .filter((v): v is string => Boolean(v))
            .map(normalize);

          const match = RWANDA_CITIES.find((c) => c.city.toLowerCase() === detectedCity.toLowerCase());
          if (match) {
            let districtMatch = match.districts.find((d) =>
              districtCandidates.some((cand) => cand.toLowerCase() === d.name.toLowerCase()),
            );
            let neighborhoodMatch: string | undefined;
            if (!districtMatch) {
              for (const d of match.districts) {
                const n = d.neighborhoods.find((nb) =>
                  districtCandidates.some((cand) => cand.toLowerCase() === nb.toLowerCase()),
                );
                if (n) {
                  districtMatch = d;
                  neighborhoodMatch = n;
                  break;
                }
              }
            }
            if (!districtMatch && match.districts.length === 1) districtMatch = match.districts[0];

            set({
              city: match.city,
              district: districtMatch?.name ?? "",
              neighborhood: neighborhoodMatch ?? "",
              latitude,
              longitude,
            });
            setLocationNote(t("sell.locationDetected"));
          } else if (detectedCity) {
            set({
              city: detectedCity,
              district: districtCandidates[0] ?? "",
              neighborhood: "",
              latitude,
              longitude,
            });
            setLocationNote(t("profileEdit.locationOutsideArea"));
          } else {
            setLocationNote(t("profileEdit.locationFailed"));
          }
        } catch {
          setLocationNote(t("profileEdit.locationFailed"));
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setLocationNote(t("profileEdit.locationFailed"));
        setDetectingLocation(false);
      },
    );
  }

  async function submit() {
    if (!userId) {
      router.replace("/login?redirect=/sell");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Derive the global condition enum when the category owns its own condition
      // attribute (Beauty, Bikes, Construction, Kitchen, Machinery) so the seller
      // only fills it once. For non-physical categories (Jobs, Services) default
      // to "NEW" since the enum is required at the DB level.
      const effectiveCondition: string = hasOwnCondition && conditionAttr
        ? (CONDITION_MAP[draft.attributes[conditionAttr.id] ?? ""] ?? "USED")
        : (draft.condition || (isNonPhysical ? "NEW" : draft.condition));

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          price: Number(draft.price),
          negotiable: draft.negotiable,
          condition: effectiveCondition,
          categoryId: draft.categoryId,
          city: draft.city,
          district: draft.district,
          neighborhood: draft.neighborhood || undefined,
          latitude: draft.latitude,
          longitude: draft.longitude,
          images: draft.images,
          attributes: Object.entries(draft.attributes)
            .filter(([id, v]) => {
              if (v === "") return false;
              if (!schema) return true;
              const attr = schema.attributes.find((a) => a.id === id);
              return !attr || isAttributeVisible(attr, schema.attributes, draft.attributes);
            })
            .map(([attributeId, value]) => ({ attributeId, value })),
        }),
      });
      if (res.status === 401) {
        router.replace("/login?redirect=/sell");
        return;
      }
      if (!res.ok) {
        const j = (await res.json()) as { error?: { message?: string } };
        throw new Error(j.error?.message ?? t("sell.postError"));
      }
      reset();
      router.push("/profile/ads?posted=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("sell.postError"));
      setSubmitting(false);
    }
  }

  // Per-step "can advance" gate + a human reason when blocked, surfaced under
  // the Continue button so users aren't hunting for the missing field.
  const gate: { ok: true } | { ok: false; reason: string } = (() => {
    switch (step) {
      case 0:
        return draft.categoryId
          ? { ok: true }
          : { ok: false, reason: t("sell.gate.pickCategory") };
      case 1:
        return draft.images.length > 0
          ? { ok: true }
          : { ok: false, reason: t("sell.gate.addPhoto") };
      case 2: {
        // Specs step (now index 2) — ensure all required attributes are filled.
        const all = schema?.attributes ?? [];
        const missing = all
          .filter((a) => isAttributeVisible(a, all, draft.attributes))
          .find((a) => a.required && !draft.attributes[a.id]);
        return missing
          ? { ok: false, reason: t("sell.gate.required").replace("{field}", tLabel(missing.key, missing.label)) }
          : { ok: true };
      }
      case 3: {
        // Details step (now index 3) — title, price, and condition.
        if (draft.title.trim().length < 3) return { ok: false, reason: t("sell.gate.title") };
        if (!noPriceRequired && (draft.price === "" || Number(draft.price) < 0))
          return { ok: false, reason: t("sell.gate.price") };
        if (!hideCondition && draft.condition === "")
          return { ok: false, reason: t("sell.gate.condition") };
        return { ok: true };
      }
      case 4: {
        // Regardless of locationMode, draft.city/district hold whatever will
        // actually be submitted (pre-filled from profile, picked manually, or
        // resolved via GPS) — validate those directly.
        if (!draft.city) return { ok: false, reason: t("sell.gate.city") };
        if (!draft.district) return { ok: false, reason: t("sell.gate.district") };
        return { ok: true };
      }
      default:
        return { ok: true };
    }
  })();
  const canNext = gate.ok;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background lg:max-w-2xl">
      {permissionPrompt && (
        <PermissionPrompt
          type={permissionPrompt}
          onAllow={() => {
            const p = permissionPrompt;
            setPermissionPrompt(null);
            if (p === "location") doDetectLocation();
          }}
          onDismiss={() => setPermissionPrompt(null)}
        />
      )}

      {/* Draft restored banner */}
      {draftNotice && (
        <div className="flex items-center justify-between bg-primary/15 px-4 py-2 text-sm">
          <span className="text-text-primary">📝 {t("chat.draftRestored")}</span>
          <button
            onClick={() => { reset(); setDraftNotice(false); }}
            className="text-xs text-text-secondary underline underline-offset-2 hover:text-text-primary"
          >
            {t("chat.startFresh")}
          </button>
        </div>
      )}
      {/* Header + progress */}
      <header className="sticky top-0 z-10 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={back}
            aria-label={t("common.back")}
            className="-ml-2 grid h-11 w-11 place-items-center text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display text-lg font-bold">{STEP_LABELS[step]}</h1>
          <span
            className="ml-auto text-sm text-text-muted"
            aria-live="polite"
            aria-atomic="true"
          >
            {step + 1}/{STEP_COUNT}
          </span>
        </div>
        <div className="mt-3 flex gap-1">
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={cn("h-1 flex-1 rounded-pill", i <= step ? "bg-primary" : "bg-surface-card")}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 space-y-5 p-4">
        {/* Step 1 — Category */}
        {step === 0 && (
          <div className="space-y-3">
            <p className="font-display text-xl font-bold">{t("sell.whatSelling")}</p>
            <CategorySelector
              categories={categories.map((c) => ({
                slug: c.id,
                // Convert slug to camelCase i18n key: "residential-rentals" → "category.residentialRentals"
                name: t(`category.${c.slug.replace(/-([a-z])/g, (_, l: string) => l.toUpperCase())}`),
                icon: c.icon,
              }))}
              value={draft.categoryId}
              onChange={(id) => {
                set({ categoryId: id, attributes: {} });
                setOtherValues({});
              }}
            />
          </div>
        )}

        {/* Step 2 — Photos first */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">{t("sell.addPhotos")}</p>
            <div className="grid grid-cols-3 gap-3">
              {draft.images.map((url, i) => (
                <div key={url} className="relative aspect-square overflow-hidden rounded-md bg-surface-modal">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={t("sell.photoAlt").replace("{n}", String(i + 1))} className="h-full w-full object-cover" />
                  <button
                    onClick={() => set({ images: draft.images.filter((u) => u !== url) })}
                    className="absolute -right-1 -top-1 grid h-11 w-11 place-items-center"
                    aria-label={t("sell.removePhoto")}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-pill bg-black/70">
                      <X size={16} />
                    </span>
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-sm bg-primary px-1.5 text-[10px] font-bold">
                      {t("sell.cover")}
                    </span>
                  )}
                </div>
              ))}
              {draft.images.length < 7 && (
                <label className="grid aspect-square cursor-pointer place-items-center rounded-md border border-dashed border-border bg-surface-card text-text-secondary">
                  {uploading ? <Loader2 className="animate-spin" /> : <Camera />}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={uploading || !userId}
                  />
                </label>
              )}
            </div>
            {!userId && (
              <p className="text-xs text-warning">{t("sell.signInToPost")}</p>
            )}
          </div>
        )}

        {/* Step 3 — Dynamic category specs */}
        {step === 2 && (
          <div className="space-y-4">
            {!schema || schema.attributes.length === 0 ? (
              <p className="text-sm text-text-secondary">{t("sell.noSpecsNeeded")}</p>
            ) : (
              schema.attributes
                .filter((attr) => isAttributeVisible(attr, schema.attributes, draft.attributes))
                .map((attr) => {
                  const val = draft.attributes[attr.id] ?? "";
                  const setVal = (v: string) => {
                    const nextAttributes = { ...draft.attributes, [attr.id]: v };
                    // Clear values for attributes that depend on this one and
                    // are no longer visible with the new value.
                    for (const other of schema.attributes) {
                      if (other.id === attr.id) continue;
                      const { showIf } = parseAttributeOptions(other.options);
                      if (showIf?.key === attr.key && !showIf.in.includes(v)) {
                        delete nextAttributes[other.id];
                        setOtherValues((prev) => {
                          if (!(other.id in prev)) return prev;
                          const next = { ...prev };
                          delete next[other.id];
                          return next;
                        });
                      }
                    }
                    set({ attributes: nextAttributes });
                  };
                  if (attr.type === "SELECT") {
                    const { values: opts } = parseAttributeOptions(attr.options);
                    const filteredOpts = opts.filter((o) => o.toLowerCase() !== "other");
                    const isOther = otherValues[attr.id] !== undefined;
                    return (
                      <div key={attr.id} className="space-y-2">
                        <Select
                          label={tLabel(attr.key, attr.label)}
                          required={attr.required}
                          placeholder={t("sell.selectAttribute").replace("{field}", tLabel(attr.key, attr.label).toLowerCase())}
                          options={[...filteredOpts.map((o) => ({ value: o, label: tOption(o) })), { value: OTHER_VALUE, label: t("sell.otherOption") }]}
                          value={isOther ? OTHER_VALUE : val}
                          onChange={(e) => {
                            if (e.target.value === OTHER_VALUE) {
                              setOtherValues((prev) => ({ ...prev, [attr.id]: "" }));
                              setVal("");
                            } else {
                              setOtherValues((prev) => {
                                const next = { ...prev };
                                delete next[attr.id];
                                return next;
                              });
                              setVal(e.target.value);
                            }
                          }}
                        />
                        {isOther && (
                          <Input
                            placeholder={t("sell.otherPlaceholder")}
                            value={otherValues[attr.id] ?? ""}
                            onChange={(e) => {
                              setOtherValues((prev) => ({ ...prev, [attr.id]: e.target.value }));
                              setVal(e.target.value);
                            }}
                          />
                        )}
                      </div>
                    );
                  }
                  if (attr.type === "BOOLEAN") {
                    return (
                      <label key={attr.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={val === "true"}
                          onChange={(e) => setVal(e.target.checked ? "true" : "false")}
                          className="accent-[#E8390E]"
                        />
                        {tLabel(attr.key, attr.label)}
                      </label>
                    );
                  }
                  return (
                    <Input
                      key={attr.id}
                      label={tLabel(attr.key, attr.label)}
                      required={attr.required}
                      type={attr.type === "NUMBER" ? "number" : "text"}
                      inputMode={attr.type === "NUMBER" ? "numeric" : undefined}
                      placeholder={attr.placeholder ?? ""}
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                    />
                  );
                })
            )}
          </div>
        )}

        {/* Step 4 — Basic details */}
        {step === 3 && (
          <div className="space-y-4">
            <Input
              label={t("sell.title")}
              required
              placeholder={t("sell.titlePlaceholder")}
              value={draft.title}
              onChange={(e) => set({ title: e.target.value })}
            />
            <Input
              label={isNonPhysical ? t("sell.salary") : t("sell.price")}
              required={!noPriceRequired}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              leftAddon={<span className="text-sm">Rwf</span>}
              value={draft.price}
              onChange={(e) => set({ price: e.target.value.replace(/\D/g, "") })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.negotiable}
                onChange={(e) => set({ negotiable: e.target.checked })}
                className="accent-[#E8390E]"
              />
              {t("sell.priceNegotiable")}
            </label>
            {!hideCondition && (
              <Select
                label={t("sell.condition")}
                required
                placeholder={t("sell.conditionPlaceholder")}
                options={CONDITIONS}
                value={draft.condition}
                onChange={(e) => set({ condition: e.target.value as typeof draft.condition })}
              />
            )}
            <div className="space-y-1">
              <Textarea
                label={t("sell.descriptionLabel")}
                placeholder={t("sell.descriptionPlaceholder")}
                value={draft.description}
                maxLength={500}
                onChange={(e) => set({ description: e.target.value })}
              />
              <p className={cn("text-right text-xs", draft.description.length > 450 ? "text-warning" : "text-text-muted")}>
                {draft.description.length} / 500
              </p>
            </div>
          </div>
        )}

        {/* Step 5 — Location */}
        {step === 4 && (
          <div className="space-y-3">
            {hasProfileLocation && (
              <button
                type="button"
                onClick={() => {
                  setLocationMode("profile");
                  if (profileLocation) {
                    set({
                      city: profileLocation.city,
                      district: profileLocation.district,
                      neighborhood: profileLocation.neighborhood,
                    });
                  }
                }}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  locationMode === "profile" ? "border-primary bg-primary/10" : "border-border bg-surface-card",
                )}
              >
                <p className="text-sm font-medium">{t("sell.locationUseSaved")}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {[profileLocation?.city, profileLocation?.district].filter(Boolean).join(", ")}
                </p>
              </button>
            )}

            <button
              type="button"
              onClick={() => setLocationMode("manual")}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors",
                locationMode === "manual" ? "border-primary bg-primary/10" : "border-border bg-surface-card",
              )}
            >
              <p className="text-sm font-medium">{t("sell.locationManual")}</p>
            </button>

            {locationMode === "manual" && (
              <div className="space-y-4 pl-1">
                <Select
                  label={t("sell.city")}
                  required
                  autoComplete="off"
                  options={RWANDA_CITIES.map((c) => ({ value: c.city, label: c.city }))}
                  value={draft.city}
                  onChange={(e) => set({ city: e.target.value, district: "", neighborhood: "" })}
                />
                <Select
                  label={t("sell.district")}
                  required
                  autoComplete="off"
                  placeholder={t("sell.districtPlaceholder")}
                  options={districts.map((d) => ({ value: d.name, label: d.name }))}
                  value={draft.district}
                  onChange={(e) => set({ district: e.target.value, neighborhood: "" })}
                />
                {neighborhoods.length > 0 && (
                  <Select
                    label={t("sell.neighborhood")}
                    placeholder={t("sell.neighborhoodPlaceholder")}
                    options={neighborhoods.map((n) => ({ value: n, label: n }))}
                    value={draft.neighborhood}
                    onChange={(e) => set({ neighborhood: e.target.value })}
                  />
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setLocationMode("gps");
                detectLocation();
              }}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors",
                locationMode === "gps" ? "border-primary bg-primary/10" : "border-border bg-surface-card",
              )}
            >
              <p className="flex items-center gap-2 text-sm font-medium">
                {detectingLocation ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                {t("sell.locationDetect")}
              </p>
              {locationMode === "gps" && (
                <>
                  {locationNote && <p className="mt-0.5 text-xs text-success">{locationNote}</p>}
                  {draft.city && (
                    <p className="mt-0.5 text-xs text-text-muted">
                      {[draft.city, draft.district].filter(Boolean).join(", ")}
                    </p>
                  )}
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 6 — Review */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-surface-card">
              {draft.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.images[0]} alt={t("sell.cover")} className="aspect-[4/3] w-full object-cover" />
              )}
              <div className="space-y-2 p-4">
                <h3 className="font-display text-lg font-bold">{draft.title || t("sell.untitled")}</h3>
                <PriceTag amount={Number(draft.price) || 0} />
                <div className="flex flex-wrap gap-2">
                  {draft.condition && (
                    <span className="rounded-pill bg-surface-modal px-2 py-0.5 text-xs text-text-secondary">
                      {t(`condition.${draft.condition}`)}
                    </span>
                  )}
                  {draft.negotiable && (
                    <span className="rounded-pill bg-success/15 px-2 py-0.5 text-xs text-success">{t("common.negotiable")}</span>
                  )}
                  {draft.images.length > 0 && (
                    <span className="rounded-pill bg-surface-modal px-2 py-0.5 text-xs text-text-secondary">
                      {draft.images.length === 1
                        ? t("sell.onePhoto")
                        : t("sell.photos").replace("{count}", String(draft.images.length))}
                    </span>
                  )}
                </div>
                {/* Dynamic attributes summary */}
                {Object.keys(draft.attributes).length > 0 && schema && (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                    {schema.attributes
                      .filter((a) => draft.attributes[a.id] && isAttributeVisible(a, schema.attributes, draft.attributes))
                      .map((a) => (
                        <div key={a.id} className="flex flex-col">
                          <dt className="text-xs text-text-muted">{tLabel(a.key, a.label)}</dt>
                          <dd className="text-sm font-medium text-text-primary">{tOption(draft.attributes[a.id] ?? "")}</dd>
                        </div>
                      ))}
                  </dl>
                )}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-text-secondary">
                    {[draft.neighborhood, draft.district, draft.city].filter(Boolean).join(", ")}
                  </p>
                  {skipLocation && (
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="shrink-0 text-xs text-primary underline underline-offset-2"
                    >
                      {t("common.edit")}
                    </button>
                  )}
                </div>
                {draft.description && (
                  <p className="line-clamp-3 pt-1 text-sm text-text-secondary">{draft.description}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-text-muted">{t("sell.goesLive")}</p>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
      </main>

      {/* Footer CTA */}
      <footer className="sticky bottom-0 space-y-2 border-t border-border bg-background p-4">
        {!gate.ok && step < STEP_COUNT - 1 && (
          <p
            role="status"
            aria-live="polite"
            className="text-center text-xs text-text-secondary"
          >
            {gate.reason}
          </p>
        )}
        {step < STEP_COUNT - 1 ? (
          <Button fullWidth size="lg" disabled={!canNext} onClick={next}>
            {t("common.continue")}
          </Button>
        ) : (
          <Button fullWidth size="lg" loading={submitting} onClick={submit}>
            <Check size={20} /> {t("sell.postAd")}
          </Button>
        )}
      </footer>
    </div>
  );
}

/** Fetch a category's attribute schema (client). */
async function fetchSchema(slug: string): Promise<CategoryWithAttributes | null> {
  try {
    const res = await fetch(`/api/categories/${slug}`);
    if (!res.ok) return null;
    const { data } = (await res.json()) as { data: CategoryWithAttributes };
    return data;
  } catch {
    return null;
  }
}
