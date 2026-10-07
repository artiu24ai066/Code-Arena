import { Fragment, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Boxes,
  CheckCircle2,
  Copy,
  Eye,
  FileText,
  ListChecks,
  Pencil,
  Plus,
  Save,
  Send,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "../../components/ui/Icons";
import { getAllProblems } from "../../services/problemService.js";
import {
  createProblem,
  createTestCase,
  deleteTestCase,
  deleteProblem,
  getTestCases,
  updateTestCase,
  updateProblem,
} from "../../services/adminService.js";

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const TAG_OPTIONS = [
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Graph",
  "Tree",
  "Binary Search",
  "Sorting",
  "Math",
  "Stack",
  "Queue",
  "Heap",
  "Recursion",
  "Backtracking",
];

function getDifficultyBadgeClasses(difficulty) {
  const normalizedDifficulty = String(difficulty ?? "").toLowerCase();

  if (normalizedDifficulty === "easy") {
    return "border border-signal text-signal";
  }

  if (normalizedDifficulty === "medium") {
    return "border border-pending text-pending";
  }

  if (normalizedDifficulty === "hard") {
    return "border border-reject text-reject";
  }

  return "border border-paper/30 text-paper/60";
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeTestCase(testCase, fallbackId) {
  const resolvedId = testCase?.id ?? fallbackId ?? `testcase-${Date.now()}-${Math.random()}`;

  return {
    id: resolvedId,
    input: testCase?.input ?? testCase?.test_input ?? testCase?.stdin ?? "",
    expectedOutput:
      testCase?.expectedOutput ?? testCase?.expected_output ?? testCase?.output ?? "",
    isSample: Boolean(testCase?.isSample ?? testCase?.is_sample),
  };
}

function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formMode, setFormMode] = useState("closed");
  const [editingProblem, setEditingProblem] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formInputFormat, setFormInputFormat] = useState("");
  const [formOutputFormat, setFormOutputFormat] = useState("");
  const [formConstraints, setFormConstraints] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("easy");
  const [formTags, setFormTags] = useState([]);
  const [formTimeLimit, setFormTimeLimit] = useState(1000);
  const [formMemoryLimit, setFormMemoryLimit] = useState(256);
  const [formSampleExplanation, setFormSampleExplanation] = useState("");
  const [formStatus, setFormStatus] = useState("draft");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewProblem, setPreviewProblem] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [expandedProblemId, setExpandedProblemId] = useState(null);
  const [testCasesByProblem, setTestCasesByProblem] = useState({});
  const [testCasesLoading, setTestCasesLoading] = useState(false);
  const [testCasesError, setTestCasesError] = useState("");
  const [addingTestCase, setAddingTestCase] = useState(false);
  const [testCaseDraft, setTestCaseDraft] = useState({
    input: "",
    expectedOutput: "",
    isSample: false,
  });
  const [editingTestCaseId, setEditingTestCaseId] = useState(null);
  const [testCaseFormError, setTestCaseFormError] = useState("");
  const testCasesRequestRef = useRef(0);
  const testCaseFormRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast({ message: "", type: "success" });
    }, 2400);
  };

  const resetTestCaseForm = () => {
    setTestCaseDraft({ input: "", expectedOutput: "", isSample: false });
    setEditingTestCaseId(null);
    setTestCaseFormError("");
  };

  const getErrorMessage = (requestError, fallbackMessage) => {
    return (
      requestError?.response?.data?.message ||
      requestError?.response?.data?.error ||
      requestError?.message ||
      fallbackMessage
    );
  };

  const loadProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const problemsResponse = await getAllProblems();
      const normalizedProblems = Array.isArray(problemsResponse)
        ? problemsResponse.map((problem) => ({
            ...problem,
            tags: normalizeTags(problem?.tags),
            timeLimit: problem?.timeLimit ?? problem?.time_limit ?? 1000,
            memoryLimit: problem?.memoryLimit ?? problem?.memory_limit ?? 256,
            inputFormat: problem?.inputFormat ?? problem?.input_format ?? "",
            outputFormat: problem?.outputFormat ?? problem?.output_format ?? "",
            constraints: problem?.constraints ?? "",
            sampleExplanation: problem?.sampleExplanation ?? problem?.sample_explanation ?? "",
            status: problem?.status ?? "draft",
          }))
        : [];

      setProblems(normalizedProblems);
    } catch (problemsError) {
      const backendMessage =
        problemsError?.response?.data?.message ||
        problemsError?.response?.data?.error ||
        problemsError?.message;

      setError(backendMessage || "Failed to load problems.");
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();

    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const loadTestCases = async (problemId, requestId) => {
    try {
      setTestCasesLoading(true);
      setTestCasesError("");

      const testCasesResponse = await getTestCases(problemId);

      if (testCasesRequestRef.current !== requestId) {
        return;
      }

      const nextCases = Array.isArray(testCasesResponse)
        ? testCasesResponse.map((testCase, index) => normalizeTestCase(testCase, `testcase-${problemId}-${index + 1}`))
        : [];

      setTestCasesByProblem((current) => ({ ...current, [problemId]: nextCases }));
    } catch (testCasesRequestError) {
      if (testCasesRequestRef.current !== requestId) {
        return;
      }

      setTestCasesError(getErrorMessage(testCasesRequestError, "Failed to load test cases."));
      setTestCasesByProblem((current) => ({ ...current, [problemId]: [] }));
    } finally {
      if (testCasesRequestRef.current === requestId) {
        setTestCasesLoading(false);
      }
    }
  };

  const handleOpenCreateForm = () => {
    setFormMode("create");
    setEditingProblem(null);
    setFormTitle("");
    setFormDescription("");
    setFormInputFormat("");
    setFormOutputFormat("");
    setFormConstraints("");
    setFormDifficulty("easy");
    setFormTags([]);
    setFormTimeLimit(1000);
    setFormMemoryLimit(256);
    setFormSampleExplanation("");
    setFormStatus("draft");
    setFormError("");
  };

  const handleEditProblem = (problem) => {
    setFormMode("edit");
    setEditingProblem(problem);
    setFormTitle(problem?.title ?? "");
    setFormDescription(problem?.description ?? "");
    setFormInputFormat(problem?.inputFormat ?? problem?.input_format ?? "");
    setFormOutputFormat(problem?.outputFormat ?? problem?.output_format ?? "");
    setFormConstraints(problem?.constraints ?? "");
    setFormDifficulty(problem?.difficulty ?? "easy");
    setFormTags(normalizeTags(problem?.tags));
    setFormTimeLimit(problem?.timeLimit ?? problem?.time_limit ?? 1000);
    setFormMemoryLimit(problem?.memoryLimit ?? problem?.memory_limit ?? 256);
    setFormSampleExplanation(
      problem?.sampleExplanation ?? problem?.sample_explanation ?? ""
    );
    setFormStatus(problem?.status ?? "draft");
    setFormError("");
    setExpandedProblemId(null);
  };

  const handleCancelForm = () => {
    setFormMode("closed");
    setEditingProblem(null);
    setFormTitle("");
    setFormDescription("");
    setFormInputFormat("");
    setFormOutputFormat("");
    setFormConstraints("");
    setFormDifficulty("easy");
    setFormTags([]);
    setFormTimeLimit(1000);
    setFormMemoryLimit(256);
    setFormSampleExplanation("");
    setFormStatus("draft");
    setFormError("");
  };

  const validateProblemForm = (mode) => {
    const trimmedTitle = formTitle.trim();
    const trimmedDescription = formDescription.trim();

    if (!trimmedTitle) {
      return "Title is required.";
    }

    if (!trimmedDescription) {
      return "Problem statement is required.";
    }

    if (!formDifficulty) {
      return "Difficulty is required.";
    }

    if (!Number.isSafeInteger(formTimeLimit) || formTimeLimit <= 0) {
      return "Time limit must be a positive integer in milliseconds.";
    }

    if (!Number.isSafeInteger(formMemoryLimit) || formMemoryLimit <= 0) {
      return "Memory limit must be a positive integer in MB.";
    }

    if (mode === "publish") {
      const currentTestCases = testCasesByProblem[editingProblem?.id ?? "__new__"] ?? [];
      const hasAnyTestCase = currentTestCases.length > 0;
      const hasHiddenTestCase = currentTestCases.some((testCase) => !testCase.isSample);

      if (!hasAnyTestCase) {
        return "At least one test case is required before publishing.";
      }

      if (!hasHiddenTestCase) {
        return "At least one hidden test case is required before publishing.";
      }
    }

    return "";
  };

  const handleSubmitForm = async (mode) => {
    const validationMessage = validateProblemForm(mode);

    if (validationMessage) {
      setFormError(validationMessage);
      showToast(validationMessage, "error");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");

      const trimmedTitle = formTitle.trim();
      const trimmedDescription = formDescription.trim();
      const nextStatus = mode === "publish" ? "published" : "draft";
      const extraPayload = {
        tags: formTags,
        timeLimit: formTimeLimit,
        memoryLimit: formMemoryLimit,
        inputFormat: formInputFormat.trim(),
        outputFormat: formOutputFormat.trim(),
        constraints: formConstraints.trim(),
        sampleExplanation: formSampleExplanation.trim(),
        status: nextStatus,
      };

      let savedProblem;

      if (formMode === "edit" && editingProblem?.id != null) {
        savedProblem = await updateProblem(
          editingProblem.id,
          trimmedTitle,
          trimmedDescription,
          formDifficulty,
          extraPayload
        );
      } else {
        savedProblem = await createProblem(
          trimmedTitle,
          trimmedDescription,
          formDifficulty,
          extraPayload
        );
      }

      const mergedProblem = {
        ...savedProblem,
        id: savedProblem?.id ?? editingProblem?.id,
        title: trimmedTitle,
        description: trimmedDescription,
        difficulty: formDifficulty,
        tags: formTags,
        timeLimit: formTimeLimit,
        memoryLimit: formMemoryLimit,
        inputFormat: formInputFormat.trim(),
        outputFormat: formOutputFormat.trim(),
        constraints: formConstraints.trim(),
        sampleExplanation: formSampleExplanation.trim(),
        status: nextStatus,
      };

      setProblems((current) => {
        if (formMode === "edit" && editingProblem?.id != null) {
          return current.map((problem) => {
            if (problem?.id === editingProblem.id) {
              return mergedProblem;
            }
            return problem;
          });
        }

        return [mergedProblem, ...current];
      });

      setFormMode("closed");
      setEditingProblem(null);
      setFormTitle("");
      setFormDescription("");
      setFormInputFormat("");
      setFormOutputFormat("");
      setFormConstraints("");
      setFormDifficulty("easy");
      setFormTags([]);
      setFormTimeLimit(1000);
      setFormMemoryLimit(256);
      setFormSampleExplanation("");
      setFormStatus(nextStatus);
      showToast(mode === "publish" ? "Problem published successfully." : "Draft saved successfully.", "success");
    } catch (submissionError) {
      const backendMessage = submissionError?.response?.data?.message;
      const message = backendMessage || "Failed to save problem.";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProblem = async (problem) => {
    try {
      await deleteProblem(problem.id);
      setProblems((current) => current.filter((item) => item?.id !== problem.id));
      setDeleteTarget(null);
      showToast("Problem deleted successfully.", "success");
    } catch (deleteProblemError) {
      const backendMessage =
        deleteProblemError?.response?.data?.message ||
        deleteProblemError?.message ||
        "Failed to delete problem.";

      showToast(backendMessage, "error");
      setDeleteTarget(null);
    }
  };

  const handleToggleTestCases = async (problemId) => {
    if (expandedProblemId === problemId) {
      testCasesRequestRef.current += 1;
      setExpandedProblemId(null);
      setTestCasesLoading(false);
      setTestCasesError("");
      resetTestCaseForm();
      return;
    }

    const requestId = testCasesRequestRef.current + 1;
    testCasesRequestRef.current = requestId;

    setExpandedProblemId(problemId);
    setTestCasesLoading(true);
    setTestCasesError("");
    resetTestCaseForm();

    await loadTestCases(problemId, requestId);
  };

  const handleSaveTestCase = async (event, problemId) => {
    event.preventDefault();

    const trimmedInput = testCaseDraft.input.trim();
    const trimmedExpectedOutput = testCaseDraft.expectedOutput.trim();

    if (!trimmedInput || !trimmedExpectedOutput) {
      setTestCaseFormError("Input and expected output are required.");
      return;
    }

    try {
      setAddingTestCase(true);
      setTestCaseFormError("");

      if (editingTestCaseId != null) {
        const updatedTestCase = await updateTestCase(
          problemId,
          editingTestCaseId,
          trimmedInput,
          trimmedExpectedOutput,
          testCaseDraft.isSample
        );

        const normalizedTestCase = normalizeTestCase(
          updatedTestCase,
          editingTestCaseId
        );

        setTestCasesByProblem((current) => ({
          ...current,
          [problemId]: (current[problemId] ?? []).map((testCase) =>
            testCase.id === editingTestCaseId
              ? normalizedTestCase
              : testCase
          ),
        }));
      } else {
        const createdTestCase = await createTestCase(
          problemId,
          trimmedInput,
          trimmedExpectedOutput,
          testCaseDraft.isSample
        );

        const newTestCase = normalizeTestCase(
          {
            ...createdTestCase,
            input: trimmedInput,
            expectedOutput: trimmedExpectedOutput,
            isSample: testCaseDraft.isSample,
          },
          createdTestCase?.id ?? `testcase-${problemId}-${Date.now()}`
        );

        setTestCasesByProblem((current) => ({
          ...current,
          [problemId]: [...(current[problemId] ?? []), newTestCase],
        }));
      }

      resetTestCaseForm();
      showToast(editingTestCaseId ? "Test case updated." : "Test case added.", "success");
    } catch (testCaseError) {
      const message = getErrorMessage(testCaseError, "Failed to save test case.");
      setTestCaseFormError(message);
      showToast(message, "error");
    } finally {
      setAddingTestCase(false);
    }
  };

  const handleEditTestCase = (problemId, testCase) => {
    setEditingTestCaseId(testCase.id);
    setTestCaseDraft({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      isSample: testCase.isSample,
    });
    setTestCaseFormError("");
    testCaseFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleDuplicateTestCase = async (problemId, testCase) => {
    try {
      const createdTestCase = await createTestCase(
        problemId,
        testCase.input,
        testCase.expectedOutput,
        testCase.isSample
      );
      const duplicatedTestCase = normalizeTestCase(
        createdTestCase,
        createdTestCase?.id ?? `testcase-${problemId}-${Date.now()}`
      );

      setTestCasesByProblem((current) => ({
        ...current,
        [problemId]: [...(current[problemId] ?? []), duplicatedTestCase],
      }));
      showToast("Test case duplicated.", "success");
    } catch (duplicateError) {
      showToast(getErrorMessage(duplicateError, "Failed to duplicate test case."), "error");
    }
  };

  const handleDeleteTestCase = async (problemId, testCaseId) => {
    try {
      await deleteTestCase(problemId, testCaseId);
      setTestCasesByProblem((current) => ({
        ...current,
        [problemId]: (current[problemId] ?? []).filter((testCase) => testCase.id !== testCaseId),
      }));
      showToast("Test case removed.", "success");
    } catch (deleteError) {
      showToast(getErrorMessage(deleteError, "Failed to delete test case."), "error");
    }
  };

  const handleViewProblem = (problem) => {
    setPreviewProblem({
      ...problem,
      testCases: testCasesByProblem[problem?.id] ?? [],
    });
  };

  const toggleTag = (tag) => {
    setFormTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }

      return [...current, tag];
    });
  };

  const isEditing = formMode === "edit";

  return (
    <div className="min-h-screen space-y-6 bg-transparent p-2 text-paper sm:p-4 lg:p-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-signal">
              <Sparkles size={14} />
              Admin workspace
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-paper">Problem management</h1>
            <p className="mt-2 max-w-2xl text-sm text-paper/70">
              Create polished problem pages, manage test cases, and review the exact experience users will see.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-signal-dark"
          >
            <Plus size={16} />
            Create Problem
          </button>
        </div>
      </div>

      {toast.message ? (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
            toast.type === "error"
              ? "border-reject/30 bg-reject/10 text-reject"
              : "border-signal/30 bg-signal/10 text-signal"
          }`}
        >
          {toast.type === "error" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      ) : null}

      {formMode !== "closed" ? (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-paper">
                {isEditing ? "Edit problem" : "Create a new problem"}
              </h2>
              <p className="mt-1 text-sm text-paper/70">
                Build a complete problem experience with structured metadata and test cases.
              </p>
            </div>
            {isEditing && editingProblem ? (
              <div className="rounded-full border border-paper/10 bg-white/5 px-3 py-1 text-sm text-paper/60">
                Editing problem #{editingProblem.id}
              </div>
            ) : null}
          </div>

          <form className="mt-6 space-y-6" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-paper/80" htmlFor="problem-title">
                  Problem Title
                </label>
                <input
                  id="problem-title"
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  placeholder="Add an engaging title"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-paper/80" htmlFor="problem-difficulty">
                  Difficulty
                </label>
                <select
                  id="problem-difficulty"
                  value={formDifficulty}
                  onChange={(event) => setFormDifficulty(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-paper/80" htmlFor="problem-time-limit">
                  Time Limit (ms)
                </label>
                <input
                  id="problem-time-limit"
                  type="number"
                  min="1"
                  value={formTimeLimit}
                  onChange={(event) => setFormTimeLimit(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-paper/80" htmlFor="problem-memory-limit">
                  Memory Limit (MB)
                </label>
                <input
                  id="problem-memory-limit"
                  type="number"
                  min="1"
                  value={formMemoryLimit}
                  onChange={(event) => setFormMemoryLimit(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-paper/80">
                <Tag size={16} />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => {
                  const selected = formTags.includes(tag);

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        selected
                          ? "border-signal bg-signal/15 text-signal"
                          : "border-white/10 bg-white/5 text-paper/70 hover:bg-white/10"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-paper/80" htmlFor="problem-statement">
                Problem Statement
              </label>
              <textarea
                id="problem-statement"
                rows="6"
                value={formDescription}
                onChange={(event) => setFormDescription(event.target.value)}
                placeholder="Describe the challenge clearly"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-paper/80" htmlFor="problem-input-format">
                  Input Format
                </label>
                <textarea
                  id="problem-input-format"
                  rows="4"
                  value={formInputFormat}
                  onChange={(event) => setFormInputFormat(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-paper/80" htmlFor="problem-output-format">
                  Output Format
                </label>
                <textarea
                  id="problem-output-format"
                  rows="4"
                  value={formOutputFormat}
                  onChange={(event) => setFormOutputFormat(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-paper/80" htmlFor="problem-constraints">
                Constraints
              </label>
              <textarea
                id="problem-constraints"
                rows="4"
                value={formConstraints}
                onChange={(event) => setFormConstraints(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-paper/80" htmlFor="problem-sample-explanation">
                Sample Explanation (optional)
              </label>
              <textarea
                id="problem-sample-explanation"
                rows="4"
                value={formSampleExplanation}
                onChange={(event) => setFormSampleExplanation(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
              />
            </div>

            {formError ? (
              <div className="rounded-xl border border-reject/30 bg-reject/10 px-4 py-3 text-sm text-reject">
                {formError}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleSubmitForm("draft")}
                disabled={formSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-paper transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={16} />
                {formSubmitting ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={() => handleSubmitForm("publish")}
                disabled={formSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2 text-sm font-medium text-ink transition hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send size={16} />
                {formSubmitting ? "Publishing..." : "Publish"}
              </button>
              <button
                type="button"
                onClick={handleCancelForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-paper transition hover:bg-white/10"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-paper/60">Total Problems</p>
              <Boxes size={18} className="text-signal" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-paper">{problems.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-paper/60">Drafts</p>
              <FileText size={18} className="text-pending" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-paper">
              {problems.filter((problem) => problem?.status === "draft").length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-paper/60">Published</p>
              <BookOpen size={18} className="text-signal" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-paper">
              {problems.filter((problem) => problem?.status === "published").length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-paper/70">
            Loading problems...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-reject/30 bg-reject/10 px-4 py-10 text-center text-sm text-reject">
            {error}
          </div>
        ) : problems.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-paper/70">
            No problems yet. Create your first challenge to get started.
          </div>
        ) : (
          <div className="mt-6">
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">Difficulty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">Tags</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">Time Limit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">Memory Limit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-white/5">
                  {problems.map((problem) => {
                    const problemId = problem?.id ?? "";
                    const problemTitle = problem?.title ?? "Untitled Problem";
                    const problemDifficulty = problem?.difficulty ?? "Unknown";
                    const tags = normalizeTags(problem?.tags);
                    const timeLimit = problem?.timeLimit ?? problem?.time_limit ?? 1000;
                    const memoryLimit = problem?.memoryLimit ?? problem?.memory_limit ?? 256;
                    const isExpanded = expandedProblemId === problemId;

                    return (
                      <Fragment key={problemId}>
                        <tr className="transition hover:bg-white/10">
                          <td className="px-4 py-4 text-sm text-paper/80">{problemId}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-paper">{problemTitle}</td>
                          <td className="px-4 py-4 text-sm text-paper/80">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getDifficultyBadgeClasses(problemDifficulty)}`}>
                              {problemDifficulty}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-paper/80">
                            <div className="flex flex-wrap gap-2">
                              {tags.length > 0 ? (
                                tags.map((tag) => (
                                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-paper/70">
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-paper/40">No tags</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-paper/80">{timeLimit} ms</td>
                          <td className="px-4 py-4 text-sm text-paper/80">{memoryLimit} MB</td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleViewProblem(problem)}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-paper/80 transition hover:bg-white/10"
                              >
                                <Eye size={14} />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditProblem(problem)}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-paper/80 transition hover:bg-white/10"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(problem)}
                                className="inline-flex items-center gap-2 rounded-lg border border-reject/30 bg-reject/10 px-3 py-2 text-xs font-medium text-reject transition hover:bg-reject/20"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleTestCases(problemId)}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-paper/80 transition hover:bg-white/10"
                              >
                                <ListChecks size={14} />
                                {isExpanded ? "Hide Tests" : "Tests"}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded ? (
                          <tr>
                            <td colSpan="7" className="px-4 pb-4 pt-0">
                              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <h3 className="text-sm font-semibold text-paper">Test case manager</h3>
                                    <p className="text-sm text-paper/60">Manage sample and hidden cases for this problem.</p>
                                  </div>
                                  <div className="text-sm text-paper/60">Problem #{problemId}</div>
                                </div>

                                {testCasesError ? (
                                  <div className="mt-4 rounded-xl border border-reject/30 bg-reject/10 px-4 py-3 text-sm text-reject">
                                    {testCasesError}
                                  </div>
                                ) : null}

                                {testCasesLoading ? (
                                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-paper/70">
                                    Loading test cases...
                                  </div>
                                ) : (
                                  <div className="mt-4 space-y-4">
                                    {(testCasesByProblem[problemId] ?? []).length === 0 ? (
                                      <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-paper/70">
                                        No test cases yet. Add the first case to start validating the problem.
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        {(testCasesByProblem[problemId] ?? []).map((testCase) => (
                                          <div key={testCase.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                              <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${testCase.isSample ? "border-signal/30 bg-signal/10 text-signal" : "border-paper/20 bg-white/5 text-paper/60"}`}>
                                                    {testCase.isSample ? "Sample" : "Hidden"}
                                                  </span>
                                                  <span className="text-xs text-paper/40">ID {testCase.id}</span>
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2">
                                                  <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">Input</p>
                                                    <pre className="mt-1 whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-paper/80">
                                                      {testCase.input || "-"}
                                                    </pre>
                                                  </div>
                                                  <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">Expected Output</p>
                                                    <pre className="mt-1 whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-paper/80">
                                                      {testCase.expectedOutput || "-"}
                                                    </pre>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex flex-wrap gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() => handleEditTestCase(problemId, testCase)}
                                                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-paper/80 transition hover:bg-white/10"
                                                >
                                                  <Pencil size={14} />
                                                  Edit
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDuplicateTestCase(problemId, testCase)}
                                                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-paper/80 transition hover:bg-white/10"
                                                >
                                                  <Copy size={14} />
                                                  Duplicate
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteTestCase(problemId, testCase.id)}
                                                  className="inline-flex items-center gap-2 rounded-lg border border-reject/30 bg-reject/10 px-3 py-2 text-xs font-medium text-reject transition hover:bg-reject/20"
                                                >
                                                  <Trash2 size={14} />
                                                  Delete
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <form
                                      ref={testCaseFormRef}
                                      onSubmit={(event) => handleSaveTestCase(event, problemId)}
                                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                    >
                                      <h4 className="mb-4 text-sm font-semibold text-paper">
                                        {editingTestCaseId != null
                                          ? `Editing test case #${editingTestCaseId}`
                                          : "Add a test case"}
                                      </h4>
                                      <div className="grid gap-4 lg:grid-cols-2">
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-paper/80" htmlFor={`test-input-${problemId}`}>
                                            Input
                                          </label>
                                          <textarea
                                            id={`test-input-${problemId}`}
                                            rows="4"
                                            value={testCaseDraft.input}
                                            onChange={(event) => setTestCaseDraft((current) => ({ ...current, input: event.target.value }))}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-paper/80" htmlFor={`test-output-${problemId}`}>
                                            Expected Output
                                          </label>
                                          <textarea
                                            id={`test-output-${problemId}`}
                                            rows="4"
                                            value={testCaseDraft.expectedOutput}
                                            onChange={(event) => setTestCaseDraft((current) => ({ ...current, expectedOutput: event.target.value }))}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-paper outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
                                          />
                                        </div>
                                      </div>

                                      <div className="mt-4 flex flex-wrap items-center gap-4">
                                        <label className="inline-flex items-center gap-2 text-sm text-paper/80">
                                          <input
                                            type="checkbox"
                                            checked={testCaseDraft.isSample}
                                            onChange={(event) => setTestCaseDraft((current) => ({ ...current, isSample: event.target.checked }))}
                                            className="h-4 w-4 rounded border-white/10 bg-white/5 text-signal focus:ring-signal/20"
                                          />
                                          Sample Test Case
                                        </label>
                                        <button
                                          type="submit"
                                          disabled={addingTestCase}
                                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2 text-sm font-medium text-ink transition hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                          {editingTestCaseId ? <Pencil size={16} /> : <Plus size={16} />}
                                          {editingTestCaseId ? "Save Changes" : "Add New Test Case"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={resetTestCaseForm}
                                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-paper transition hover:bg-white/10"
                                        >
                                          <X size={16} />
                                          {editingTestCaseId != null ? "Cancel Edit" : "Clear"}
                                        </button>
                                      </div>

                                      {testCaseFormError ? (
                                        <div className="mt-4 rounded-xl border border-reject/30 bg-reject/10 px-4 py-3 text-sm text-reject">
                                          {testCaseFormError}
                                        </div>
                                      ) : null}
                                    </form>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 lg:hidden">
              {problems.map((problem) => {
                const problemId = problem?.id ?? "";
                const tags = normalizeTags(problem?.tags);
                const timeLimit = problem?.timeLimit ?? problem?.time_limit ?? 1000;
                const memoryLimit = problem?.memoryLimit ?? problem?.memory_limit ?? 256;

                return (
                  <div key={problemId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">{problemId}</p>
                        <h3 className="mt-1 text-base font-semibold text-paper">{problem?.title ?? "Untitled Problem"}</h3>
                      </div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getDifficultyBadgeClasses(problem?.difficulty ?? "Unknown")}`}>
                        {problem?.difficulty ?? "Unknown"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.length > 0 ? (
                        tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-paper/70">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-paper/40">No tags</span>
                      )}
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-paper/70 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Time limit: {timeLimit} ms</div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Memory limit: {memoryLimit} MB</div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleViewProblem(problem)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-paper/80"> <Eye size={14}/>View</button>
                      <button type="button" onClick={() => handleEditProblem(problem)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-paper/80"> <Pencil size={14}/>Edit</button>
                      <button type="button" onClick={() => setDeleteTarget(problem)} className="inline-flex items-center gap-2 rounded-lg border border-reject/30 bg-reject/10 px-3 py-2 text-xs font-medium text-reject"> <Trash2 size={14}/>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {previewProblem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-signal">
                  <Eye size={14} />
                  Problem preview
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-paper">{previewProblem.title || "Untitled Problem"}</h2>
              </div>
              <button type="button" onClick={() => setPreviewProblem(null)} className="rounded-full border border-white/10 bg-white/5 p-2 text-paper/70 transition hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getDifficultyBadgeClasses(previewProblem.difficulty ?? "Unknown")}`}>
                  {previewProblem.difficulty ?? "Unknown"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-paper/60">
                  {previewProblem.timeLimit ?? 1000} ms / {previewProblem.memoryLimit ?? 256} MB
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-paper/60">
                  {normalizeTags(previewProblem.tags).join(", ") || "General"}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-paper">Problem Statement</h3>
                <p className="whitespace-pre-wrap text-sm leading-7 text-paper/80">
                  {previewProblem.description || "No problem statement available."}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-paper/40">Input Format</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-paper/80">
                    {previewProblem.inputFormat || "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-paper/40">Output Format</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-paper/80">
                    {previewProblem.outputFormat || "-"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-paper/40">Constraints</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-paper/80">
                  {previewProblem.constraints || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-paper/40">Sample Test Cases</h3>
                <div className="mt-3 space-y-3">
                  {(previewProblem.testCases ?? []).filter((testCase) => testCase.isSample).length === 0 ? (
                    <p className="text-sm text-paper/60">No sample cases yet.</p>
                  ) : (
                    (previewProblem.testCases ?? [])
                      .filter((testCase) => testCase.isSample)
                      .map((testCase) => (
                        <div key={testCase.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">Input</p>
                              <pre className="mt-2 whitespace-pre-wrap text-sm text-paper/80">{testCase.input || "-"}</pre>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">Expected Output</p>
                              <pre className="mt-2 whitespace-pre-wrap text-sm text-paper/80">{testCase.expectedOutput || "-"}</pre>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-reject/30 bg-reject/10 p-2 text-reject">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-paper">Delete this problem?</h3>
                <p className="mt-1 text-sm text-paper/60">This action cannot be undone.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleDeleteProblem(deleteTarget)}
                className="inline-flex items-center gap-2 rounded-xl bg-reject px-4 py-2 text-sm font-medium text-white transition hover:bg-reject/80"
              >
                <Trash2 size={16} />
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-paper transition hover:bg-white/10"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AdminProblems;
