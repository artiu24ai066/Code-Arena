const express = require("express");
const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);
const adminMiddleware = require(
  "../middleware/adminMiddleware"
);

const {
  createProblemHandler,
  getAllProblemsHandler,
  getProblemByIdHandler,
  updateProblemHandler,
  deleteProblemHandler,
} = require("../controllers/problemController");
const {
  getTestCasesHandler,
  createTestCaseHandler,
  updateTestCaseHandler,
  deleteTestCaseHandler,
} = require("../controllers/testCaseController");
router.get(
  "/",
  getAllProblemsHandler
);
router.get(
  "/:id",
  getProblemByIdHandler
);
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createProblemHandler
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateProblemHandler
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProblemHandler
);
router.get(
  "/:id/testcases",
  authMiddleware,
  adminMiddleware,
  getTestCasesHandler
);
router.post(
  "/:id/testcases",
  authMiddleware,
  adminMiddleware,
  createTestCaseHandler
);
router.put(
  "/:id/testcases/:testCaseId",
  authMiddleware,
  adminMiddleware,
  updateTestCaseHandler
);
router.delete(
  "/:id/testcases/:testCaseId",
  authMiddleware,
  adminMiddleware,
  deleteTestCaseHandler
);

module.exports = router;
