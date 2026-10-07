import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Card, EmptyState, ErrorState, Spinner } from "../../components/ui/SharedComponents.jsx";
import { getMySubmissions } from "../../services/submissionService.js";

function formatSubmittedAt(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setError("");

        const submissionsResponse = await getMySubmissions();

        if (isMounted) {
          setSubmissions(Array.isArray(submissionsResponse) ? submissionsResponse : []);
        }
      } catch (submissionError) {
        const backendMessage =
          submissionError?.response?.data?.message ||
          submissionError?.message ||
          "Failed to load submissions.";

        if (isMounted) {
          setError(backendMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSubmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => submissions, [submissions]);

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-6xl border-white/10 bg-[#111820]/90 p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-3 border-b border-border-subtle/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent-primary">
              Your activity
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">My Submissions</h1>
            <p className="mt-2 text-sm text-text-secondary">Review the submissions created from your account.</p>
          </div>
          <span className="w-fit rounded-full border border-border-subtle/80 bg-bg-surface-hover/60 px-3 py-1.5 text-xs font-medium text-text-secondary">
            {rows.length} {rows.length === 1 ? "submission" : "submissions"}
          </span>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-border-subtle/80 bg-bg-surface/70 px-4 py-6 text-sm text-text-secondary">
            <Spinner />
            <span>Loading submissions...</span>
          </div>
        ) : error ? (
          <div className="mt-8">
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-8">
            <EmptyState message="No submissions yet — try solving a problem." />
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border-subtle/80 shadow-lg shadow-black/10">
            <table className="min-w-full divide-y divide-border-subtle/80">
              <thead className="bg-bg-surface-hover/80">
                <tr>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">ID</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Problem ID</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Language</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Verdict</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Execution Time</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Memory Used</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/80 bg-bg-surface/70">
                {rows.map((submission) => {
                  const submissionId = submission?.id ?? "";
                  const problemId = submission?.problem_id ?? "-";
                  const executionTime =
                    submission?.execution_time_ms != null ? `${submission.execution_time_ms} ms` : "-";
                  const memoryUsed =
                    submission?.memory_used_kb != null ? `${submission.memory_used_kb} KB` : "-";
                  const submittedAt = formatSubmittedAt(
                    submission?.submitted_at ?? submission?.created_at ?? submission?.submittedAt
                  );

                  return (
                    <tr
                      key={submissionId}
                      className="cursor-pointer transition-colors hover:bg-accent-primary/[0.06]"
                      onClick={() => navigate(`/submissions/${submissionId}`)}
                    >
                      <td className="px-4 py-4 text-sm text-text-secondary">{submissionId}</td>
                      <td className="px-4 py-4 text-sm text-text-secondary">{problemId}</td>
                      <td className="px-4 py-4 text-sm capitalize text-text-secondary">{submission?.language ?? "-"}</td>
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        <Badge value={submission?.verdict ?? "-"} variant="verdict" />
                      </td>
                      <td className="px-4 py-4 text-sm text-text-secondary">{executionTime}</td>
                      <td className="px-4 py-4 text-sm text-text-secondary">{memoryUsed}</td>
                      <td className="px-4 py-4 text-sm text-text-secondary">{submittedAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Submissions;