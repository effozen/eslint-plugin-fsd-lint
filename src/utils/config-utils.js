/**
 * @fileoverview Configuration management utility functions
 */

// Default configuration
export const defaultConfig = {
  // Default alias setting - no slash format as default
  alias: {
    value: "@",
    withSlash: false  // Default to @shared format
  },

  // Layer definitions and priorities
  layers: {
    app: { pattern: "app", priority: 1, allowedToImport: ["processes", "pages", "widgets", "features", "entities", "shared"] },
    processes: { pattern: "processes", priority: 2, allowedToImport: ["pages", "widgets", "features", "entities", "shared"] },
    pages: { pattern: "pages", priority: 3, allowedToImport: ["widgets", "features", "entities", "shared"] },
    widgets: { pattern: "widgets", priority: 4, allowedToImport: ["features", "entities", "shared"] },
    features: { pattern: "features", priority: 5, allowedToImport: ["entities", "shared"] },
    entities: { pattern: "entities", priority: 6, allowedToImport: ["shared"] },
    shared: { pattern: "shared", priority: 7, allowedToImport: [] }
  },

  // Folder naming pattern settings
  folderPattern: {
    enabled: false,
    regex: "^(\\d+_)?(.*)",  // Support for number_ prefix
    extractionGroup: 2  // Regex group number to extract the actual layer name
  },

  // Test files settings
  testFilesPatterns: ["**/*.test.*", "**/*.spec.*", "**/*.stories.*", "**/StoreDecorator.tsx"],

  // Public API settings
  publicApi: {
    enforceForLayers: ["features", "entities", "widgets"],
    fileNames: ["index.ts", "index.tsx", "index.js", "index.jsx"]
  },

  // Exception handling settings
  ignoreImportPatterns: [],

  // Relative path settings
  relativePath: {
    enforceWithinSlice: true,
    allowBetweenSlices: false
  }
};

/**
 * Deep merge user config with default config
 * @param {Object} userConfig - User provided configuration
 * @return {Object} - Merged final configuration
 */
export function mergeConfig(userConfig = {}) {
  // Handle alias
  let alias;
  if (!userConfig.alias) {
    alias = defaultConfig.alias;
  } else if (typeof userConfig.alias === 'string') {
    // Convert string alias to object
    alias = {
      value: userConfig.alias,
      withSlash: userConfig.alias.endsWith('/')
    };
  } else {
    // Merge object alias
    alias = {
      ...defaultConfig.alias,
      ...userConfig.alias
    };
  }

  // Merge layers
  const layers = { ...defaultConfig.layers };
  if (userConfig.layers) {
    for (const [key, value] of Object.entries(userConfig.layers)) {
      if (layers[key]) {
        layers[key] = { ...layers[key], ...value };
      } else {
        layers[key] = value;
      }
    }
  }

  // Merge folder pattern
  const folderPattern = {
    ...defaultConfig.folderPattern,
    ...(userConfig.folderPattern || {})
  };

  // Merge test file patterns
  const testFilesPatterns = userConfig.testFilesPatterns
    ? [...userConfig.testFilesPatterns]
    : [...defaultConfig.testFilesPatterns];

  // Merge public API settings
  const publicApi = {
    ...defaultConfig.publicApi,
    ...(userConfig.publicApi || {}),
    fileNames: [
      ...(defaultConfig.publicApi.fileNames || []),
      ...(userConfig.publicApi?.fileNames || [])
    ]
  };

  // Merge ignore patterns
  const ignoreImportPatterns = [
    ...(defaultConfig.ignoreImportPatterns || []),
    ...(userConfig.ignoreImportPatterns || [])
  ];

  // Merge relative path settings
  const relativePath = {
    ...defaultConfig.relativePath,
    ...(userConfig.relativePath || {})
  };

  // Return final configuration
  return {
    alias,
    layers,
    folderPattern,
    testFilesPatterns,
    publicApi,
    ignoreImportPatterns,
    relativePath
  };
}