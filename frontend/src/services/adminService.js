import apiClient from "./apiClient.js";

export async function getStats() {
  const response = await apiClient.get("/stats");
  return response.data.stats;
}

export async function getAllUsers() {
  const response = await apiClient.get("/users");
  return response.data.users;
}

export async function getAllSubmissionsAdmin() {
  const response = await apiClient.get("/submissions");
  return response.data.submissions;
}

export async function updateProblem(id, title, description, difficulty, metadata = {}) {
  const response = await apiClient.put(`/problems/${id}`, {
    title,
    description,
    difficulty,
    ...metadata,
  });

  return response.data.problem;
}

export async function deleteProblem(id) {
  const response = await apiClient.delete(`/problems/${id}`);
  return response.data;
}

export async function createProblem(title, description, difficulty, metadata = {}) {
  const response = await apiClient.post("/problems", {
    title,
    description,
    difficulty,
    ...metadata,
  });

  return response.data.problem;
}

export async function getTestCases(problemId) {
  const response = await apiClient.get(`/problems/${problemId}/testcases`);
  return response.data.testCases;
}

export async function createTestCase(problemId, input, expectedOutput, isSample) {
  const response = await apiClient.post(`/problems/${problemId}/testcases`, {
    input,
    expectedOutput,
    isSample,
  });

  return response.data.testCase;
}

export async function updateTestCase(problemId, testCaseId, input, expectedOutput, isSample) {
  const response = await apiClient.put(
    `/problems/${problemId}/testcases/${testCaseId}`,
    { input, expectedOutput, isSample }
  );

  return response.data.testCase;
}

export async function deleteTestCase(problemId, testCaseId) {
  const response = await apiClient.delete(
    `/problems/${problemId}/testcases/${testCaseId}`
  );

  return response.data.testCase;
}