import { useEffect, useMemo, useState } from "react";
import { Card, EmptyState, ErrorState, Spinner } from "../../components/ui/SharedComponents.jsx";
import { getCurrentUser } from "../../services/authService.js";
import { getMySubmissions } from "../../services/submissionService.js";

function Profile() {
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const [currentUser, mySubmissions] = await Promise.all([
          getCurrentUser(),
          getMySubmissions(),
        ]);

        if (isMounted) {
          setUser(currentUser ?? null);
          setSubmissions(Array.isArray(mySubmissions) ? mySubmissions : []);
        }
      } catch (profileError) {
        const backendMessage =
          profileError?.response?.data?.message ||
          profileError?.message ||
          "Failed to load profile.";

        if (isMounted) {
          setError(backendMessage);
          setUser(null);
          setSubmissions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const { totalSubmissions, acceptedCount, uniqueProblemsSolved } = useMemo(() => {
    const total = submissions.length;
    const acceptedSubmissions = submissions.filter(
      (submission) => submission?.verdict === "Accepted"
    );
    const accepted = acceptedSubmissions.length;
    const solvedProblems = new Set(
      acceptedSubmissions.map((submission) => submission?.problem_id)
    );

    return {
      totalSubmissions: total,
      acceptedCount: accepted,
      uniqueProblemsSolved: solvedProblems.size,
    };
  }, [submissions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-8">
        <Card className="mx-auto flex w-full max-w-4xl items-center justify-center gap-3 p-6 shadow-card sm:p-8">
          <Spinner />
          <span className="text-sm text-text-secondary">Loading profile...</span>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-8">
        <Card className="mx-auto w-full max-w-4xl p-6 shadow-card sm:p-8">
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-8">
        <Card className="mx-auto w-full max-w-4xl p-6 shadow-card sm:p-8">
          <EmptyState message="No profile data available right now." />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-4xl overflow-hidden border-white/10 bg-[#111820]/90 p-0 shadow-card">
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-violet-400 to-amber-400" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 border-b border-border-subtle/70 pb-6 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent-primary/25 bg-accent-primary/10 font-display text-2xl font-bold uppercase text-accent-primary">
              {String(user.username ?? "?").slice(0, 1)}
            </div>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent-primary">
                Code Arena profile
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">{user.username}</h1>
              <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-transparent p-4 transition hover:border-emerald-400/40">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">Total Submissions</p>
              <p className="mt-3 font-display text-3xl font-semibold text-text-primary">{totalSubmissions}</p>
            </div>
            <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-400/10 to-transparent p-4 transition hover:border-violet-400/40">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">Accepted</p>
              <p className="mt-3 font-display text-3xl font-semibold text-violet-300">{acceptedCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-transparent p-4 transition hover:border-amber-400/40">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">Problems Solved</p>
              <p className="mt-3 font-display text-3xl font-semibold text-amber-300">{uniqueProblemsSolved}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Profile;