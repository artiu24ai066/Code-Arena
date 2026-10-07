import apiClient from "./apiClient.js";

export async function executeCode(problemId, language, code, input) {
  const response = await apiClient.post("/execute", {
    problemId,
    language,
    code,
    input,
  });

  return response.data;
}