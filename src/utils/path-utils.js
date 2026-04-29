/**
 * @fileoverview Path processing utility functions
 */

import fs from "fs";
import path from "path";

// Path cache
const pathCache = new Map();
const tsConfigCache = new Map();
const importResolveCache = new Map();

const DEFAULT_RESOLVE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mts",
  ".cts",
  ".mjs",
  ".cjs",
  ".json",
];

/**
 * Normalize file path (compatible with all operating systems)
 * @param {string} filePath - File path to normalize
 * @return {string} - Normalized path
 */
export function normalizePath(filePath) {
  if (pathCache.has(filePath)) {
    return pathCache.get(filePath);
  }

  // Convert Windows backslashes to forward slashes
  let normalized = filePath.replace(/\\/g, "/");

  // Remove duplicate slashes
  normalized = normalized.replace(/\/+/g, "/");

  // Remove trailing slash
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  // Cache result
  pathCache.set(filePath, normalized);
  return normalized;
}

/**
 * Extract path segments
 * @param {string} filePath - Path to analyze
 * @return {string[]} - Array of path segments
 */
export function getPathSegments(filePath) {
  const normalized = normalizePath(filePath);
  return normalized.split("/").filter((segment) => segment.length > 0);
}

/**
 * Check if path is relative
 * @param {string} filePath - Path to check
 * @return {boolean} - Whether the path is relative
 */
export function isRelativePath(filePath) {
  return (
    filePath.startsWith("./") ||
    filePath.startsWith("../") ||
    filePath === "." ||
    filePath === ".."
  );
}

function toAbsolutePath(filePath) {
  const normalizedPath = normalizePath(filePath);

  if (path.isAbsolute(normalizedPath) || /^[A-Za-z]:\//.test(normalizedPath)) {
    return normalizedPath;
  }

  return normalizePath(path.resolve(normalizedPath));
}

/**
 * Extract relative path from source root
 * @param {string} filePath - File path
 * @param {string} rootPattern - Root directory pattern (default: '/src/')
 * @return {string|null} - Extracted relative path or null
 */
export function getRelativePathFromRoot(filePath, rootPattern = "/src/") {
  const normalizedPath = normalizePath(filePath);
  const rootIndex = normalizedPath.indexOf(rootPattern);

  if (rootIndex === -1) return null;

  return normalizedPath.substring(rootIndex + rootPattern.length);
}

function getSourceRootFromPath(filePath, rootPattern = "/src/") {
  const normalizedPath = normalizePath(filePath);
  const normalizedRootPattern = normalizePath(rootPattern);
  const rootIndex = normalizedPath.indexOf(normalizedRootPattern);

  if (rootIndex !== -1) {
    return normalizePath(
      normalizedPath.substring(0, rootIndex + normalizedRootPattern.length),
    );
  }

  return null;
}

/**
 * Get the configured folder name for a layer.
 * @param {string} layer - Layer key
 * @param {Object} config - Configuration object
 * @return {string} - Configured layer folder pattern
 */
export function getLayerPattern(layer, config) {
  return config.layers[layer]?.pattern || layer;
}

/**
 * Find a configured layer by a path segment.
 * @param {string} segment - Path segment to match
 * @param {Object} config - Configuration object
 * @return {string|null} - Matching layer key or null
 */
export function findLayerBySegment(segment, config) {
  return (
    Object.keys(config.layers).find(
      (layer) =>
        layer === segment || getLayerPattern(layer, config) === segment,
    ) || null
  );
}

/**
 * Remove the configured import alias from an import path.
 * @param {string} importPath - Path from import statement
 * @param {Object} config - Configuration object
 * @return {string|null} - Path after alias or null when alias does not match
 */
export function getImportPathWithoutAlias(importPath, config) {
  if (isRelativePath(importPath)) {
    return null;
  }

  const aliasConfig = config.alias;
  const aliasValue = normalizePath(aliasConfig.value);
  const withSlash = aliasConfig.withSlash;
  const normalizedPath = normalizePath(importPath);

  const aliasPatterns = withSlash
    ? [`${aliasValue}/`]
    : [aliasValue, `${aliasValue}/`];

  const matchingPattern = aliasPatterns.find((pattern) =>
    normalizedPath.startsWith(pattern),
  );

  if (!matchingPattern) {
    return null;
  }

  let pathWithoutAlias = normalizedPath.substring(matchingPattern.length);

  if (pathWithoutAlias.startsWith("/")) {
    pathWithoutAlias = pathWithoutAlias.substring(1);
  }

  return pathWithoutAlias;
}

