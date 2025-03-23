/**
 * @fileoverview Layer imports rule - Enforces layer dependency direction in FSD architecture
 */

import { extractLayerFromPath, extractLayerFromImportPath, isTestFile, normalizePath } from '../utils/path-utils.js';
import { mergeConfig } from '../utils/config-utils.js';

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Prevents imports from higher layers and cross-imports between slices.",
      recommended: true,
    },
    messages: {
      invalidImport:
        "🚨 '{{ fromLayer }}' layer cannot import from '{{ toLayer }}' layer. Allowed imports: {{ allowedLayers }}"
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
          layers: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                priority: { type: "number" },
                allowedToImport: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              additionalProperties: false
            }
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

        // Extract import path's layer
        const toLayer = extractLayerFromImportPath(importPath, config);

        // Cannot determine layers (external libraries, etc.)
        if (!fromLayer || !toLayer) {
          return;
        }

        // Get layer priorities and allowed imports
        const fromLayerConfig = config.layers[fromLayer];
        const toLayerConfig = config.layers[toLayer];

        // Get list of allowed imports
        const allowedToImport = fromLayerConfig.allowedToImport || [];

        // Check if current layer can import target layer
        if (!allowedToImport.includes(toLayer)) {
          context.report({
            node,
            messageId: "invalidImport",
            data: {
              fromLayer,
              toLayer,
              allowedLayers: allowedToImport.join(', ')
            }
          });
        }
      }
    };
  }
};