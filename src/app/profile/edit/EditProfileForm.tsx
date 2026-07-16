"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Camera, Check, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { uploadImage } from "@/lib/storage/upload";
import { useLocationCascade } from "@/hooks/useLocationCascade";
import { useI18n } from "@/i18n/I18nProvider";
import { PermissionPrompt } from "@/components/shared/PermissionPrompt";
import { logger } from "@/lib/logger";

interface Props {
  userId: string;
  initial: {
    name: string;
    bio: string;
    avatarUrl: string | null;
    city: string;
    district: string;
    neighborhood: string;
  };
}

/**
 * Edit profile form. Submits via PATCH /api/users/:id.
 * Avatar upload compresses to WebP before upload (same pipeline as listings).
 */
export function EditProfileForm({ userId, initial }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");
  const [city, setCity] = useState(initial.city);
  const [district, setDistrict] = useState(initial.district);
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Free-text fallback for locations outside Rwanda (edge case).
  const [customLocation, setCustomLocation] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [permissionPrompt, setPermissionPrompt] = useState<"location" | null>(null);

  const { allDistricts, loadingDistricts, sectors, loadingSectors, cityFromDistrict } = useLocationCascade(district);

  function detectLocation() {
    if (!navigator.geolocation) return;
    setPermissionPrompt("location");
  }

  function doDetectLocation() {
    setDetecting(true);
    setLocationNote(null);
    logger.debug("[EditProfileForm] detecting location");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { Accept: "application/json" } },
          );
          if (!res.ok) throw new Error("lookup failed");
          const data = (await res.json()) as { address?: Record<string, string> };
          const addr = data.address ?? {};
          const normalize = (raw: string) =>
            raw.replace(/^city of\s+/i, "").replace(/\s+(district|province|sector|cell)$/i, "").trim();

          const candidates = [
            addr.city, addr.town, addr.suburb, addr.city_district, addr.county, addr.state_district,
          ]
            .filter((v): v is string => Boolean(v))
            .map(normalize);

          const districtMatch = allDistricts.find((d) =>
            candidates.some((c) => c.toLowerCase() === d.district.toLowerCase()),
          );

          if (districtMatch) {
            logger.debug({ district: districtMatch.district }, "[EditProfileForm] location matched a known district");
            setCustomLocation(false);
            setDistrict(districtMatch.district);
            setCity(cityFromDistrict(districtMatch.district));
            setNeighborhood("");
            setLocationNote(t("profileEdit.locationDetected"));
          } else if (candidates.length > 0) {
            logger.debug("[EditProfileForm] location outside known districts, using custom location");
            setCustomLocation(true);
            setCity(candidates[0] ?? "");
            setDistrict(candidates[1] ?? "");
            setNeighborhood("");
            setLocationNote(t("profileEdit.locationOutsideArea"));
          } else {
            logger.warn("[EditProfileForm] reverse geocode returned no usable candidates");
            setLocationNote(t("profileEdit.locationFailed"));
          }
        } catch (err) {
          logger.warn({ message: err instanceof Error ? err.message : String(err) }, "[EditProfileForm] location detection failed");
          setLocationNote(t("profileEdit.locationFailed"));
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        logger.warn({ code: err.code }, "[EditProfileForm] geolocation permission/error");
        setLocationNote(t("profileEdit.locationFailed"));
        setDetecting(false);
      },
    );
  }

  async function handleAvatar(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file, "avatars", userId);
      logger.debug("[EditProfileForm] avatar uploaded");
      setAvatarUrl(url);
    } catch (err) {
      logger.warn({ message: err instanceof Error ? err.message : String(err) }, "[EditProfileForm] avatar upload failed");
      setError("Avatar upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (name.trim().length < 1) {
      logger.warn("[EditProfileForm] validation rejected: empty name");
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    logger.debug({ userId }, "[EditProfileForm] saving profile");
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim() || undefined,
          avatarUrl: avatarUrl || undefined,
          city: city || undefined,
          district: district || undefined,
          neighborhood: neighborhood || undefined,
          province: allDistricts.find((d) => d.district === district)?.province,
        }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: { message?: string } };
        throw new Error(j.error?.message ?? "Could not save.");
      }
      logger.info({ userId }, "[EditProfileForm] profile updated");
      router.push("/profile");
      router.refresh();
    } catch (e) {
      logger.warn({ userId, message: e instanceof Error ? e.message : String(e) }, "[EditProfileForm] save failed");
      setError(e instanceof Error ? e.message : "Could not save changes.");
      setSaving(false);
    }
  }

  return (
    <>
      {permissionPrompt && (
        <PermissionPrompt
          type={permissionPrompt}
          onAllow={() => {
            setPermissionPrompt(null);
            doDetectLocation();
          }}
          onDismiss={() => setPermissionPrompt(null)}
        />
      )}

      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3 lg:top-16">
        <button
          onClick={() => router.replace("/profile")}
          aria-label="Back"
          className="-ml-1 grid h-11 w-11 place-items-center text-text-secondary hover:text-text-primary lg:hidden"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display text-lg font-bold">{t("profileEdit.title")}</h1>
      </header>

      <div className="space-y-5 p-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-24 w-24">
            <div className="relative h-24 w-24 overflow-hidden rounded-pill bg-surface-modal ring-2 ring-border">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" fill className="object-cover" sizes="96px" />
              ) : (
                <span className="grid h-full w-full place-items-center font-display text-3xl text-text-secondary">
                  {name.charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 grid h-9 w-9 cursor-pointer place-items-center rounded-pill bg-primary text-text-primary shadow-md hover:bg-primary-dark">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatar(e.target.files?.[0])}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-xs text-text-muted">{t("profileEdit.avatarHint")}</p>
        </div>

        <Input
          label={t("profileEdit.name")}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("profileEdit.name")}
        />

        <div className="space-y-1">
          <Textarea
            label={t("profileEdit.bio")}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t("profileEdit.bioPlaceholder")}
          />
          <p className="text-right text-xs text-text-muted">{bio.length} / 300</p>
        </div>

        {/* Location — used to personalise the home feed */}
        <div className="space-y-3">
          <Button variant="secondary" fullWidth onClick={detectLocation} disabled={detecting}>
            {detecting ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
            {t("profileEdit.detectLocation")}
          </Button>
          {locationNote && <p className="text-xs text-text-secondary">{locationNote}</p>}

          {customLocation ? (
            <>
              <Input
                label={t("profileEdit.city")}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("profileEdit.city")}
              />
              <Input
                label={t("profileEdit.district")}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder={t("profileEdit.district")}
              />
              <Input
                label={t("profileEdit.neighborhood")}
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder={t("profileEdit.neighborhood")}
              />
              <button
                type="button"
                onClick={() => {
                  setCustomLocation(false);
                  setCity("");
                  setDistrict("");
                  setNeighborhood("");
                  setLocationNote(null);
                }}
                className="text-xs text-text-secondary underline underline-offset-2 hover:text-text-primary"
              >
                {t("profileEdit.useListedCity")}
              </button>
            </>
          ) : (
            <>
              <Select
                label={t("profileEdit.district")}
                disabled={loadingDistricts}
                placeholder={loadingDistricts ? t("common.loading") : t("filter.anyDistrict")}
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setCity(cityFromDistrict(e.target.value));
                  setNeighborhood("");
                }}
                options={allDistricts.map((d) => ({ value: d.district, label: d.district }))}
              />
              {district && (
                loadingSectors ? (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Loader2 size={14} className="animate-spin" />
                    {t("filter.anyDistrict")}…
                  </div>
                ) : sectors.length > 0 && (
                  <Select
                    label={t("profileEdit.neighborhood")}
                    placeholder={t("filter.anyNeighborhood")}
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    options={sectors.map((s) => ({ value: s, label: s }))}
                  />
                )
              )}
              <button
                type="button"
                onClick={() => setCustomLocation(true)}
                className="text-xs text-text-secondary underline underline-offset-2 hover:text-text-primary"
              >
                {t("profileEdit.cityNotListed")}
              </button>
            </>
          )}
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>

      <footer className="sticky bottom-0 border-t border-border bg-background p-4">
        <Button fullWidth size="lg" loading={saving} disabled={uploading} onClick={save}>
          <Check size={20} /> {t("profileEdit.save")}
        </Button>
      </footer>
    </>
  );
}
