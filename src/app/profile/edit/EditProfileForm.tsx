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
import { RWANDA_CITIES } from "@/constants/locations";
import { useI18n } from "@/i18n/I18nProvider";
import { PermissionPrompt } from "@/components/shared/PermissionPrompt";

const isKnownCity = (name: string) => RWANDA_CITIES.some((c) => c.city.toLowerCase() === name.toLowerCase());

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

  // Free-text location mode for users outside the listed cities/districts.
  const [customLocation, setCustomLocation] = useState(() => Boolean(initial.city) && !isKnownCity(initial.city));
  const [detecting, setDetecting] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [permissionPrompt, setPermissionPrompt] = useState<"location" | null>(null);

  const districts = RWANDA_CITIES.find((c) => c.city === city)?.districts ?? [];
  const neighborhoods = districts.find((d) => d.name === district)?.neighborhoods ?? [];

  function detectLocation() {
    if (!navigator.geolocation) return;
    setPermissionPrompt("location");
  }

  function doDetectLocation() {
    setDetecting(true);
    setLocationNote(null);
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

            setCustomLocation(false);
            setCity(match.city);
            setDistrict(districtMatch?.name ?? "");
            setNeighborhood(neighborhoodMatch ?? "");
            setLocationNote(t("profileEdit.locationDetected"));
          } else if (detectedCity) {
            setCustomLocation(true);
            setCity(detectedCity);
            setDistrict(districtCandidates[0] ?? "");
            setNeighborhood("");
            setLocationNote(t("profileEdit.locationOutsideArea"));
          } else {
            setLocationNote(t("profileEdit.locationFailed"));
          }
        } catch {
          setLocationNote(t("profileEdit.locationFailed"));
        } finally {
          setDetecting(false);
        }
      },
      () => {
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
      setAvatarUrl(url);
    } catch {
      setError("Avatar upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (name.trim().length < 1) { setError("Name is required."); return; }
    setSaving(true);
    setError(null);
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
        }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: { message?: string } };
        throw new Error(j.error?.message ?? "Could not save.");
      }
      router.push("/profile");
      router.refresh();
    } catch (e) {
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
                label={t("profileEdit.city")}
                placeholder={t("filter.anyCity")}
                value={city}
                onChange={(e) => { setCity(e.target.value); setDistrict(""); setNeighborhood(""); }}
                options={RWANDA_CITIES.map((c) => ({ value: c.city, label: c.city }))}
              />
              {districts.length > 0 && (
                <Select
                  label={t("profileEdit.district")}
                  placeholder={t("filter.anyDistrict")}
                  value={district}
                  onChange={(e) => { setDistrict(e.target.value); setNeighborhood(""); }}
                  options={districts.map((d) => ({ value: d.name, label: d.name }))}
                />
              )}
              {neighborhoods.length > 0 && (
                <Select
                  label={t("profileEdit.neighborhood")}
                  placeholder={t("filter.anyNeighborhood")}
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  options={neighborhoods.map((n) => ({ value: n, label: n }))}
                />
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
