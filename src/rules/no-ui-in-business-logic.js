/**
 * @fileoverview Prevents importing UI components in business logic layers (model, api, lib).
 */

import { extractLayerFromPath, isTestFile, normalizePath } from '../utils/path-utils.js';
import { mergeConfig } from '../utils/config-utils.js';

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevents importing UI components in business logic layers (model, api, lib).',
      recommended: true,
    },
    messages: {
      noUiInBusinessLogic: '🚨 UI components cannot be imported in business logic layers (model, api, lib).',
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
            description: 'Allow importing UI component types in business logic',
          },
          uiLayers: {
            type: 'array',
            items: { type: 'string' },
            description: "Layers that contain UI components (default: ['ui', 'widgets', 'features'])",
          },
          businessLogicLayers: {
            type: 'array',
            items: { type: 'string' },
            description: "Layers that contain business logic (default: ['model', 'api', 'lib'])",
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

    // Define UI and business logic layers
    const uiLayers = new Set(options.uiLayers || ['ui', 'widgets', 'features']);
    const businessLogicLayers = new Set(options.businessLogicLayers || ['model', 'api', 'lib']);

    return {
      ImportDeclaration(node) {
        const filePath = normalizePath(context.getFilename());
        const importPath = node.source.value;

        // Skip test files
        if (isTestFile(filePath, config.testFilesPatterns)) {
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

        // Extract current file's layer
        const fromLayer = extractLayerFromPath(filePath, config);
        if (!fromLayer) {
          return;
        }

        // Check if current file is in a business logic layer
        const isBusinessLogicLayer = businessLogicLayers.has(fromLayer);
        if (!isBusinessLogicLayer) {
          return;
        }

        // Skip type-only imports if configured
        if (allowTypeImports && node.importKind === 'type') {
          return;
        }

        // Check if import is from a UI layer
        const isUiImport = uiLayers.some((layer) => importPath.includes(`/${layer}/`));
        if (isUiImport) {
          context.report({
            node,
            messageId: 'noUiInBusinessLogic',
          });
        }
      },
      CallExpression(node) {
        // Handle dynamic imports
        if (node.callee.type === 'Import') {
          const filePath = normalizePath(context.getFilename());
          const importPath = node.arguments[0].value;

          // Skip test files
          if (isTestFile(filePath, config.testFilesPatterns)) {
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

          // Extract current file's layer
          const fromLayer = extractLayerFromPath(filePath, config);
          if (!fromLayer) {
            return;
          }

          // Check if current file is in a business logic layer
          const isBusinessLogicLayer = businessLogicLayers.has(fromLayer);
          if (!isBusinessLogicLayer) {
            return;
          }

          // For dynamic imports, we can't check if it's a type import
          // as that information is not available at parse time
          // So we'll always report UI imports in dynamic imports

          // Check if import is from a UI layer
          const isUiImport = uiLayers.some((layer) => importPath.includes(`/${layer}/`));
          if (isUiImport) {
            context.report({
              node,
              messageId: 'noUiInBusinessLogic',
            });
          }
        }
      },
    };
  },
};
