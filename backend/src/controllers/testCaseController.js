const {
  createTestCase,
  getTestCasesByProblemId,
  updateTestCase,
  deleteTestCase,
} = require("../models/testCaseModel");

const getTestCasesHandler = async (req, res) => {
  try {
    const testCases = await getTestCasesByProblemId(
      req.params.id
    );

    res.status(200).json({
      success: true,
      testCases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTestCaseHandler = async (req, res) => {
  try {
    const { input, expectedOutput, isSample = false } = req.body;

    if (typeof input !== "string" || typeof expectedOutput !== "string") {
      return res.status(400).json({
        success: false,
        message: "Input and expected output are required",
      });
    }

    const testCase = await updateTestCase(
      req.params.id,
      req.params.testCaseId,
      input,
      expectedOutput,
      Boolean(isSample)
    );

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: "Test case not found",
      });
    }

    return res.status(200).json({
      success: true,
      testCase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTestCaseHandler = async (req, res) => {
  try {
    const testCase = await deleteTestCase(
      req.params.id,
      req.params.testCaseId
    );

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: "Test case not found",
      });
    }

    return res.status(200).json({
      success: true,
      testCase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createTestCaseHandler = async (
  req,
  res
) => {
  try {
    const {
      input,
      expectedOutput,
      isSample,
    } = req.body;

    const testCase =
      await createTestCase(
        req.params.id,
        input,
        expectedOutput,
        isSample || false
      );

    res.status(201).json({
      success: true,
      testCase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTestCasesHandler,
  createTestCaseHandler,
  updateTestCaseHandler,
  deleteTestCaseHandler,
};
