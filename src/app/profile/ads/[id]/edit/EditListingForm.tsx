"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { uploadImages } from "@/lib/storage/upload";
import { useLocationCascade } from "@/hooks/useLocationCascade";
import { useI18n } from "@/i18n/I18nProvider";
import { isAttributeVisible, type ShowIf } from "@/lib/utils/categoryAttributes";
import type { Condition } from "@prisma/client";

interface EditAttribute {
  id: string;
  label: string;
  key: string;
  type: "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN";
  required: boolean;
  placeholder: string;
  options: string[];
  showIf?: ShowIf;
  value: string;
}

interface InitialListing {
  id: string;
  title: string;
  description: string;
  price: string;
  negotiable: boolean;
  condition: Condition;
  city: string;
  district: string;
  neighborhood: string;
  images: string[];
  categoryName: string;
  categorySlug: string;
  categoryIcon: string;
  attributes: EditAttribute[];
}

/** Sentinel value for the auto-appended "Other" option on SELECT attributes. */
const OTHER_VALUE = "__OTHER__";

/** Single-page edit form for an existing listing. Submits via PATCH. */
export function EditListingForm({
  userId,
  initial,
}: {
  userId: string;
  initial: InitialListing;
}) {
  const router = useRouter();
  const { t } = useI18n();

  const CONDITIONS = [
    { value: "NEW",      label: t("condition.NEW") },
    { value: "LIKE_NEW", label: t("condition.LIKE_NEW") },
    { value: "GOOD",     label: t("condition.GOOD") },
    { value: "FAIR",     label: t("condition.FAIR") },
    { value: "USED",     label: t("condition.USED") },
  ];

  const tLabel = (key: string, fallback: string) => {
    const r = t(`attr.${key}`);
    return r === `attr.${key}` ? fallback : r;
  };
  const tOption = (opt: string) => {
    const r = t(`attrOpt.${opt}`);
    return r === `attrOpt.${opt}` ? opt : r;
  };
  const tCategory = (slug: string, fallback: string) => {
    const key = `category.${slug.replace(/-([a-z])/g, (_: string, l: string) => l.toUpperCase())}`;
    const r = t(key);
    return r === key ? fallback : r;
  };

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(initial.price);
  const [negotiable, setNegotiable] = useState(initial.negotiable);
  const [condition, setCondition] = useState<Condition>(initial.condition);
  const [city, setCity] = useState(initial.city);
  const [district, setDistrict] = useState(initial.district);
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood);
  const [images, setImages] = useState<string[]>(initial.images);
  const [attrs, setAttrs] = useState<Record<string, string>>(
    Object.fromEntries(initial.attributes.map((a) => [a.id, a.value])),
  );
  // Custom "Other" text per attribute id, keyed only when that attribute is
  // currently in free-text mode (i.e. its dropdown is set to "Other").
  const [otherValues, setOtherValues] = useState<Record<string, string>>(
    Object.fromEntries(
      initial.attributes
        .filter((a) => a.type === "SELECT" && a.value && !a.options.includes(a.value))
        .map((a) => [a.id, a.value]),
    ),
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { allDistricts, loadingDistricts, sectors, loadingSectors, cityFromDistrict } = useLocationCascade(district);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    setError(null);
    try {
      const remaining = 7 - images.length;
      const urls = await uploadImages(Array.from(files).slice(0, remaining), "listings", userId);
      setImages((prev) => [...prev, ...urls].slice(0, 7));
    } catch {
      setError(t("sell.uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          negotiable,
          condition,
          city,
          district,
          neighborhood: neighborhood || undefined,
          images,
          attributes: Object.entries(attrs)
            .filter(([id, v]) => {
              if (v === "") return false;
              const attr = initial.attributes.find((a) => a.id === id);
              return !attr || isAttributeVisible(attr, initial.attributes, attrs);
            })
            .map(([attributeId, value]) => ({ attributeId, value })),
        }),
      });
      if (res.status === 401) {
        router.replace("/login?redirect=/profile/ads");
        return;
      }
      if (!res.ok) {
        const j = (await res.json()) as { error?: { message?: string } };
        throw new Error(j.error?.message ?? t("sell.postError"));
      }
      router.push("/profile/ads");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("sell.postError"));
      setSaving(false);
    }
  }

  const canSave = title.trim().length >= 3 && price !== "" && Number(price) >= 0;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background lg:max-w-2xl">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <button onClick={() => router.replace("/profile/ads")} aria-label={t("common.back")} className="text-text-secondary">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display text-lg font-bold">{t("myAds.editAd")}</h1>
        <span className="ml-auto flex items-center gap-1.5 text-sm text-text-secondary">
          <span>{initial.categoryIcon}</span> {tCategory(initial.categorySlug, initial.categoryName)}
        </span>
      </header>

      <main className="flex-1 space-y-4 p-4">
        {/* Photos */}
        <div>
          <p className="mb-2 text-sm font-medium">{t("sell.addPhotos")}</p>
          <div className="grid grid-cols-3 gap-3">
            {images.map((url, i) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-md bg-surface-modal">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={t("sell.photoAlt").replace("{n}", String(i + 1))} className="h-full w-full object-cover" />
                <button
                  onClick={() => setImages(images.filter((u) => u !== url))}
                  className="absolute -right-1 -top-1 grid h-11 w-11 place-items-center"
                  aria-label={t("sell.removePhoto")}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-pill bg-black/70"><X size={16} /></span>
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded-sm bg-primary px-1.5 text-[10px] font-bold">
                    {t("sell.cover")}
                  </span>
                )}
              </div>
            ))}
            {images.length < 7 && (
              <label className="grid aspect-square cursor-pointer place-items-center rounded-md border border-dashed border-border bg-surface-card text-text-secondary">
                {uploading ? <Loader2 className="animate-spin" /> : <Camera />}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        <Input label={t("sell.title")} required value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          label={t("sell.price")}
          required
          type="number"
          inputMode="numeric"
          leftAddon={<span className="text-sm">Rwf</span>}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={negotiable}
            onChange={(e) => setNegotiable(e.target.checked)}
            className="accent-[#E8390E]"
          />
          {t("sell.priceNegotiable")}
        </label>
        <Select
          label={t("sell.condition")}
          options={CONDITIONS}
          value={condition}
          onChange={(e) => setCondition(e.target.value as Condition)}
        />
        <Textarea
          label={t("sell.descriptionLabel")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Dynamic attributes */}
        {initial.attributes
          .filter((attr) => isAttributeVisible(attr, initial.attributes, attrs))
          .map((attr) => {
          const val = attrs[attr.id] ?? "";
          const setVal = (v: string) => {
            setAttrs((prev) => {
              const next = { ...prev, [attr.id]: v };
              // Clear values for attributes that depend on this one and are
              // no longer visible with the new value.
              for (const other of initial.attributes) {
                if (other.id === attr.id || !other.showIf) continue;
                if (other.showIf.key === attr.key && !other.showIf.in.includes(v)) {
                  delete next[other.id];
                  setOtherValues((prevOther) => {
                    if (!(other.id in prevOther)) return prevOther;
                    const nextOther = { ...prevOther };
                    delete nextOther[other.id];
                    return nextOther;
                  });
                }
              }
              return next;
            });
          };
          if (attr.type === "SELECT") {
            const isOther = otherValues[attr.id] !== undefined;
            const filteredOpts = attr.options.filter((o) => o.toLowerCase() !== "other");
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
              placeholder={attr.placeholder}
              value={val}
              onChange={(e) => setVal(e.target.value)}
            />
          );
        })}

        {/* Location */}
        <Select
          label={t("sell.district")}
          disabled={loadingDistricts}
          placeholder={loadingDistricts ? t("common.loading") : t("sell.districtPlaceholder")}
          autoComplete="off"
          options={allDistricts.map((d) => ({ value: d.district, label: d.district }))}
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value);
            setCity(cityFromDistrict(e.target.value));
            setNeighborhood("");
          }}
        />
        {district && (
          loadingSectors ? (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Loader2 size={14} className="animate-spin" />
              {t("sell.districtPlaceholder")}…
            </div>
          ) : sectors.length > 0 && (
            <Select
              label={t("sell.neighborhood")}
              placeholder={t("sell.neighborhoodPlaceholder")}
              autoComplete="off"
              options={sectors.map((s) => ({ value: s, label: s }))}
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
          )
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
      </main>

      <footer className="sticky bottom-0 border-t border-border bg-background p-4">
        <Button fullWidth size="lg" loading={saving} disabled={!canSave} onClick={save}>
          <Check size={20} /> {t("common.save")}
        </Button>
      </footer>
    </div>
  );
}
