"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { ToastStack, useToast } from "@/components/admin/AdminToast";
import { logger } from "@/lib/logger";

type Config = { active: boolean; text: string };

export function AnnouncementEditor() {
  const [config, setConfig] = useState<Config>({ active: false, text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, show } = useToast();

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((j: { data: Config }) => {
        setConfig(j.data);
        setLoading(false);
        logger.debug({ active: j.data?.active }, "[AnnouncementEditor] config loaded");
      })
      .catch((err) => {
        logger.warn({ message: err?.message }, "[AnnouncementEditor] failed to load config");
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    logger.debug({ active: config.active, textLength: config.text.length }, "[AnnouncementEditor] saving announcement");
    try {
      const res = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        logger.info("[AnnouncementEditor] announcement saved");
      } else {
        logger.warn({ status: res.status }, "[AnnouncementEditor] save failed");
      }
      show(res.ok ? "Announcement saved" : "Save failed", res.ok ? "success" : "danger");
    } catch (err) {
      logger.warn({ message: err instanceof Error ? err.message : String(err) }, "[AnnouncementEditor] save threw");
      show("Save failed", "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <ToastStack toasts={toasts} />
      <h2 className="font-display text-lg font-bold">Platform Announcement</h2>

      {/* Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={config.active}
          onClick={() => setConfig((c) => ({ ...c, active: !c.active }))}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            config.active ? "bg-primary" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              config.active ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span
          className="cursor-pointer select-none text-sm text-text-primary"
          onClick={() => setConfig((c) => ({ ...c, active: !c.active }))}
        >
          Show banner to all users
        </span>
      </div>

      {/* Text area */}
      <div className="space-y-1">
        <textarea
          value={config.text}
          onChange={(e) => setConfig((c) => ({ ...c, text: e.target.value }))}
          maxLength={280}
          rows={3}
          placeholder="e.g. RAY is now live in Kigali 🎉 — report issues to support@ray.rw"
          disabled={loading}
          className="w-full rounded-md border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 resize-none"
        />
        <p className="text-right text-xs text-text-muted">{config.text.length} / 280</p>
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={save}
        disabled={saving || loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
      >
        {saving ? "Saving…" : "Save announcement"}
      </button>
    </Card>
  );
}
