import { useEffect, useState } from "react";
import { Card, EmptyState, ErrorState, Spinner } from "../../components/ui/SharedComponents.jsx";
import { getStats } from "../../services/adminService.js";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        const adminStats = await getStats();

        if (isMounted) {
          setStats(adminStats ?? null);
        }
      } catch (statsError) {
        const backendMessage =
          statsError?.response?.data?.message ||
          statsError?.message ||
          "Failed to load admin dashboard.";

        if (isMounted) {
          setError(backendMessage);
          setStats(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-border-subtle/80 bg-bg-surface/70 px-4 py-8 text-sm text-text-secondary">
        <Spinner />
        <span>Loading admin dashboard...</span>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!stats) {
    return <EmptyState message="No admin dashboard data is available right now." />;
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
    },
    {
      label: "Total Problems",
      value: stats.totalProblems,
    },
    {
      label: "Total Submissions",
      value: stats.totalSubmissions,
    },
    {
      label: "Accepted Submissions",
      value: stats.acceptedSubmissions,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-border-subtle/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent-primary">
            Platform overview
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">Dashboard</h2>
          <p className="mt-2 text-sm text-text-secondary">
          Overview of platform activity and admin tools.
          </p>
        </div>
        <span className="text-xs text-text-secondary">Live platform totals</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => {
          const accents = [
            "border-t-accent-primary",
            "border-t-verdict-accepted",
            "border-t-verdict-pending",
            "border-t-accent-secondary",
          ];

          return (
            <Card
              key={card.label}
              className={`group border-t-2 ${accents[index]} p-5 transition duration-200 hover:-translate-y-1 hover:bg-bg-surface-hover/80`}
            >
              <p className="text-sm font-medium text-text-secondary">{card.label}</p>
              <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-text-primary transition group-hover:text-accent-primary">
                {card.value ?? 0}
              </p>
              <div className="mt-4 h-px w-full bg-border-subtle/70" />
              <p className="mt-3 text-xs uppercase tracking-wider text-text-secondary">
                Current total
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default AdminDashboard;