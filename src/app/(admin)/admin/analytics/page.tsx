import { Card } from "@/components/ui/Card";
import { getGeographicStats, getGrowthStats, getEngagementStats } from "@/services/admin";

/** Analytics — geographic distribution, growth trends, and engagement metrics. */
export default async function AnalyticsPage() {
  const [geo, growth, engagement] = await Promise.all([
    getGeographicStats(),
    getGrowthStats(),
    getEngagementStats(),
  ]);

  const userMax = geo.usersByDistrict[0]?.count ?? 1;
  const listingMax = geo.listingsByDistrict[0]?.count ?? 1;
  const neighborhoodMax = geo.topNeighborhoods[0]?.count ?? 1;

  const userWeekMax = Math.max(...growth.userWeeks.map((w) => w.count), 1);
  const listingWeekMax = Math.max(...growth.listingWeeks.map((w) => w.count), 1);

  const deadStockColor =
    engagement.deadStockPct < 30
      ? "text-success"
      : engagement.deadStockPct <= 60
      ? "text-warning"
      : "text-danger";

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Analytics</h1>

      {/* ── Section 1: Geographic Intelligence ── */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold mb-3">Geographic Intelligence</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Users by district */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Users by District</h3>
            {geo.usersByDistrict.length === 0 ? (
              <p className="text-sm text-text-muted">No data</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {geo.usersByDistrict.map((row) => (
                    <tr key={row.district} className="border-b border-border-subtle last:border-0">
                      <td className="py-1.5 pr-3 font-medium text-text-primary w-1/3 truncate">
                        {row.district}
                      </td>
                      <td className="py-1.5 w-full">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-full bg-surface-modal h-2">
                            <div
                              className="bg-primary/80 h-2 rounded-full"
                              style={{ width: `${Math.round((row.count / userMax) * 100)}%` }}
                            />
                          </div>
                          <span className="text-text-muted shrink-0">{row.count}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* Listings by district */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Active Listings by District</h3>
            {geo.listingsByDistrict.length === 0 ? (
              <p className="text-sm text-text-muted">No data</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {geo.listingsByDistrict.map((row) => (
                    <tr key={row.district} className="border-b border-border-subtle last:border-0">
                      <td className="py-1.5 pr-3 font-medium text-text-primary w-1/3 truncate">
                        {row.district}
                      </td>
                      <td className="py-1.5 w-full">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-full bg-surface-modal h-2">
                            <div
                              className="bg-primary/80 h-2 rounded-full"
                              style={{ width: `${Math.round((row.count / listingMax) * 100)}%` }}
                            />
                          </div>
                          <span className="text-text-muted shrink-0">{row.count}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* Top neighborhoods */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Top Neighborhoods (Active Listings)</h3>
          {geo.topNeighborhoods.length === 0 ? (
            <p className="text-sm text-text-muted">No data</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="py-1.5 text-left font-semibold text-text-muted">Neighborhood</th>
                  <th className="py-1.5 text-left font-semibold text-text-muted">District</th>
                  <th className="py-1.5 text-left font-semibold text-text-muted w-1/2">Listings</th>
                </tr>
              </thead>
              <tbody>
                {geo.topNeighborhoods.map((row) => (
                  <tr
                    key={`${row.neighborhood}-${row.district}`}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="py-1.5 pr-3 font-medium text-text-primary">{row.neighborhood}</td>
                    <td className="py-1.5 pr-3 text-text-secondary">{row.district}</td>
                    <td className="py-1.5 w-1/2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-full bg-surface-modal h-2">
                          <div
                            className="bg-primary/80 h-2 rounded-full"
                            style={{ width: `${Math.round((row.count / neighborhoodMax) * 100)}%` }}
                          />
                        </div>
                        <span className="text-text-muted shrink-0">{row.count}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </section>

      {/* ── Section 2: Growth (last 12 weeks) ── */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold mb-3">Growth (last 12 weeks)</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* New users chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-4">New Users per Week</h3>
            {growth.userWeeks.length === 0 ? (
              <p className="text-sm text-text-muted">No data</p>
            ) : (
              <div className="space-y-1.5">
                {growth.userWeeks.map((w) => {
                  const pct = (w.count / userWeekMax) * 100;
                  const label = new Date(w.week).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <div key={w.week} className="flex items-center gap-2 text-sm">
                      <span className="w-14 shrink-0 text-right text-text-muted">{label}</span>
                      <div className="flex-1 rounded-full bg-surface-modal h-2">
                        <div
                          className="bg-primary/80 h-2 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-text-muted">{w.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* New listings chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-4">New Listings per Week</h3>
            {growth.listingWeeks.length === 0 ? (
              <p className="text-sm text-text-muted">No data</p>
            ) : (
              <div className="space-y-1.5">
                {growth.listingWeeks.map((w) => {
                  const pct = (w.count / listingWeekMax) * 100;
                  const label = new Date(w.week).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <div key={w.week} className="flex items-center gap-2 text-sm">
                      <span className="w-14 shrink-0 text-right text-text-muted">{label}</span>
                      <div className="flex-1 rounded-full bg-surface-modal h-2">
                        <div
                          className="bg-primary/80 h-2 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-text-muted">{w.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* ── Section 3: Engagement ── */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold mb-3">Engagement</h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-4">
            <p className="font-display text-3xl font-bold">
              {engagement.totalConversations.toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary mt-1">Total Conversations</p>
          </Card>

          <Card className="p-4">
            <p className="font-display text-3xl font-bold">
              {engagement.totalMessages.toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary mt-1">Total Messages</p>
          </Card>

          <Card className="p-4">
            <p className="font-display text-3xl font-bold">
              {engagement.avgViewsPerListing.toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary mt-1">Avg Views / Listing</p>
          </Card>

          <Card className="p-4">
            <p className={`font-display text-3xl font-bold ${deadStockColor}`}>
              {engagement.deadStockPct}%
            </p>
            <p className="text-sm text-text-secondary mt-1">Dead Stock</p>
            <p className="text-xs text-text-muted mt-0.5">Listings with 0 inquiries</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
