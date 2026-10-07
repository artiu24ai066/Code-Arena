const express = require("express");
const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);
const adminMiddleware = require(
  "../middleware/adminMiddleware"
);

const {
  createSubmissionHandler, getAllSubmissionsHandler, getMySubmissionsHandler, getSubmissionByIdHandler,
} = require("../controllers/submissionController");
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getAllSubmissionsHandler
);
router.get(
  "/mine",
  authMiddleware,
  getMySubmissionsHandler
);
router.get(
  "/:id",
  authMiddleware,
  getSubmissionByIdHandler
);
router.post(
  "/",
  authMiddleware,
  createSubmissionHandler
);

module.exports = router;
