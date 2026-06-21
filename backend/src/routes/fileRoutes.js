// routes/fileRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createFile,
  getRepositoryFiles,
  getFileById,
  updateFile,
  deleteFile,
} = require("../controllers/fileController");

const router = express.Router();

// Protected route - create a new file in a repository
router.post("/:repositoryId", protect, createFile);
router.get("/:repositoryId", protect, getRepositoryFiles);
router.get("/single/:fileId", protect, getFileById);
router.put("/:fileId", protect, updateFile);
router.delete("/:fileId", protect, deleteFile);
module.exports = router;