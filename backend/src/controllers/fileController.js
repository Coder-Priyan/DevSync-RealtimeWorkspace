// controllers/fileController.js
const File = require('../models/File');
const Repository = require('../models/Repository');

/**
 * Create a new file in a repository.
 * User must be repository owner or collaborator.
 */
const createFile = async (req, res) => {
  try {
    const { repositoryId } = req.params;
    const { name, content } = req.body;

    // Validate file name
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'File name is required',
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

    // 4. Create file
    const file = await File.create({
      name,
      content: content || '',
      repository: repository._id,
      createdBy: req.user._id,
    });

    // 5. Return success response
    res.status(201).json({
      success: true,
      message: 'File created successfully',
      file,
    });
  } catch (error) {
    console.error('Create file error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating file',
    });
  }
};

const getRepositoryFiles = async (req, res) => {
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

    // 4. Find all files where repository equals repositoryId
    const files = await File.find({ repository: repositoryId })
      .sort({ createdAt: -1 }) // 5. Sort by newest first
      .populate('createdBy', 'username email');

    // 6. Return success response
    res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    console.error('Get repository files error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching files',
    });
  }
};

const getFileById = async (req, res) => {
  try {
    const { fileId } = req.params;

    // 1. Find file by ID and populate references
    const file = await File.findById(fileId)
      .populate('createdBy', 'username email')
      .populate('repository', 'name owner collaborators');

    // 3. If file not found
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // 4. Check authorization (owner or collaborator of the repository)
    const repository = file.repository;
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

    // 5. Return success response
    res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    console.error('Get file by ID error:', error.message);

    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching file',
    });
  }
};

// controllers/fileController.js (add this function to existing exports)

/**
 * Update a file's name and/or content.
 * User must be repository owner or collaborator.
 */
const updateFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { name, content } = req.body;

    // 1. Find file by ID and populate repository
    const file = await File.findById(fileId).populate('repository');

    // 3. If file not found
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // 4. Check authorization (owner or collaborator of the repository)
    const repository = file.repository;
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

    // 5. Update fields if provided
    if (name !== undefined) {
      file.name = name;
    }
    if (content !== undefined) {
      file.content = content;
    }

    // 6. Save file
    await file.save();

    // 7. Return success response
    res.status(200).json({
      success: true,
      message: 'File updated successfully',
      file,
    });
  } catch (error) {
    console.error('Update file error:', error.message);

    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating file',
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // 1. Find file by ID and populate repository
    const file = await File.findById(fileId).populate('repository');

    // 3. If file not found
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // 4. Check authorization (owner or collaborator of the repository)
    const repository = file.repository;
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

    // 5. Delete file
    await file.deleteOne();

    // 6. Return success response
    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error.message);

    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting file',
    });
  }
};

// Update module.exports to include deleteFile
module.exports = {
  createFile,
  getRepositoryFiles,
  getFileById,
  updateFile,
  deleteFile,
};