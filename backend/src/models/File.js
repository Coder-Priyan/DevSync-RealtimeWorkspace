// models/File.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
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

const File = mongoose.model('File', fileSchema);

module.exports = File;