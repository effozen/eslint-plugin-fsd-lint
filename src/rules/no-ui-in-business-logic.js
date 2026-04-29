/**
 * @fileoverview Prevents importing UI components in business logic layers (model, api, lib).
 */

import {
  extractLayerFromPath,
  isTestFile,
  normalizePath,
} from "../utils/path-utils.js";
import { mergeConfig } from "../utils/config-utils.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevents importing UI components in business logic layers (model, api, lib).",
      recommended: true,
    },
    messages: {
      noUiInBusinessLogic:
        "🚨 UI components cannot be imported in business logic layers (model, api, lib).",
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
            description: "Allow importing UI component types in business logic",
          },
          uiLayers: {
            type: "array",
            items: { type: "string" },
            description:
              "Layers that contain UI components (default: ['ui', 'widgets', 'features'])",
          },
          businessLogicLayers: {
            type: "array",
            items: { type: "string" },
            description:
              "Layers that contain business logic (default: ['model', 'api', 'lib'])",
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
    const uiLayers = options.uiLayers || ["ui", "widgets", "features"];
    const businessLogicLayers = new Set(
      options.businessLogicLayers || ["model", "api", "lib"],
    );

    function checkImport(node, importPath, { isTypeImport }) {
      if (typeof importPath !== "string") {
        return;
      }

      const filePath = normalizePath(context.filename);

      if (isTestFile(filePath, config.testFilesPatterns)) {
        return;
      }

      const isIgnored = config.ignoreImportPatterns.some((pattern) => {
        const regex = new RegExp(pattern);
        return regex.test(importPath);
      });

      if (isIgnored) {
        return;
      }

      const fromLayer = extractLayerFromPath(filePath, config);
      if (!fromLayer) {
        return;
      }

      if (!businessLogicLayers.has(fromLayer)) {
        return;
      }

      if (allowTypeImports && isTypeImport) {
        return;
      }

      const isUiImport = uiLayers.some((layer) =>
        importPath.includes(`/${layer}/`),
      );

      if (isUiImport) {
        context.report({
          node,
          messageId: "noUiInBusinessLogic",
        });
      }
    }

    return {
      ImportDeclaration(node) {
        checkImport(node, node.source.value, {
          isTypeImport: node.importKind === "type",
        });
      },
      CallExpression(node) {
        if (node.callee.type === "Import") {
          checkImport(node, node.arguments[0]?.value, {
            isTypeImport: false,
          });
        }
      },
      ImportExpression(node) {
        checkImport(node, node.source?.value, {
          isTypeImport: false,
        });
      },
    };
  },
};