/**
 * Extract layer from import path considering alias
 * @param {string} importPath - Path from import statement
 * @param {Object} config - Configuration object
 * @return {string|null} - Extracted layer or null
 */
export function extractLayerFromImportPath(importPath, config) {
  const pathWithoutAlias = getImportPathWithoutAlias(importPath, config);
  if (!pathWithoutAlias) return null;

  // First path segment is the layer
  const firstSegment = pathWithoutAlias.split("/")[0];

  // Check if it matches any layer
  return findLayerBySegment(firstSegment, config);
}

/**
 * Extract slice info from an aliased import path.
 * @param {string} importPath - Path from import statement
 * @param {Object} config - Configuration object
 * @return {string|null} - Extracted slice name or null
 */
export function extractSliceFromImportPath(importPath, config) {
  const pathWithoutAlias = getImportPathWithoutAlias(importPath, config);
  if (!pathWithoutAlias) return null;

  const segments = pathWithoutAlias.split("/");
  if (segments.length < 2) return null;

  const layer = findLayerBySegment(segments[0], config);
  if (!layer) return null;

  return segments[1];
}

/**
 * Extract FSD layer info from file path
 * @param {string} filePath - File path to analyze
 * @param {Object} config - Layer configuration and folder pattern options
 * @return {string|null} - Extracted layer name or null
 */
export function extractLayerFromPath(filePath, config) {
  const relativePath = getRelativePathFromRoot(filePath, config.rootPath);
  if (!relativePath) return null;

  const firstDir = relativePath.split("/")[0];

  // Handle folder pattern if enabled
  if (config.folderPattern?.enabled) {
    const regex = new RegExp(config.folderPattern.regex);
    const match = firstDir.match(regex);

    if (match && match[config.folderPattern.extractionGroup]) {
      const extracted = match[config.folderPattern.extractionGroup];

      // Check if extracted name matches any layer
      return Object.keys(config.layers).find(
        (layer) =>
          config.layers[layer].pattern === extracted || layer === extracted,
      );
    }
  }

  // Default layer matching if no folder pattern or no match
  return findLayerBySegment(firstDir, config);
}

/**
 * Extract slice info from file path
 * @param {string} filePath - File path to analyze
 * @param {Object} config - Configuration options
 * @return {string|null} - Extracted slice name or null
 */
export function extractSliceFromPath(filePath, config) {
  const relativePath = getRelativePathFromRoot(filePath, config?.rootPath);
  if (!relativePath) return null;

  const segments = relativePath.split("/");
  if (segments.length < 2) return null;

  // Second segment is typically the slice
  return segments[1];
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function directoryExists(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

function resolveFileCandidate(candidatePath) {
  const normalizedCandidate = normalizePath(candidatePath);

  if (fileExists(normalizedCandidate)) {
    return normalizedCandidate;
  }

  if (!path.extname(normalizedCandidate)) {
    for (const extension of DEFAULT_RESOLVE_EXTENSIONS) {
      const withExtension = `${normalizedCandidate}${extension}`;
      if (fileExists(withExtension)) {
        return normalizePath(withExtension);
      }
    }
  }

  if (directoryExists(normalizedCandidate)) {
    for (const extension of DEFAULT_RESOLVE_EXTENSIONS) {
      const indexPath = path.join(normalizedCandidate, `index${extension}`);
      if (fileExists(indexPath)) {
        return normalizePath(indexPath);
      }
    }
  }

  for (const extension of DEFAULT_RESOLVE_EXTENSIONS) {
    const indexPath = path.join(normalizedCandidate, `index${extension}`);
    if (fileExists(indexPath)) {
      return normalizePath(indexPath);
    }
  }

  return null;
}

function stripJsonComments(json) {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < json.length; index++) {
    const char = json[index];
    const next = json[index + 1];

    if (inString) {
      result += char;

      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    if (char === "/" && next === "/") {
      while (index < json.length && json[index] !== "\n") {
        index++;
      }
      result += "\n";
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (
        index < json.length &&
        !(json[index] === "*" && json[index + 1] === "/")
      ) {
        index++;
      }
      index++;
      continue;
    }

    result += char;
  }

  return result.replace(/,\s*([}\]])/g, "$1");
}

