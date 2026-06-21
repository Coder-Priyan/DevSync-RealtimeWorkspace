// routes/repositoryRoutes.js
const express = require('express');
const {
  createRepository,
  getUserRepositories,
  getRepositoryById,
  updateRepository,
  deleteRepository,
  addCollaborator,
  getCollaborators,
  removeCollaborator,
} = require("../controllers/repositoryController");
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route - create a new repository
router.post('/', protect, createRepository);
router.get("/", protect, getUserRepositories);
router.get("/:id", protect, getRepositoryById);
router.put("/:id", protect, updateRepository);
router.post("/:id/collaborators", protect, addCollaborator);
router.get("/:id/collaborators", protect, getCollaborators);
router.delete("/:id/collaborators/:userId", protect, removeCollaborator);

module.exports = router;