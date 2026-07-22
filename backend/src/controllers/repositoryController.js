// controllers/repositoryController.js 
const Repository = require("../models/Repository");
const User = require("../models/User");

/**
 * Create a new repository.
 * Protected route - requires authentication.
 */
const createRepository = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    // Validate required field
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Repository name is required',
      });
    }

    // Create repository with owner from authenticated user
    const repository = await Repository.create({
      name,
      description: description || '',
      isPublic: isPublic !== undefined ? isPublic : true,
      owner: req.user._id,
      collaborators: [], // start with empty collaborators array
    });

    res.status(201).json({
      success: true,
      message: 'Repository created successfully',
      repository,
    });
  } catch (error) {
    console.error('Create repository error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating repository',
    });
  }
};

const getUserRepositories = async (req, res) => {
  try {
    // Find repositories where owner is the authenticated user
    const repositories = await Repository.find({
      $or: [
        { owner: req.user._id }, // owned by user
        { collaborators: req.user._id }, // or where user is a collaborator
      ],
    })
      .sort({ createdAt: -1 }) // newest first
      .populate('owner', 'username email profileImage'); // optional: populate owner details

    res.status(200).json({
      success: true,
      count: repositories.length,
      repositories,
    });
  } catch (error) {
    console.error('Get user repositories error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching repositories',
    });
  }
};

const getRepositoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find repository by ID and populate owner fields
    const repository = await Repository.findById(id)
      .populate('owner', 'username email'); // populate only username and email

    // If repository not found
    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    res.status(200).json({
      success: true,
      repository,
    });
  } catch (error) {
    console.error('Get repository by ID error:', error.message);
    
    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching repository',
    });
  }
};

const deleteRepository = async (req, res) => {
  try {
    const { id } = req.params;

    // Find repository by ID
    const repository = await Repository.findById(id);

    // Check if repository exists
    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    // Check ownership
    if (repository.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Delete the repository
    await repository.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Repository deleted successfully',
    });
  } catch (error) {
    console.error('Delete repository error:', error.message);

    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting repository',
    });
  }
};

const updateRepository = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;

    // Find repository by ID
    const repository = await Repository.findById(id);

    // If repository not found
    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    // Check if the authenticated user is the owner
    if (repository.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Update fields only if provided
    if (name !== undefined) {
      repository.name = name;
    }
    if (description !== undefined) {
      repository.description = description;
    }
    if (isPublic !== undefined) {
      repository.isPublic = isPublic;
    }

    // Save the updated repository
    await repository.save();

    res.status(200).json({
      success: true,
      message: 'Repository updated successfully',
      repository,
    });
  } catch (error) {
    console.error('Update repository error:', error.message);

    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating repository',
    });
  }
};

const addCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Validate email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // 1. Find repository by ID
    const repository = await Repository.findById(id);

    // 2. If repository not found
    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    // 3. Check ownership
    if (repository.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // 4. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent adding the owner as a collaborator (optional but recommended)
    if (user._id.toString() === repository.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Repository owner cannot be added as a collaborator',
      });
    }

    // 5. Check if user already exists in collaborators array
    if (repository.collaborators.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'User already a collaborator',
      });
    }

    // 6. Push user._id into collaborators
    repository.collaborators.push(user._id);

    // 7. Save repository
    await repository.save();

    // 8. Populate collaborators for response (optional, to show user details)
    await repository.populate('collaborators', 'username email profileImage');

    res.status(200).json({
      success: true,
      message: 'Collaborator added successfully',
      repository,
    });
  } catch (error) {
    console.error('Add collaborator error:', error.message);

    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while adding collaborator',
    });
  }
};

const getCollaborators = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find repository by id and populate collaborators with required fields
    const repository = await Repository.findById(id)
      .populate('collaborators', 'username email profileImage');

    // 3. If repository not found
    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    // 4. Check authorization: owner or collaborator
    const isOwner = repository.owner.toString() === req.user._id.toString();
    const isCollaborator = repository.collaborators.some(
      (collab) => collab._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Success response
    const collaborators = repository.collaborators;
    res.status(200).json({
      success: true,
      count: collaborators.length,
      collaborators,
    });
  } catch (error) {
    console.error('Get collaborators error:', error.message);

    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching collaborators',
    });
  }
};

const removeCollaborator = async (req, res) => {
  try {
    const { id, userId } = req.params;

    // 1. Find repository by ID
    const repository = await Repository.findById(id);

    // 2. If repository not found
    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    // 3. Check ownership
    if (repository.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Prevent removing the owner (though owner is not in collaborators array by default)
    if (userId === repository.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove repository owner',
      });
    }

    // 4. Check if collaborator exists in the array
    const collaboratorIndex = repository.collaborators.findIndex(
      (collabId) => collabId.toString() === userId
    );

    if (collaboratorIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Collaborator not found',
      });
    }

    // 5. Remove collaborator from collaborators array
    repository.collaborators.splice(collaboratorIndex, 1);

    // 6. Save repository
    await repository.save();

    // Optionally populate collaborators for response
    await repository.populate('collaborators', 'username email profileImage');

    res.status(200).json({
      success: true,
      message: 'Collaborator removed successfully',
      repository,
    });
  } catch (error) {
    console.error('Remove collaborator error:', error.message);

    // Handle invalid ObjectId format for either id or userId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Repository or collaborator not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while removing collaborator',
    });
  }
};

// Update module.exports to include removeCollaborator
module.exports = {
  createRepository,
  getUserRepositories,
  getRepositoryById,
  deleteRepository,
  updateRepository,
  addCollaborator,
  getCollaborators,
  removeCollaborator,
};