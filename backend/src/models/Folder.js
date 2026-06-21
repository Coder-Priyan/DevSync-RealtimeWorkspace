// models/Folder.js
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;