function parseTsConfig(tsConfigPath) {
  const normalizedPath = normalizePath(tsConfigPath);

  if (tsConfigCache.has(normalizedPath)) {
    return tsConfigCache.get(normalizedPath);
  }

  let parsedConfig = null;

  try {
    const rawConfig = fs.readFileSync(normalizedPath, "utf8");
    const config = JSON.parse(stripJsonComments(rawConfig));
    const compilerOptions = config.compilerOptions || {};
    const configDir = normalizePath(path.dirname(normalizedPath));
    const baseUrl = compilerOptions.baseUrl
      ? normalizePath(path.resolve(configDir, compilerOptions.baseUrl))
      : configDir;

    parsedConfig = {
      path: normalizedPath,
      dir: configDir,
      baseUrl,
      paths: compilerOptions.paths || {},
    };
  } catch {
    parsedConfig = null;
  }

  tsConfigCache.set(normalizedPath, parsedConfig);
  return parsedConfig;
}

function findNearestTsConfig(currentFilePath, config) {
  if (config.tsconfigPath) {
    const explicitPath = normalizePath(path.resolve(config.tsconfigPath));
    return fileExists(explicitPath) ? explicitPath : null;
  }

  let currentDir = path.dirname(toAbsolutePath(currentFilePath));

  while (currentDir && currentDir !== path.dirname(currentDir)) {
    for (const configFileName of ["tsconfig.json", "jsconfig.json"]) {
      const candidatePath = path.join(currentDir, configFileName);
      if (fileExists(candidatePath)) {
        return normalizePath(candidatePath);
      }
    }

    currentDir = path.dirname(currentDir);
  }

  return null;
}

function matchTsConfigPathPattern(importPath, pattern) {
  if (!pattern.includes("*")) {
    return importPath === pattern ? "" : null;
  }

  const [prefix, suffix] = pattern.split("*");

  if (!importPath.startsWith(prefix) || !importPath.endsWith(suffix)) {
    return null;
  }

  return importPath.slice(prefix.length, importPath.length - suffix.length);
}

function resolveWithTsConfigPaths(importPath, currentFilePath, config) {
  const tsConfigPath = findNearestTsConfig(currentFilePath, config);
  if (!tsConfigPath) {
    return null;
  }

  const tsConfig = parseTsConfig(tsConfigPath);
  if (!tsConfig) {
    return null;
  }

  const pathEntries = Object.entries(tsConfig.paths).sort(
    ([leftPattern], [rightPattern]) =>
      rightPattern.replace("*", "").length -
      leftPattern.replace("*", "").length,
  );

  for (const [pattern, targets] of pathEntries) {
    const wildcardMatch = matchTsConfigPathPattern(importPath, pattern);
    if (wildcardMatch === null) {
      continue;
    }

    for (const target of targets) {
      const mappedTarget = target.includes("*")
        ? target.replace("*", wildcardMatch)
        : target;
      const candidatePath = path.resolve(tsConfig.baseUrl, mappedTarget);
      const resolvedPath = resolveFileCandidate(candidatePath);

      if (resolvedPath) {
        return resolvedPath;
      }
    }
  }

  const baseUrlCandidate = path.resolve(tsConfig.baseUrl, importPath);
  return resolveFileCandidate(baseUrlCandidate);
}

function resolveWithConfiguredAlias(importPath, currentFilePath, config) {
  const pathWithoutAlias = getImportPathWithoutAlias(importPath, config);

  if (!pathWithoutAlias) {
    return null;
  }

  const sourceRoot = getSourceRootFromPath(
    toAbsolutePath(currentFilePath),
    config.rootPath,
  );

  if (!sourceRoot) {
    return null;
  }

  return resolveFileCandidate(path.join(sourceRoot, pathWithoutAlias));
}

/**
 * Resolve an import path to a real file when possible.
 * Falls back to null for external packages or unresolved virtual paths.
 * @param {string} importPath - Path from import statement
 * @param {string} currentFilePath - File that contains the import
 * @param {Object} config - Configuration options
 * @return {string|null} - Resolved filesystem path or null
 */
