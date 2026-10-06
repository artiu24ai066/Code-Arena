const {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require("../models/problemModel");

const createProblemHandler = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags = [],
      timeLimit = 1000,
      memoryLimit = 256,
      inputFormat = "",
      outputFormat = "",
      constraints = "",
      sampleExplanation = "",
      status = "draft",
    } = req.body;

    if (
      !title ||
      !description ||
      !difficulty
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    const problem = await createProblem(
      title,
      description,
      difficulty,
      req.user.id,
      {
        tags,
        timeLimit,
        memoryLimit,
        inputFormat,
        outputFormat,
        constraints,
        sampleExplanation,
        status,
      }
    );

    res.status(201).json({
      success: true,
      problem,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllProblemsHandler = async (
  req,
  res
) => {
  try {
    const problems =
      await getAllProblems();

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getProblemByIdHandler = async (
  req,
  res
) => {
  try {
    const problem = await getProblemById(
      req.params.id
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateProblemHandler = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags = [],
      timeLimit = 1000,
      memoryLimit = 256,
      inputFormat = "",
      outputFormat = "",
      constraints = "",
      sampleExplanation = "",
      status = "draft",
    } = req.body;

    if (
      !title ||
      !description ||
      !difficulty
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const problem = await updateProblem(
      req.params.id,
      title,
      description,
      difficulty,
      {
        tags,
        timeLimit,
        memoryLimit,
        inputFormat,
        outputFormat,
        constraints,
        sampleExplanation,
        status,
      }
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteProblemHandler = async (
  req,
  res
) => {
  try {
    const problem = await deleteProblem(
      req.params.id
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem deleted",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createProblemHandler,
  getAllProblemsHandler,
  getProblemByIdHandler,
  updateProblemHandler,
  deleteProblemHandler,
};
