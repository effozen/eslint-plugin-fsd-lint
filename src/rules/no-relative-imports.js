/**
 * @fileoverview Prevents relative imports between slices. All imports should use absolute paths with aliases.
 */

import { isRelativePath, isTestFile, normalizePath } from '../utils/path-utils.js';
import { mergeConfig } from '../utils/config-utils.js';
import path from 'path';

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevents relative imports between slices. Use absolute paths with aliases instead.',
      recommended: true,
    },
    messages: {
      noRelativeImport: '🚨 Relative imports are not allowed. Use absolute imports with aliases instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          testFilesPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          ignoreImportPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          allowTypeImports: {
            type: 'boolean',
            description: 'Allow relative imports for type-only imports',
          },
          allowSameSlice: {
            type: 'boolean',
            description: 'Allow relative imports within the same slice',
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

    // Allow same slice imports if configured
    const allowSameSlice = options.allowSameSlice || false;

    // Helper function to check if import is within the same slice
    function isSameSlice(importPath, currentFilePath) {
      if (!allowSameSlice) return false;

      const normalizedCurrentPath = normalizePath(currentFilePath);
      // Get the base directory of the current file
      const currentDir = path.dirname(normalizedCurrentPath);
      // Resolve the import path relative to the current file
      const resolvedImportPath = path.resolve(currentDir, importPath);

      // FSD slice boundaries are typically 2-3 levels deep (e.g., features/auth, entities/user)
      // Extract slice path segments
      const sliceSegments = normalizedCurrentPath.split('/');
      // We need at least layer and slice name (e.g., features/auth)
      if (sliceSegments.length < 4) return false;

      // Get layer and slice (e.g., "features/auth")
      const layer = sliceSegments[sliceSegments.length - 4]; // Typically "src/features/auth/ui/component.tsx"
      const slice = sliceSegments[sliceSegments.length - 3];

      // Check if import path is in the same layer/slice
      return resolvedImportPath.includes(`/${layer}/${slice}/`);
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Skip if not a relative import
        if (!isRelativePath(importPath)) {
          return;
        }

        // Skip test files
        if (isTestFile(context.getFilename(), config.testFilesPatterns)) {
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
        if (allowTypeImports && node.importKind === 'type') {
          return;
        }

        // Skip same slice imports if configured
        if (allowSameSlice && isSameSlice(importPath, context.getFilename())) {
          return;
        }

        context.report({
          node,
          messageId: 'noRelativeImport',
        });
      },
      CallExpression(node) {
        // Handle dynamic imports
        if (node.callee.type === 'Import') {
          const importPath = node.arguments[0].value;

          // Skip if not a relative import
          if (!isRelativePath(importPath)) {
            return;
          }

          // Skip test files
          if (isTestFile(context.getFilename(), config.testFilesPatterns)) {
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
          if (allowSameSlice && isSameSlice(importPath, context.getFilename())) {
            return;
          }

          context.report({
            node,
            messageId: 'noRelativeImport',
          });
        }
      },
    };
  },
};
