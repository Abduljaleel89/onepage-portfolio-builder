import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import CollapsibleSection from "@/components/CollapsibleSection";
import LoadingSpinner from "@/components/LoadingSpinner";
import { apiClient } from "@/lib/apiClient";

export default function AnalyticsDashboard({
  showAnalytics,
  setShowAnalytics,
}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showAnalytics) {
      loadStats();
    }
  }, [showAnalytics]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get("/api/analytics/stats");
      setStats(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CollapsibleSection
      title="Analytics Dashboard"
      isOpen={showAnalytics}
      onToggle={() => setShowAnalytics((value) => !value)}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.views || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Views</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stats.downloads?.total || 0}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Downloads</div>
                {stats.downloads?.byFormat && Object.keys(stats.downloads.byFormat).length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {Object.entries(stats.downloads.byFormat).map(([format, count]) => (
                      <div key={format}>
                        {format.toUpperCase()}: {count}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.shares?.total || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Shares</div>
                {stats.shares?.byPlatform && Object.keys(stats.shares.byPlatform).length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {Object.entries(stats.shares.byPlatform).map(([platform, count]) => (
                      <div key={platform}>
                        {platform}: {count}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No analytics data available
        </div>
      )}
    </CollapsibleSection>
  );
}

