/**
 * @fileoverview Prevents business logic layers (entities) from importing UI components (widgets)
 */

import { extractLayerFromPath, extractLayerFromImportPath, isTestFile, normalizePath } from '../utils/path-utils.js';
import { mergeConfig } from '../utils/config-utils.js';

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Prevents business logic layers (entities) from importing UI components (widgets, pages).",
      recommended: true,
    },
    messages: {
      noCrossUI:
        "🚨 '{{ fromLayer }}' cannot import from '{{ toLayer }}'. UI components must not be imported in business logic layers."
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
          businessLogicLayers: {
            type: "array",
            items: { type: "string" },
            description: "Layers considered business logic (default: ['entities'])"
          },
          uiLayers: {
            type: "array",
            items: { type: "string" },
            description: "Layers considered UI (default: ['widgets', 'pages'])"
          },
          testFilesPatterns: {
            type: "array",
            items: { type: "string" }
          },
          ignoreImportPatterns: {
            type: "array",
            items: { type: "string" }
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

    // Layers considered business logic
    const businessLogicLayers = options.businessLogicLayers || ['entities'];

    // Layers considered UI
    const uiLayers = options.uiLayers || ['widgets', 'pages'];

    return {
      ImportDeclaration(node) {
        const filePath = normalizePath(context.getFilename());
        const importPath = node.source.value;

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

        // Extract current file's layer
        const fromLayer = extractLayerFromPath(filePath, config);

        // Skip if not in a business logic layer
        if (!fromLayer || !businessLogicLayers.includes(fromLayer)) {
          return;
        }

        // Extract import path's layer
        const toLayer = extractLayerFromImportPath(importPath, config);

        // Skip if not importing from a UI layer
        if (!toLayer || !uiLayers.includes(toLayer)) {
          return;
        }

        // Special case: UI components within entities layer are allowed
        if (fromLayer === 'entities' && filePath.includes('/ui/')) {
          return;
        }

        // Check if importing from UI to business logic
        context.report({
          node,
          messageId: "noCrossUI",
          data: {
            fromLayer,
            toLayer
          }
        });
      }
    };
  }
};