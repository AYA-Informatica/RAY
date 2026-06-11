"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ListingRow, ListingCard } from "@/components/listings/ListingCard";
import { PermissionPrompt } from "@/components/shared/PermissionPrompt";
import { useI18n } from "@/i18n/I18nProvider";
import type { ListingCardData } from "@/types";

const PAGE_SIZE = 15;

/**
 * Home feed grid/list. Server-rendered already ranked by recency + the
 * viewer's saved profile location (if any), then silently re-ranked with
 * precise GPS proximity once location is available (existing grant or
 * after this prompt).
 */
export function RecentListings({ initial }: { initial: ListingCardData[] }) {
  const { t } = useI18n();
  const [items, setItems] = useState(initial);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    let cancelled = false;

    function fetchRanked(lat: number, lng: number) {
      fetch(`/api/listings/recent?lat=${lat}&lng=${lng}`)
        .then((res) => res.json())
        .then((json) => {
          if (!cancelled && Array.isArray(json?.data?.items)) setItems(json.data.items);
        })
        .catch(() => {});
    }

    function requestPosition() {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchRanked(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
      );
    }

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          if (cancelled) return;
          if (status.state === "granted") requestPosition();
          else if (status.state === "prompt") setShowLocationPrompt(true);
          // "denied" — keep the server-rendered order (profile-location ranked, if set).
        })
        .catch(() => setShowLocationPrompt(true));
    } else {
      setShowLocationPrompt(true);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  function handleAllowLocation() {
    setShowLocationPrompt(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetch(`/api/listings/recent?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
          .then((res) => res.json())
          .then((json) => {
            if (Array.isArray(json?.data?.items)) setItems(json.data.items);
          })
          .catch(() => {});
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }

  return (
    <>
      {showLocationPrompt && (
        <PermissionPrompt
          type="location"
          onAllow={handleAllowLocation}
          onDismiss={() => setShowLocationPrompt(false)}
        />
      )}

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <Rocket className="text-text-secondary" />
          <p className="text-sm text-text-secondary">{t("home.noListings")}</p>
          <Link href="/sell">
            <Button size="sm">{t("home.postAd")}</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="space-y-3 sm:hidden">
            {items.map((l, idx) => (
              <ListingRow key={l.id} listing={l} priority={idx === 0} />
            ))}
          </div>
          <div className="hidden grid-cols-3 gap-4 sm:grid lg:grid-cols-4 xl:grid-cols-5">
            {items.map((l, idx) => (
              <ListingCard key={l.id} listing={l} priority={idx === 0} />
            ))}
          </div>
          {items.length === PAGE_SIZE && (
            <div className="pt-2 text-center">
              <Link href="/search">
                <Button variant="secondary" size="sm">
                  {t("home.seeAll")}
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </>
  );
}
