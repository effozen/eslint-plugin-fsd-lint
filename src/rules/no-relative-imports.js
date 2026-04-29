/**
 * @fileoverview Prevents relative imports between slices. All imports should use absolute paths with aliases.
 */

import path from "path";
import { mergeConfig } from "../utils/config-utils.js";
import {
  extractLayerFromPath,
  extractSliceFromPath,
  getLayerPattern,
  isRelativePath,
  isTestFile,
  normalizePath,
} from "../utils/path-utils.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevents relative imports between slices. Use absolute paths with aliases instead.",
      recommended: true,
    },
    messages: {
      noRelativeImport:
        "🚨 Relative imports are not allowed. Use absolute imports with aliases instead.",
    },
    schema: [
      {
        type: "object",
        properties: {
          rootPath: { type: "string" },
          tsconfigPath: { type: "string" },
          alias: {
            oneOf: [
              { type: "string" },
              {
                type: "object",
                properties: {
                  value: { type: "string" },
                  withSlash: { type: "boolean" },
                },
                required: ["value"],
                additionalProperties: false,
              },
            ],
          },
          layers: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                priority: { type: "number" },
                allowedToImport: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              additionalProperties: false,
            },
          },
          folderPattern: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
              regex: { type: "string" },
              extractionGroup: { type: "number" },
            },
            additionalProperties: false,
          },
          testFilesPatterns: {
            type: "array",
            items: { type: "string" },
          },
          ignoreImportPatterns: {
            type: "array",
            items: { type: "string" },
          },
          allowTypeImports: {
            type: "boolean",
            description: "Allow relative imports for type-only imports",
          },
          allowSameSlice: {
            type: "boolean",
            description: "Allow relative imports within the same slice",
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    // Merge user config with default config
    const options = context.options[0] || {};
    const config = mergeConfig(options);

    // Allow type imports if configured
    const allowTypeImports = options.allowTypeImports || false;

    // Allow same slice imports if configured (default: true)
    const allowSameSlice =
      options.allowSameSlice !== undefined ? options.allowSameSlice : true;

    // Helper function to check if import is within the same slice
    function isSameSlice(importPath, currentFilePath) {
      if (!allowSameSlice) return false;

      const normalizedCurrentPath = normalizePath(currentFilePath);
      // Get the base directory of the current file
      const currentDir = path.posix.dirname(normalizedCurrentPath);
      // Resolve the import path relative to the current file
      const resolvedImportPath = path.posix.normalize(
        path.posix.resolve(currentDir, importPath),
      );

      // Layers that don't have slices (single-layer modules)
      const singleLayerModules = ["app", "shared"];

      // Find layer and slice from current file path
      const currentLayer = extractLayerFromPath(normalizedCurrentPath, config);
      const currentSlice = extractSliceFromPath(normalizedCurrentPath, config);

      // If we couldn't find a layer, we can't determine if it's same slice
      if (!currentLayer) return false;

      // For single-layer modules (app, shared), any import within the layer is allowed
      if (singleLayerModules.includes(currentLayer)) {
        return (
          extractLayerFromPath(resolvedImportPath, config) === currentLayer
        );
      }

      // Find layer and slice from resolved import path
      const importLayer = extractLayerFromPath(resolvedImportPath, config);
      const importSlice = extractSliceFromPath(resolvedImportPath, config);

      // If we couldn't find a layer in the import, it might be within the same slice
      if (!importLayer) {
        const currentLayerPattern = getLayerPattern(currentLayer, config);

        // Check if the resolved path is still within the current layer/slice structure
        if (currentSlice) {
          return resolvedImportPath.includes(
            `/${currentLayerPattern}/${currentSlice}/`,
          );
        } else {
          // For single-layer modules without slices
          return resolvedImportPath.includes(`/${currentLayerPattern}/`);
        }
      }

      // For single-layer modules, just check if layers match
      if (
        singleLayerModules.includes(currentLayer) ||
        singleLayerModules.includes(importLayer)
      ) {
        return currentLayer === importLayer;
      }

      // Check if both layer and slice match
      return currentLayer === importLayer && currentSlice === importSlice;
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Skip if not a relative import
        if (!isRelativePath(importPath)) {
          return;
        }

        // Skip test files
        if (isTestFile(context.filename, config.testFilesPatterns)) {
          return;
        }

        // Check for ignored patterns
        const isIgnored = config.ignoreImportPatterns.some((pattern) => {
          const regex = new RegExp(pattern);
          return regex.test(importPath);
        });

        if (isIgnored) {
          return;
        }

        // Skip type-only imports if configured
        if (allowTypeImports && node.importKind === "type") {
          return;
        }

        // Skip same slice imports if configured
        if (allowSameSlice && isSameSlice(importPath, context.filename)) {
          return;
        }

        context.report({
          node,
          messageId: "noRelativeImport",
        });
      },
      CallExpression(node) {
        // Handle dynamic imports
        if (node.callee.type === "Import") {
          const importPath = node.arguments[0].value;

          // Skip if not a relative import
          if (!isRelativePath(importPath)) {
            return;
          }

          // Skip test files
          if (isTestFile(context.filename, config.testFilesPatterns)) {
            return;
          }

          // Check for ignored patterns
          const isIgnored = config.ignoreImportPatterns.some((pattern) => {
            const regex = new RegExp(pattern);
            return regex.test(importPath);
          });

          if (isIgnored) {
            return;
          }

          // For dynamic imports, we can't check if it's a type import
          // as that information is not available at parse time

          // Skip same slice imports if configured
          if (allowSameSlice && isSameSlice(importPath, context.filename)) {
            return;
          }

          context.report({
            node,
            messageId: "noRelativeImport",
          });
        }
      },
    };
  },
};
