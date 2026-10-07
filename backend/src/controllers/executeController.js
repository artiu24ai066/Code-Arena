const { executeCode } = require("../services/executeService");
const { getProblemById } = require("../models/problemModel");

const executeHandler = async (req, res) => {
  try {
    const {
      problemId,
      language,
      code,
      input = "",
    } = req.body;

    if (!problemId || !language || !code) {
      return res.status(400).json({
        success: false,
        message: "Problem, language, and code are required",
      });
    }

    const problem = await getProblemById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const result = await executeCode(
      code,
      language,
      input,
      problem.memory_limit,
      problem.time_limit
    );

    return res.status(200).json({
      success: true,
      output: result.output,
      executionTime: result.executionTime,
    });
  } catch (error) {
    if (
      error.type === "TIME_LIMIT_EXCEEDED" ||
      error.type === "MEMORY_LIMIT_EXCEEDED" ||
      error.type === "RUNTIME_ERROR" ||
      error.type === "COMPILATION_ERROR"
    ) {
      return res.status(400).json({
        success: false,
        type: error.type,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  executeHandler,
};