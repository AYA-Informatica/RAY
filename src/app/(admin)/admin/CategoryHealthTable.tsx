"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

type Row = {
  id: string;
  name: string;
  icon: string;
  total: number;
  week: number;
  flagged: number;
};

export function CategoryHealthTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j: { data: Row[] }) => { setRows(j.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card className="p-4">
      <h2 className="font-display text-lg font-bold mb-3">Category Health</h2>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 text-right font-medium">Total</th>
                <th className="pb-2 text-right font-medium">This week</th>
                <th className="pb-2 text-right font-medium">Flagged</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-surface-modal">
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <span>{row.icon}</span>
                      <span>{row.name}</span>
                    </span>
                  </td>
                  <td className="py-2 text-right font-medium">{row.total}</td>
                  <td className="py-2 text-right">
                    {row.week > 0 ? (
                      <span className="text-success">+{row.week}</span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {row.flagged > 0 ? (
                      <span className="font-medium text-danger">{row.flagged}</span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
