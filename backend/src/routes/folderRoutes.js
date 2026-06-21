const express = require("express");

const {
  createFolder,
  getRepositoryFolders,
  updateFolder,
  deleteFolder,
} = require("../controllers/folderController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:repositoryId", protect, createFolder);

router.get("/:repositoryId", protect, getRepositoryFolders);

router.put("/:folderId", protect, updateFolder);

router.delete("/:folderId", protect, deleteFolder);

module.exports = router;