import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Clock, Eye, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  total: number;
  last24h: number;
  last7d: number;
  avgDurationSec: number;
  medianDurationSec: number;
  activeNow: number;
}

const formatDuration = (sec: number) => {
  if (!sec || sec < 1) return "0s";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

const VisitorStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from("site_visits")
      .select("started_at, last_seen_at, duration_seconds")
      .order("started_at", { ascending: false })
      .limit(5000);

    if (error || !data) {
      setLoading(false);
      return;
    }

    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const activeWindow = now - 2 * 60 * 1000;

    const durations = data
      .map((v) => v.duration_seconds || 0)
      .filter((d) => d > 0)
      .sort((a, b) => a - b);
    const avg =
      durations.length > 0
        ? durations.reduce((s, d) => s + d, 0) / durations.length
        : 0;
    const median =
      durations.length > 0 ? durations[Math.floor(durations.length / 2)] : 0;

    setStats({
      total: data.length,
      last24h: data.filter((v) => new Date(v.started_at).getTime() >= dayAgo)
        .length,
      last7d: data.filter((v) => new Date(v.started_at).getTime() >= weekAgo)
        .length,
      avgDurationSec: avg,
      medianDurationSec: median,
      activeNow: data.filter(
        (v) => new Date(v.last_seen_at).getTime() >= activeWindow
      ).length,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 30000);
    return () => clearInterval(id);
  }, []);

  const cards = [
    {
      icon: Users,
      label: "Totalt antal besökare",
      value: stats?.total ?? "—",
      hint: "Unika sessioner sedan start",
    },
    {
      icon: TrendingUp,
      label: "Senaste 24 timmarna",
      value: stats?.last24h ?? "—",
      hint: `${stats?.last7d ?? "—"} senaste 7 dagarna`,
    },
    {
      icon: Eye,
      label: "Aktiva just nu",
      value: stats?.activeNow ?? "—",
      hint: "Senast aktiva ≤ 2 min",
    },
    {
      icon: Clock,
      label: "Snittid på sidan",
      value: stats ? formatDuration(stats.avgDurationSec) : "—",
      hint: stats
        ? `Median: ${formatDuration(stats.medianDurationSec)}`
        : "",
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl text-foreground">Besöksstatistik</h2>
        <p className="text-sm text-muted-foreground font-body">
          Översikt över hur många som besöker sidan och hur länge de stannar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-primary/10 bg-gradient-to-br from-card to-sage/5 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-body font-medium text-muted-foreground">
                    {c.label}
                  </CardTitle>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="font-serif text-3xl text-foreground">
                    {loading ? "…" : c.value}
                  </div>
                  {c.hint && (
                    <p className="text-xs text-muted-foreground font-body mt-1">
                      {c.hint}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default VisitorStats;