export function resolveImportPath(importPath, currentFilePath, config) {
  if (typeof importPath !== "string") {
    return null;
  }

  const cacheKey = [
    importPath,
    currentFilePath,
    config.rootPath,
    config.tsconfigPath || "",
    config.alias?.value || "",
    config.alias?.withSlash ? "1" : "0",
  ].join("\0");

  if (importResolveCache.has(cacheKey)) {
    return importResolveCache.get(cacheKey);
  }

  let resolvedPath = null;

  if (isRelativePath(importPath)) {
    const currentDir = path.dirname(toAbsolutePath(currentFilePath));
    resolvedPath = resolveFileCandidate(path.resolve(currentDir, importPath));
  } else {
    resolvedPath =
      resolveWithTsConfigPaths(importPath, currentFilePath, config) ||
      resolveWithConfiguredAlias(importPath, currentFilePath, config);
  }

  importResolveCache.set(cacheKey, resolvedPath);
  return resolvedPath;
}

/**
 * Get layer and slice information for an import target.
 * Resolved filesystem paths are preferred, with legacy string parsing as fallback.
 * @param {string} importPath - Path from import statement
 * @param {string} currentFilePath - File that contains the import
 * @param {Object} config - Configuration options
 * @return {{ resolvedPath: string|null, layer: string|null, slice: string|null }}
 */
export function getImportTargetInfo(importPath, currentFilePath, config) {
  const resolvedPath = resolveImportPath(importPath, currentFilePath, config);

  if (resolvedPath) {
    return {
      resolvedPath,
      layer: extractLayerFromPath(resolvedPath, config),
      slice: extractSliceFromPath(resolvedPath, config),
    };
  }

  if (isRelativePath(importPath)) {
    const unresolvedPath = normalizePath(
      path.resolve(path.dirname(toAbsolutePath(currentFilePath)), importPath),
    );

    return {
      resolvedPath: null,
      layer: extractLayerFromPath(unresolvedPath, config),
      slice: extractSliceFromPath(unresolvedPath, config),
    };
  }

  return {
    resolvedPath: null,
    layer: extractLayerFromImportPath(importPath, config),
    slice: extractSliceFromImportPath(importPath, config),
  };
}

function getEntityCrossImportInfoFromSegments(segments, config) {
  if (segments.length < 4 || segments[2] !== "@x") {
    return null;
  }

  const layer = findLayerBySegment(segments[0], config);
  if (layer !== "entities") {
    return null;
  }

  return {
    layer,
    targetSlice: segments[1],
    consumerSlice: segments[3].replace(/\.[^.]+$/, ""),
  };
}

/**
 * Extract FSD Entities @x public API information from an import target.
 * @param {string} importPath - Path from import statement
 * @param {string} currentFilePath - File that contains the import
 * @param {Object} config - Configuration options
 * @return {{ layer: string, targetSlice: string, consumerSlice: string }|null}
 */
export function getEntityCrossImportPublicApiInfo(
  importPath,
  currentFilePath,
  config,
) {
  const resolvedPath = resolveImportPath(importPath, currentFilePath, config);

  if (resolvedPath) {
    const relativePath = getRelativePathFromRoot(resolvedPath, config.rootPath);
    if (relativePath) {
      const resolvedInfo = getEntityCrossImportInfoFromSegments(
        relativePath.split("/").filter(Boolean),
        config,
      );

      if (resolvedInfo) {
        return resolvedInfo;
      }
    }
  }

  const pathWithoutAlias = getImportPathWithoutAlias(importPath, config);
  if (!pathWithoutAlias) {
    return null;
  }

  return getEntityCrossImportInfoFromSegments(
    pathWithoutAlias.split("/").filter(Boolean),
    config,
  );
}

/**
 * Check if file is a test file
 * @param {string} filePath - File path to check
 * @param {string[]} patterns - Array of test file patterns
 * @return {boolean} - Whether it's a test file
 */
export function isTestFile(filePath, patterns) {
  return patterns.some((pattern) => {
    // Support simple wildcard patterns
    const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");

    const regex = new RegExp(regexPattern);
    return regex.test(filePath);
  });
}
