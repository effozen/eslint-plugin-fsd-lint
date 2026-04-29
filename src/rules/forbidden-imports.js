/**
 * @fileoverview Layer imports rule - Enforces layer dependency direction in FSD architecture
 */

import { mergeConfig } from "../utils/config-utils.js";
import {
  extractLayerFromPath,
  extractSliceFromPath,
  getEntityCrossImportPublicApiInfo,
  getImportTargetInfo,
  isTestFile,
  normalizePath,
} from "../utils/path-utils.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevents imports from higher layers and cross-imports between slices.",
      recommended: true,
    },
    messages: {
      invalidImport:
        "🚨 '{{ fromLayer }}' layer cannot import from '{{ toLayer }}' layer. Allowed imports: {{ allowedLayers }}",
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
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    // Merge user config with default config
    const options = context.options[0] || {};
    const config = mergeConfig(options);
    const singleLayerModules = new Set(["app", "shared"]);

    return {
      ImportDeclaration(node) {
        const filePath = normalizePath(context.filename);
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

        // Extract import target info, resolving aliases to filesystem paths when possible.
        const target = getImportTargetInfo(importPath, filePath, config);
        const toLayer = target.layer;

        // Cannot determine layers (external libraries, etc.)
        if (!fromLayer || !toLayer) {
          return;
        }

        // Same-slice imports are internal implementation details, even when
        // written through an alias such as "@/pages/articles/...".
        if (fromLayer === toLayer) {
          if (singleLayerModules.has(fromLayer)) {
            return;
          }

          const fromSlice = extractSliceFromPath(filePath, config);
          const toSlice = target.slice;

          if (fromSlice && toSlice && fromSlice === toSlice) {
            return;
          }

          const crossImportInfo = getEntityCrossImportPublicApiInfo(
            importPath,
            filePath,
            config,
          );

          if (
            crossImportInfo &&
            fromLayer === "entities" &&
            fromSlice === crossImportInfo.consumerSlice
          ) {
            return;
          }
        }

        // Get layer priorities and allowed imports
        const fromLayerConfig = config.layers[fromLayer];

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
              allowedLayers: allowedToImport.join(", "),
            },
          });
        }
      },
    };
  },
};
