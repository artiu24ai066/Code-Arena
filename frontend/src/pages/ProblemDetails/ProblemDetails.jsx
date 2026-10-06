import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { Badge, Card, EmptyState, ErrorState, Input, Select, Spinner } from "../../components/ui/SharedComponents.jsx";
import { getProblemById } from "../../services/problemService.js";
import { executeCode } from "../../services/executeService.js";
import {
  createSubmission,
  getSubmissionById,
} from "../../services/submissionService.js";

const starterTemplates = {
  cpp: `#include <iostream>

int main() {
    return 0;
}`,
  python: `# Write your solution here`,
  java: `public class Main {
    public static void main(String[] args) {
    }
}`,
  c: `#include <stdio.h>

int main() {
    return 0;
}`,
};

function getThemePreference() {
  if (typeof window === "undefined") {
    return "vs-dark";
  }

  return window.localStorage.getItem("editor-theme") ?? "vs-dark";
}

function isPendingVerdict(verdict) {
  return String(verdict ?? "").toLowerCase() === "pending";
}

function ProblemDetails() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(starterTemplates.cpp);
  const [theme, setTheme] = useState(getThemePreference());
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState("");
  const [executionTime, setExecutionTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pollingIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  const clearPollingInterval = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const formatSubmissionError = (err) => {
    const backendMessage = err?.response?.data?.message || err?.message || "Submission failed.";
    const backendType = err?.response?.data?.type;

    return backendType ? `${backendType}: ${backendMessage}` : backendMessage;
  };

  useEffect(() => {
    isMountedRef.current = true;

    let isMounted = true;

    const loadProblem = async () => {
      try {
        setLoading(true);
        setError("");

        const problemResponse = await getProblemById(id);

        if (isMounted) {
          setProblem(problemResponse ?? null);
        }
      } catch (err) {
        const backendMessage = err?.response?.data?.message;

        if (isMounted) {
          setError(backendMessage || "Failed to load problem.");
          setProblem(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadProblem();
    } else {
      setLoading(false);
      setError("Failed to load problem.");
      setProblem(null);
    }

    return () => {
      isMounted = false;
      isMountedRef.current = false;
      clearPollingInterval();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-8">
        <Card className="mx-auto flex w-full max-w-4xl items-center justify-center gap-3 p-6 shadow-card sm:p-8">
          <Spinner />
          <span className="text-sm text-text-secondary">Loading problem...</span>
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

  if (!problem) {
    return (
      <div className="min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-8">
        <Card className="mx-auto w-full max-w-4xl p-6 shadow-card sm:p-8">
          <EmptyState message="Failed to load problem." />
        </Card>
      </div>
    );
  }

  const title = problem.title ?? "Untitled Problem";
  const difficulty = problem.difficulty ?? "Unknown";
  const description = problem.description ?? "";
  const timeLimitMs = problem.time_limit_ms ?? problem.timeLimitMs;
  const memoryLimitKb = problem.memory_limit_kb ?? problem.memoryLimitKb;

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;

    setLanguage(nextLanguage);
    setCode(starterTemplates[nextLanguage] ?? "");
  };

  const handleThemeChange = (event) => {
    const nextTheme = event.target.value;

    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("editor-theme", nextTheme);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput("");
    setRunError("");
    setExecutionTime(null);

    try {
      const result = await executeCode(language, code, customInput);

      setOutput(result?.output ?? "");
      setExecutionTime(result?.executionTime ?? null);
    } catch (err) {
      const errorType = err?.response?.data?.type;
      const errorMessage = err?.response?.data?.message;
      const fallbackMessage = err?.message || "Unable to run code.";
      const friendlyType = errorType
        ? errorType
            .split("_")
            .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
            .join(" ")
        : "Run Error";

      setRunError(
        errorType || errorMessage
          ? `${friendlyType}: ${errorMessage || fallbackMessage}`
          : fallbackMessage
      );
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem?.id) {
      setSubmitError("Failed to submit problem.");
      return;
    }

    clearPollingInterval();
    setSubmitting(true);
    setSubmitError("");
    setSubmission(null);

    try {
      const createdSubmission = await createSubmission(problem.id, language, code);

      if (!isMountedRef.current) {
        return;
      }

      setSubmission(createdSubmission);

      if (createdSubmission?.verdict && !isPendingVerdict(createdSubmission.verdict)) {
        setSubmitting(false);
        return;
      }

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const latestSubmission = await getSubmissionById(createdSubmission.id);

          if (!isMountedRef.current) {
            return;
          }

          setSubmission(latestSubmission);

          if (!isPendingVerdict(latestSubmission?.verdict)) {
            clearPollingInterval();
            setSubmitting(false);
          }
        } catch (err) {
          clearPollingInterval();

          if (isMountedRef.current) {
            setSubmitError(formatSubmissionError(err));
            setSubmitting(false);
          }
        }
      }, 2000);
    } catch (err) {
      clearPollingInterval();

      if (isMountedRef.current) {
        setSubmitError(formatSubmissionError(err));
        setSubmitting(false);
      }
    }
  };

  const verdictBadgeClasses = (verdict) => {
    const normalizedVerdict = String(verdict ?? "").toLowerCase();

    if (normalizedVerdict === "pending") {
      return "border border-verdict-pending/40 bg-verdict-pending/10 text-verdict-pending";
    }

    if (normalizedVerdict === "accepted") {
      return "border border-verdict-accepted/40 bg-verdict-accepted/10 text-verdict-accepted";
    }

    if (normalizedVerdict === "wrong") {
      return "border border-verdict-wrong/40 bg-verdict-wrong/10 text-verdict-wrong";
    }

    if (normalizedVerdict === "tle") {
      return "border border-verdict-tle/40 bg-verdict-tle/10 text-verdict-tle";
    }

    if (normalizedVerdict === "mle") {
      return "border border-verdict-mle/40 bg-verdict-mle/10 text-verdict-mle";
    }

    return "border border-verdict-error/40 bg-verdict-error/10 text-verdict-error";
  };

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-4xl p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Time Limit: {timeLimitMs ?? "-"} ms · Memory Limit: {memoryLimitKb ?? "-"} KB
            </p>
          </div>

          <Badge value={difficulty} variant="difficulty" />
        </div>

        <div className="mt-6 rounded-2xl border border-border-subtle/80 bg-bg-surface/70 p-4 text-sm leading-6 text-text-secondary sm:p-6">
          <div className="whitespace-pre-wrap">{description}</div>
        </div>

        <div className="mt-6 rounded-2xl border border-border-subtle/80 bg-bg-surface/50 p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="language">
                  Language
                </label>
                <Select
                  id="language"
                  value={language}
                  onChange={handleLanguageChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
                >
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="theme">
                  Theme
                </label>
                <Select
                  id="theme"
                  value={theme}
                  onChange={handleThemeChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
                >
                  <option value="vs-dark">Dark</option>
                  <option value="light">Light</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border-subtle/80">
            <Editor
              height="500px"
              language={language}
              theme={theme}
              value={code}
              onChange={(value) => setCode(value ?? "")}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="customInput">
              Custom Input
            </label>
            <textarea
              id="customInput"
              rows="4"
              value={customInput}
              onChange={(event) => setCustomInput(event.target.value)}
              placeholder="Enter custom input here"
              className="w-full rounded-lg border border-border-subtle/80 bg-bg-surface-hover/70 px-3 py-2 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRun}
                disabled={running}
                className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {running ? "Running..." : "Run"}
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg border border-accent-primary/40 bg-transparent px-4 py-2 text-sm font-medium text-accent-primary transition hover:bg-accent-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting
                  ? isPendingVerdict(submission?.verdict)
                    ? "Judging..."
                    : "Submitting..."
                  : "Submit"}
              </button>
            </div>

            {executionTime !== null ? (
              <p className="text-xs text-text-secondary">Executed in {executionTime} ms</p>
            ) : null}
          </div>

          <div className="mt-4 rounded-2xl border border-border-subtle/80 bg-bg-surface/70 p-4">
            <p className="mb-2 text-sm font-medium text-text-primary">Output</p>

            {runError ? (
              <div className="rounded-lg border border-verdict-wrong/30 bg-verdict-wrong/10 px-3 py-2 text-sm text-verdict-wrong">
                {runError}
              </div>
            ) : output ? (
              <pre className="overflow-x-auto rounded-lg bg-base px-4 py-3 font-display text-sm text-text-primary whitespace-pre-wrap">
                {output}
              </pre>
            ) : (
              <div className="rounded-lg border border-dashed border-border-subtle/80 px-3 py-4 text-sm text-text-secondary">
                Run your code to see output here
              </div>
            )}
          </div>

          {submitError ? (
            <div className="mt-4 rounded-xl border border-verdict-wrong/30 bg-verdict-wrong/10 px-4 py-3 text-sm text-verdict-wrong">
              {submitError}
            </div>
          ) : submission ? (
            <div className="mt-4 rounded-2xl border border-border-subtle/80 bg-bg-surface/70 p-4">
              <p className="mb-2 text-sm font-medium text-text-primary">Verdict</p>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold ${verdictBadgeClasses(submission.verdict)}`}
                  >
                    {isPendingVerdict(submission.verdict) ? (
                      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-pending" />
                    ) : null}
                    {isPendingVerdict(submission.verdict)
                      ? "Judging..."
                      : submission.verdict === "Accepted"
                        ? "Accepted"
                        : submission.verdict}
                  </span>

                  {isPendingVerdict(submission.verdict) ? (
                    <span className="text-xs text-text-secondary">Polling every 2 seconds</span>
                  ) : null}
                </div>

                <div className="text-xs text-text-secondary">
                  {submission.execution_time_ms != null ? (
                    <span>Execution Time: {submission.execution_time_ms} ms</span>
                  ) : null}
                  {submission.execution_time_ms != null && submission.memory_used_kb != null ? (
                    <span> · </span>
                  ) : null}
                  {submission.memory_used_kb != null ? (
                    <span>Memory Used: {submission.memory_used_kb} KB</span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

export default ProblemDetails;