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
import { uploadImages } from "@/lib/storage/upload";
import { PermissionPrompt } from "@/components/shared/PermissionPrompt";
import { cn } from "@/lib/utils/cn";
import { RWANDA_CITIES } from "@/constants/locations";
import type { CategoryWithAttributes } from "@/types";

interface SellCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

const CONDITIONS = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like new" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "USED", label: "Used" },
];

const STEPS = ["Category", "Photos", "Details", "Specs", "Location", "Review"] as const;

/**
 * 6-step posting flow (Build Prompt + Product Experience):
 * Category -> Photos -> Basic Details -> Dynamic Specs -> Location -> Review.
 * Target: under 60s. "Structure without intimidation."
 */
export function SellWizard({
  userId,
  categories,
}: {
  userId: string | null;
  categories: SellCategory[];
}) {
  const router = useRouter();
  const { draft, step, set, setStep, reset } = useSellDraft();
  const { t } = useI18n();
  const [schema, setSchema] = useState<CategoryWithAttributes | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [permissionPrompt, setPermissionPrompt] = useState<"camera" | "location" | null>(null);
  const [draftNotice, setDraftNotice] = useState(
    // Show the notice on first render if there's a saved draft worth restoring.
    Boolean(draft.title || draft.images.length > 0 || draft.categoryId),
  );
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === draft.categoryId);

  // Load the dynamic attribute schema when a category is chosen.
  useEffect(() => {
    if (!selectedCategory) {
      setSchema(null);
      return;
    }
    let active = true;
    void fetchSchema(selectedCategory.slug).then((s) => {
      if (active) setSchema(s);
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

  // Step 3 (Specs) is auto-skipped when the chosen category has no required
  // attributes — the spec's "feel like sending a message" target wins over
  // ceremony for categories like Furniture or Fashion.
  const skipSpecs = (schema?.attributes ?? []).every((a) => !a.required);

  function next() {
    setError(null);
    setDraftNotice(false);
    if (step < STEPS.length - 1) {
      const target = step + 1;
      // Skip Specs step (index 3) forward when no required attributes exist.
      if (target === 3 && skipSpecs) setStep(4);
      else setStep(target);
    }
  }
  function back() {
    setError(null);
    if (step > 0) {
      const target = step - 1;
      // Mirror the skip when navigating backwards.
      if (target === 3 && skipSpecs) setStep(2);
      else setStep(target);
    } else router.back();
  }

  async function handleFiles(files: FileList | null) {
    if (!files || !userId) return;
    setUploading(true);
    setError(null);
    try {
      const remaining = 7 - draft.images.length;
      const urls = await uploadImages(Array.from(files).slice(0, remaining), "listings", userId);
      set({ images: [...draft.images, ...urls].slice(0, 7) });
    } catch {
      setError("Upload failed. Check your connection and try again.");
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
    navigator.geolocation.getCurrentPosition(
      (pos) => set({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setError("Couldn't detect location — pick it manually."),
    );
  }

  async function submit() {
    if (!userId) {
      router.push("/login?redirect=/sell");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          price: Number(draft.price),
          negotiable: draft.negotiable,
          condition: draft.condition,
          categoryId: draft.categoryId,
          city: draft.city,
          district: draft.district,
          neighborhood: draft.neighborhood || undefined,
          latitude: draft.latitude,
          longitude: draft.longitude,
          images: draft.images,
          attributes: Object.entries(draft.attributes)
            .filter(([, v]) => v !== "")
            .map(([attributeId, value]) => ({ attributeId, value })),
        }),
      });
      if (res.status === 401) {
        router.push("/login?redirect=/sell");
        return;
      }
      if (!res.ok) {
        const j = (await res.json()) as { error?: { message?: string } };
        throw new Error(j.error?.message ?? "Could not post");
      }
      const { data } = (await res.json()) as { data: { id: string } };
      reset();
      router.push(`/listing/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post your ad.");
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
        if (draft.title.trim().length < 3) return { ok: false, reason: t("sell.gate.title") };
        if (draft.price === "" || Number(draft.price) < 0) return { ok: false, reason: t("sell.gate.price") };
        if (draft.condition === "") return { ok: false, reason: t("sell.gate.condition") };
        return { ok: true };
      }
      case 3: {
        const missing = (schema?.attributes ?? []).find((a) => a.required && !draft.attributes[a.id]);
        return missing
          ? { ok: false, reason: t("sell.gate.required").replace("{field}", missing.label) }
          : { ok: true };
      }
      case 4:
        if (!draft.city) return { ok: false, reason: t("sell.gate.city") };
        if (!draft.district) return { ok: false, reason: t("sell.gate.district") };
        return { ok: true };
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
            aria-label="Back"
            className="-ml-2 grid h-11 w-11 place-items-center text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display text-lg font-bold">{STEPS[step]}</h1>
          <span
            className="ml-auto text-sm text-text-muted"
            aria-live="polite"
            aria-atomic="true"
          >
            {step + 1}/{STEPS.length}
          </span>
        </div>
        <div className="mt-3 flex gap-1">
          {STEPS.map((_, i) => (
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
              categories={categories.map((c) => ({ slug: c.id, name: c.name, icon: c.icon }))}
              value={draft.categoryId}
              onChange={(id) => set({ categoryId: id, attributes: {} })}
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
                  <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => set({ images: draft.images.filter((u) => u !== url) })}
                    className="absolute -right-1 -top-1 grid h-11 w-11 place-items-center"
                    aria-label="Remove photo"
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

        {/* Step 3 — Basic details */}
        {step === 2 && (
          <div className="space-y-4">
            <Input
              label={t("sell.title")}
              required
              placeholder="e.g. iPhone 14 Pro Max 256GB"
              value={draft.title}
              onChange={(e) => set({ title: e.target.value })}
            />
            <Input
              label={t("sell.price")}
              required
              type="number"
              inputMode="numeric"
              placeholder="0"
              leftAddon={<span className="text-sm">Rwf</span>}
              value={draft.price}
              onChange={(e) => set({ price: e.target.value })}
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
            <Select
              label={t("sell.condition")}
              required
              placeholder="Select condition"
              options={CONDITIONS}
              value={draft.condition}
              onChange={(e) => set({ condition: e.target.value as typeof draft.condition })}
            />
            <div className="space-y-1">
              <Textarea
                label={t("sell.descriptionLabel")}
                placeholder="Describe your item — what's included, why you're selling…"
                value={draft.description}
                onChange={(e) => set({ description: e.target.value })}
              />
              <p className="text-right text-xs text-text-muted">
                {draft.description.length} / 500 chars recommended
              </p>
            </div>
          </div>
        )}

        {/* Step 4 — Dynamic category specs */}
        {step === 3 && (
          <div className="space-y-4">
            {!schema || schema.attributes.length === 0 ? (
              <p className="text-sm text-text-secondary">No extra details needed — you're almost done.</p>
            ) : (
              schema.attributes.map((attr) => {
                const val = draft.attributes[attr.id] ?? "";
                const setVal = (v: string) => set({ attributes: { ...draft.attributes, [attr.id]: v } });
                if (attr.type === "SELECT") {
                  const opts = Array.isArray(attr.options) ? (attr.options as string[]) : [];
                  return (
                    <Select
                      key={attr.id}
                      label={attr.label}
                      required={attr.required}
                      placeholder={`Select ${attr.label.toLowerCase()}`}
                      options={opts.map((o) => ({ value: o, label: o }))}
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                    />
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
                      {attr.label}
                    </label>
                  );
                }
                return (
                  <Input
                    key={attr.id}
                    label={attr.label}
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

        {/* Step 5 — Location */}
        {step === 4 && (
          <div className="space-y-4">
            <Button variant="secondary" fullWidth onClick={detectLocation}>
              <MapPin size={18} /> {draft.latitude ? "Location detected ✓" : "Use my current location"}
            </Button>
            <Select
              label={t("sell.city")}
              required
              options={RWANDA_CITIES.map((c) => ({ value: c.city, label: c.city }))}
              value={draft.city}
              onChange={(e) => set({ city: e.target.value, district: "", neighborhood: "" })}
            />
            <Select
              label={t("sell.district")}
              required
              placeholder="Select district"
              options={districts.map((d) => ({ value: d.name, label: d.name }))}
              value={draft.district}
              onChange={(e) => set({ district: e.target.value, neighborhood: "" })}
            />
            {neighborhoods.length > 0 && (
              <Select
                label={t("sell.neighborhood")}
                placeholder="Select neighborhood (optional)"
                options={neighborhoods.map((n) => ({ value: n, label: n }))}
                value={draft.neighborhood}
                onChange={(e) => set({ neighborhood: e.target.value })}
              />
            )}
          </div>
        )}

        {/* Step 6 — Review */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-surface-card">
              {draft.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.images[0]} alt="Cover" className="aspect-[4/3] w-full object-cover" />
              )}
              <div className="space-y-2 p-4">
                <h3 className="font-display text-lg font-bold">{draft.title || "Untitled"}</h3>
                <PriceTag amount={Number(draft.price) || 0} />
                <div className="flex flex-wrap gap-2">
                  {draft.condition && (
                    <span className="rounded-pill bg-surface-modal px-2 py-0.5 text-xs text-text-secondary">
                      {draft.condition.replace("_", " ")}
                    </span>
                  )}
                  {draft.negotiable && (
                    <span className="rounded-pill bg-success/15 px-2 py-0.5 text-xs text-success">Negotiable</span>
                  )}
                  {draft.images.length > 0 && (
                    <span className="rounded-pill bg-surface-modal px-2 py-0.5 text-xs text-text-secondary">
                      {draft.images.length} photo{draft.images.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {/* Dynamic attributes summary */}
                {Object.keys(draft.attributes).length > 0 && schema && (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                    {schema.attributes
                      .filter((a) => draft.attributes[a.id])
                      .map((a) => (
                        <div key={a.id} className="flex flex-col">
                          <dt className="text-xs text-text-muted">{a.label}</dt>
                          <dd className="text-sm font-medium text-text-primary">{draft.attributes[a.id]}</dd>
                        </div>
                      ))}
                  </dl>
                )}
                <p className="text-sm text-text-secondary">
                  {[draft.neighborhood, draft.district, draft.city].filter(Boolean).join(", ")}
                </p>
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
        {!gate.ok && step < STEPS.length - 1 && (
          <p
            role="status"
            aria-live="polite"
            className="text-center text-xs text-text-secondary"
          >
            {gate.reason}
          </p>
        )}
        {step < STEPS.length - 1 ? (
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
