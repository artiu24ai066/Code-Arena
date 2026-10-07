import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Card, ErrorState, Spinner } from "../../components/ui/SharedComponents.jsx";
import { getSubmissionById } from "../../services/submissionService.js";

function SubmissionDetails() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSubmission = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getSubmissionById(id);

        if (isMounted) {
          setSubmission(result);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Failed to load submission."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSubmission();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-6xl p-6 shadow-card sm:p-8">
        <Link
          to="/submissions"
          className="text-sm font-medium text-accent-primary hover:underline"
        >
          Back to submissions
        </Link>

        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-3 py-8 text-sm text-text-secondary">
            <Spinner />
            <span>Loading submission...</span>
          </div>
        ) : error ? (
          <div className="mt-8">
            <ErrorState message={error} />
          </div>
        ) : submission ? (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">
                  Submission #{submission.id}
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                  Problem #{submission.problem_id} ·{" "}
                  <span className="capitalize">{submission.language}</span>
                </p>
              </div>
              <Badge value={submission.verdict ?? "Pending"} variant="verdict" />
            </div>

            <section className="mt-6 overflow-hidden rounded-xl border border-border-subtle/80">
              <div className="flex items-center justify-between border-b border-border-subtle/80 bg-bg-surface-hover/80 px-4 py-3">
                <h2 className="text-sm font-semibold text-text-primary">Submitted Code</h2>
                <span className="text-xs uppercase text-text-secondary">
                  {submission.language}
                </span>
              </div>
              <pre className="max-h-[70vh] overflow-auto bg-bg-surface/70 p-4 text-sm leading-6 text-text-primary">
                <code>{submission.code ?? "No code was saved for this submission."}</code>
              </pre>
            </section>
          </>
        ) : null}
      </Card>
    </div>
  );
}

export default SubmissionDetails;
