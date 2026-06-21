// controllers/folderController.js
const Folder = require('../models/Folder');
const Repository = require('../models/Repository');

/**
 * Create a new folder in a repository.
 * User must be repository owner or collaborator.
 */
const createFolder = async (req, res) => {
  try {
    const { repositoryId } = req.params;
    const { name, parentFolder } = req.body;

    // 4. Validate folder name
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required',
      });
    }

    // 1. Find repository by ID
    const repository = await Repository.findById(repositoryId);

    // 2. If repository not found
    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    // 3. Check authorization (owner or collaborator)
    const isOwner = repository.owner.toString() === req.user._id.toString();
    const isCollaborator = repository.collaborators.some(
      (collabId) => collabId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // If parentFolder is provided, verify it exists and belongs to the same repository
    if (parentFolder) {
      const parent = await Folder.findById(parentFolder);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found',
        });
      }
      if (parent.repository.toString() !== repositoryId) {
        return res.status(400).json({
          success: false,
          message: 'Parent folder does not belong to this repository',
        });
      }
    }

    // 5. Create folder
    const folder = await Folder.create({
      name,
      repository: repositoryId,
      parentFolder: parentFolder || null,
      createdBy: req.user._id,
    });

    // 6. Return success response
    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder,
    });
  } catch (error) {
    console.error('Create folder error:', error.message);

    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating folder',
    });
  }
};

const getRepositoryFolders = async (req, res) => {
  try {
    const { repositoryId } = req.params;

    // 1. Find repository by ID
    const repository = await Repository.findById(repositoryId);

    // 2. If repository not found
    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found',
      });
    }

    // 3. Check authorization (owner or collaborator)
    const isOwner = repository.owner.toString() === req.user._id.toString();
    const isCollaborator = repository.collaborators.some(
      (collabId) => collabId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // 4. Find all folders where repository equals repositoryId
    const folders = await Folder.find({ repository: repositoryId })
      .sort({ createdAt: -1 }) // 5. Sort by newest first
      .populate('createdBy', 'username email') // 6. Populate createdBy
      .populate('parentFolder', 'name'); // Optionally populate parent folder info

    // 7. Return success response
    res.status(200).json({
      success: true,
      count: folders.length,
      folders,
    });
  } catch (error) {
    console.error('Get repository folders error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching folders',
    });
  }
};

const updateFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { name } = req.body;

    // 5. Validate name
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required',
      });
    }

    // 1. Find folder by ID and populate repository
    const folder = await Folder.findById(folderId).populate('repository');

    // 3. If folder not found
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found',
      });
    }

    // 4. Check authorization (owner or collaborator of the repository)
    const repository = folder.repository;
    const isOwner = repository.owner.toString() === req.user._id.toString();
    const isCollaborator = repository.collaborators.some(
      (collabId) => collabId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // 6. Update folder name
    folder.name = name;

    // 7. Save folder
    await folder.save();

    // 8. Return success response
    res.status(200).json({
      success: true,
      message: 'Folder updated successfully',
      folder,
    });
  } catch (error) {
    console.error('Update folder error:', error.message);

    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Folder not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating folder',
    });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    // 1. Find folder by ID and populate repository
    const folder = await Folder.findById(folderId).populate('repository');

    // 3. If folder not found
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found',
      });
    }

    // 4. Check authorization (owner or collaborator of the repository)
    const repository = folder.repository;
    const isOwner = repository.owner.toString() === req.user._id.toString();
    const isCollaborator = repository.collaborators.some(
      (collabId) => collabId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // 5. Delete folder
    await folder.deleteOne();

    // 6. Return success response
    res.status(200).json({
      success: true,
      message: 'Folder deleted successfully',
    });
  } catch (error) {
    console.error('Delete folder error:', error.message);

    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Folder not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting folder',
    });
  }
};

// Update module.exports to include deleteFolder
module.exports = {
  createFolder,
  getRepositoryFolders,
  updateFolder,
  deleteFolder,
};