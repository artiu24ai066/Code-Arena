import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Card, EmptyState, ErrorState, Input, Select, Spinner } from "../../components/ui/SharedComponents.jsx";
import { getAllProblems } from "../../services/problemService.js";

function Problems() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProblems = async () => {
      try {
        setLoading(true);
        setError("");

        const problemsResponse = await getAllProblems();

        if (isMounted) {
          setProblems(Array.isArray(problemsResponse) ? problemsResponse : []);
        }
      } catch (problemsError) {
        const backendMessage =
          problemsError?.response?.data?.message ||
          problemsError?.response?.data?.error ||
          problemsError?.message;

        if (isMounted) {
          setError(backendMessage || "Failed to load problems.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProblems();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProblems = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const normalizedDifficultyFilter = difficultyFilter.toLowerCase();

    return problems.filter((problem) => {
      const title = String(problem?.title ?? "").toLowerCase();
      const difficulty = String(problem?.difficulty ?? "").toLowerCase();

      const matchesSearch =
        normalizedSearchTerm === "" || title.includes(normalizedSearchTerm);
      const matchesDifficulty =
        normalizedDifficultyFilter === "all" || difficulty === normalizedDifficultyFilter;

      return matchesSearch && matchesDifficulty;
    });
  }, [difficultyFilter, problems, searchTerm]);

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-6xl border-white/10 bg-[#111820]/90 p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-3 border-b border-border-subtle/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent-primary">
              Choose your next challenge
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">Problems</h1>
            <p className="mt-2 text-sm text-text-secondary">Browse and filter the available problems.</p>
          </div>
          <span className="w-fit rounded-full border border-border-subtle/80 bg-bg-surface-hover/60 px-3 py-1.5 text-xs font-medium text-text-secondary">
            {filteredProblems.length} {filteredProblems.length === 1 ? "problem" : "problems"}
          </span>
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl border border-border-subtle/60 bg-black/10 p-4 sm:grid-cols-2 sm:p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="searchTerm">
              Search
            </label>
            <Input
              id="searchTerm"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="difficultyFilter">
              Difficulty
            </label>
            <Select
              id="difficultyFilter"
              value={difficultyFilter}
              onChange={(event) => setDifficultyFilter(event.target.value)}
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-border-subtle/80 bg-bg-surface/70 px-4 py-6 text-sm text-text-secondary">
            <Spinner />
            <span>Loading problems...</span>
          </div>
        ) : error ? (
          <div className="mt-8">
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="mt-8">
            <EmptyState message="No problems match the current filters." />
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border-subtle/80 shadow-lg shadow-black/10">
            <table className="min-w-full divide-y divide-border-subtle/80">
              <thead className="bg-bg-surface-hover/80">
                <tr>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">ID</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Title</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/80 bg-bg-surface/70">
                {filteredProblems.map((problem) => {
                  const problemId = problem?.id ?? problem?._id ?? "";
                  const problemTitle = problem?.title ?? "Untitled Problem";
                  const problemDifficulty = problem?.difficulty ?? "Unknown";

                  return (
                    <tr
                      key={problemId}
                      className="cursor-pointer transition-colors hover:bg-accent-primary/[0.06]"
                      onClick={() => navigate(`/problems/${problemId}`)}
                    >
                      <td className="px-4 py-4 text-xs font-mono text-text-secondary/80">{problemId}</td>
                      <td className="px-4 py-4 text-sm font-medium text-text-primary">
                        <button
                          type="button"
                          className="text-left hover:text-accent-primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/problems/${problemId}`);
                          }}
                        >
                          {problemTitle}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        <Badge value={problemDifficulty} variant="difficulty" />
                      </td>
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

export default Problems;