/**
 * utils/fileHelpers.js — File and folder display utilities.
 *
 * Pure functions for mapping file metadata to display properties.
 * Used by: FileTree, TreeNode, TabBar, EditorPane.
 * No React dependency.
 */

/**
 * FILE_COLORS — Maps file extension to a display color.
 * These colors approximate the VS Code file icon convention
 * so the DevSync file tree feels familiar to developers.
 */
const FILE_COLORS = {
  // JavaScript / TypeScript
  js:    '#F7DF1E', // JS yellow
  jsx:   '#61DAFB', // React blue
  ts:    '#3178C6', // TS blue
  tsx:   '#61DAFB', // React blue

  // Web
  html:  '#E34C26', // HTML orange
  css:   '#1572B6', // CSS blue
  scss:  '#CC6699', // SCSS pink
  sass:  '#CC6699',
  less:  '#1D365D',

  // Data / Config
  json:  '#CBCB41', // Yellow
  yaml:  '#CC1018',
  yml:   '#CC1018',
  md:    '#519ABA',   // Markdown blue
  mdx:   '#519ABA',

  // Backend
  py:    '#3572A5', // Python blue
  java:  '#B07219', // Java brown
  go:    '#00ADD8', // Go cyan
  rs:    '#DEA584', // Rust orange
  php:   '#777BB4', // PHP purple
  rb:    '#CC342D', // Ruby red

  // Shell
  sh:    '#89E051',
  bash:  '#89E051',

  // Default
  default: '#8B949E', // ds-text-muted — gray for unknown types
}

/**
 * getFileColor — Returns the display color for a given filename.
 *
 * @param {string} filename
 * @returns {string} — hex color
 */
export const getFileColor = (filename = '') => {
  const ext = getFileExtension(filename)
  return FILE_COLORS[ext] ?? FILE_COLORS.default
}

/**
 * getFileExtension — Extracts the extension from a filename.
 * Handles dotfiles and filenames without extensions.
 *
 * @param {string} filename
 * @returns {string} — lowercase extension, or '' if none
 */
export const getFileExtension = (filename = '') => {
  if (!filename) return ''
  if (filename.startsWith('.') && !filename.slice(1).includes('.')) {
    return filename.slice(1).toLowerCase() // '.gitignore' → 'gitignore'
  }
  const parts = filename.split('.')
  if (parts.length < 2) return ''
  return parts.pop().toLowerCase()
}

/**
 * isFolder — Type guard for file tree nodes.
 *
 * @param {object} node — file or folder object from API
 * @returns {boolean}
 */
export const isFolder = (node) => {
  return node && node.type === 'folder'
}

/**
 * buildFileTree — Converts flat arrays of files and folders from the API
 * into a nested tree structure for the FileExplorer component.
 *
 * @param {Array} folders — raw folder documents from API
 * @param {Array} files   — raw file documents from API
 * @returns {Array}       — nested tree nodes, sorted folders first then files
 *
 * This function is used by useFileTree hook (Stage 5).
 * Moving it to utils keeps the hook clean and makes this logic unit-testable.
 */
export const buildFileTree = (folders = [], files = []) => {
  // Index folders by ID for O(1) child lookups
  const folderMap = {}
  folders.forEach((folder) => {
    folderMap[folder._id] = {
      ...folder,
      type:     'folder',
      children: [], // will be populated below
    }
  })

  const rootNodes = []

  // Place each folder under its parent (or at root if no parentFolderId)
  folders.forEach((folder) => {
    const node = folderMap[folder._id]

    const parentId =
      folder.parentFolderId ??
      folder.parentFolder?._id ??
      folder.parentFolder ??
      null
      
    if (parentId && folderMap[parentId]) {
      folderMap[parentId].children.push(node)
  } else {
    rootNodes.push(node)
    }
  })

  // Place each file under its parent folder (or at root)
  files.forEach((file) => {
    const fileNode = { ...file, type: 'file' }

    const folderId = file.folderId ?? file.folder ?? null

    if (folderId && folderMap[folderId]) {
      folderMap[folderId].children.push(fileNode)
    } else {
      rootNodes.push(fileNode)
    }
  })

  // Sort: folders before files, then alphabetically within each group
  const sortNodes = (nodes) => {
    return nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'folder' ? -1 : 1
    })
  }

  // Recursively sort all levels
  const sortTree = (nodes) => {
    const sorted = sortNodes(nodes)
    sorted.forEach((node) => {
      if (node.children) node.children = sortTree(node.children)
    })
    return sorted
  }

  return sortTree(rootNodes)
}