const {
  createSubmission, getAllSubmissions,getSubmissionsByUserId,getSubmissionById,
} = require("../models/submissionModel");
const submissionQueue = require(
  "../queues/submissionQueue"
);
const createSubmissionHandler = async (
  req,
  res
) => {
  try {
    const {
      problemId,
      language,
      code,
    } = req.body;

    if (
      !problemId ||
      !language ||
      !code
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const submission =
      await createSubmission(
        req.user.id,
        problemId,
        language,
        code
      );
await submissionQueue.add(
  "judge",
  {
    submissionId: submission.id,
  }
);
    res.status(201).json({
      success: true,
      submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllSubmissionsHandler = async (
  req,
  res
) => {
  try {
    const submissions =
      await getAllSubmissions();

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getMySubmissionsHandler = async (
  req,
  res
) => {
  try {
    const submissions =
      await getSubmissionsByUserId(
        req.user.id
      );

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getSubmissionByIdHandler = async (
  req,
  res
) => {
  try {
    const submission =
      await getSubmissionById(
        req.params.id
      );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (
      submission.user_id !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this submission",
      });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createSubmissionHandler,getAllSubmissionsHandler,getMySubmissionsHandler, getSubmissionByIdHandler,
};
