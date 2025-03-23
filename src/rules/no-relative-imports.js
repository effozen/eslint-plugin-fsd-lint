/**
 * @fileoverview Disallows relative imports across different slices in Feature-Sliced Design
 */

import { extractLayerFromPath, extractSliceFromPath, isTestFile, normalizePath, isRelativePath } from '../utils/path-utils.js';
import { mergeConfig } from '../utils/config-utils.js';
import path from 'path';

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallows relative imports across different slices in Feature-Sliced Design.",
      recommended: true,
    },
    messages: {
      noRelativePath:
        "🚨 Relative import '{{ importPath }}' is not allowed across different slices. Use an alias instead."
    },
    schema: [
      {
        type: "object",
        properties: {
          alias: {
            oneOf: [
              { type: "string" },
              {
                type: "object",
                properties: {
                  value: { type: "string" },
                  withSlash: { type: "boolean" }
                },
                required: ["value"],
                additionalProperties: false
              }
            ]
          },
          folderPattern: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
              regex: { type: "string" },
              extractionGroup: { type: "number" }
            },
            additionalProperties: false
          },
          testFilesPatterns: {
            type: "array",
            items: { type: "string" }
          },
          ignoreImportPatterns: {
            type: "array",
            items: { type: "string" }
          },
          allowBetweenSlices: {
            type: "boolean",
            description: "If true, allow relative imports between different slices"
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    // Merge user config with default config
    const options = context.options[0] || {};
    const config = mergeConfig(options);

    // Check if relative imports between slices are allowed (default: false)
    const allowBetweenSlices = options.allowBetweenSlices ||
      config.relativePath?.allowBetweenSlices ||
      false;

    // Project root directory
    const projectRoot = process.cwd();

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Skip non-relative imports
        if (!isRelativePath(importPath)) {
          return;
        }

        const filePath = normalizePath(context.getFilename());

        // Skip test files
        if (isTestFile(filePath, config.testFilesPatterns)) {
          return;
        }

        // Check for ignored patterns
        const isIgnored = config.ignoreImportPatterns.some(pattern => {
          const regex = new RegExp(pattern);
          return regex.test(importPath);
        });

        if (isIgnored) {
          return;
        }

        // Extract current file's layer and slice
        const fromLayer = extractLayerFromPath(filePath, config);
        const fromSlice = extractSliceFromPath(filePath, config);

        // Skip if not in a valid layer/slice
        if (!fromLayer || !fromSlice) {
          return;
        }

        // Allow between-slice imports if configured
        if (allowBetweenSlices) {
          return;
        }

        // For relative imports, we need to resolve the actual target path
        const currentDir = path.dirname(filePath);
        const resolvedImportPath = normalizePath(path.resolve(currentDir, importPath));

        // Extract target file's layer and slice
        const toLayer = extractLayerFromPath(resolvedImportPath, config);
        const toSlice = extractSliceFromPath(resolvedImportPath, config);

        // Skip if target is not in a valid layer/slice
        if (!toLayer || !toSlice) {
          return;
        }

        // Check if import crosses slice boundaries
        if (fromLayer === toLayer && fromSlice !== toSlice) {
          context.report({
            node,
            messageId: "noRelativePath",
            data: {
              importPath
            }
          });
        }
      }
    };
  }
};