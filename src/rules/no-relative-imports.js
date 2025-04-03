/**
 * @fileoverview Prevents relative imports between slices. All imports should use absolute paths with aliases.
 */

import { isRelativePath, isTestFile, normalizePath } from '../utils/path-utils.js';
import { mergeConfig } from '../utils/config-utils.js';

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
          // So we'll always report relative imports in dynamic imports

          context.report({
            node,
            messageId: 'noRelativeImport',
          });
        }
      },
    };
  },
};
