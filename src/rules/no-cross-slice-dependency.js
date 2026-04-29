/**
 * @fileoverview Prevents direct dependencies between slices in the same layer. Each slice should be isolated.
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
        "Prevents direct imports between slices in the same layer (not just features).",
      recommended: true,
    },
    messages: {
      noFeatureDependency:
        "🚨 '{{ fromFeature }}' cannot directly import from '{{ toFeature }}'. Use shared or entities instead.",
      noSliceDependency:
        "🚨 '{{ fromSlice }}' slice in {{ layer }} layer cannot directly import from '{{ toSlice }}' slice. Use lower layers instead.",
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
          featuresOnly: {
            type: "boolean",
            description:
              "If true, only check dependencies between feature slices",
          },
          excludeLayers: {
            type: "array",
            items: { type: "string" },
            description:
              "Layers to exclude from this rule (shared is always excluded)",
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
            description: "Allow type-only imports between slices",
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

    // Should we use legacy behavior (features layer only)?
    const featuresOnly = options.featuresOnly === true;

    // Allow type imports if configured
    const allowTypeImports = options.allowTypeImports || false;

    // Layers to exclude from this rule (app and shared do not have FSD slices)
    const excludeLayers = new Set([
      "app",
      "shared",
      ...(options.excludeLayers || []),
    ]);

    // Track imports within a single file to deduplicate reports for the same
    // slice pair.  Note: ESLint processes one file at a time, so this tracker
    // cannot detect true cross-file circular dependencies (e.g. A→B in file1
    // and B→A in file2).  That limitation is inherent to ESLint's single-file
    // analysis model.
    const importTracker = new Map();

    function shouldReportSlicePair(fromLayer, fromSlice, toLayer, toSlice) {
      const importKey = `${fromLayer}/${fromSlice}`;
      const targetKey = `${toLayer}/${toSlice}`;

      if (!importTracker.has(importKey)) {
        importTracker.set(importKey, new Set());
      }

      const imports = importTracker.get(importKey);
      if (imports.has(targetKey)) {
        return false;
      }

      imports.add(targetKey);
      return true;
    }

    function reportSliceViolation(node, fromLayer, fromSlice, toSlice) {
      if (fromLayer === "features" || featuresOnly) {
        context.report({
          node,
          messageId: "noFeatureDependency",
          data: { fromFeature: fromSlice, toFeature: toSlice },
        });
      } else {
        context.report({
          node,
          messageId: "noSliceDependency",
          data: { layer: fromLayer, fromSlice, toSlice },
        });
      }
    }

    function checkImport(node, importPath, filePath, { isTypeImport }) {
      if (typeof importPath !== "string") {
        return;
      }

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

      // Skip type-only imports if configured
      if (allowTypeImports && isTypeImport) {
        return;
      }

      // Extract current file's layer
      const fromLayer = extractLayerFromPath(filePath, config);

      // Skip excluded layers
      if (!fromLayer || excludeLayers.has(fromLayer)) {
        return;
      }

      // If using legacy behavior, only check the features layer
      if (featuresOnly && fromLayer !== "features") {
        return;
      }

      // Extract current file's slice
      const fromSlice = extractSliceFromPath(filePath, config);
      if (!fromSlice) {
        return;
      }

      const target = getImportTargetInfo(importPath, filePath, config);
      const toLayer = target.layer;

      // Only check imports within the same layer
      if (toLayer !== fromLayer) {
        return;
      }

      const toSlice = target.slice;

      // Skip if slice info is missing or same slice
      if (!toSlice || toSlice === fromSlice) {
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

      if (shouldReportSlicePair(fromLayer, fromSlice, toLayer, toSlice)) {
        reportSliceViolation(node, fromLayer, fromSlice, toSlice);
      }
    }

    return {
      ImportDeclaration(node) {
        checkImport(node, node.source.value, normalizePath(context.filename), {
          isTypeImport: node.importKind === "type",
        });
      },
      CallExpression(node) {
        if (node.callee.type === "Import") {
          checkImport(
            node,
            node.arguments[0]?.value,
            normalizePath(context.filename),
            { isTypeImport: false },
          );
        }
      },
      ImportExpression(node) {
        checkImport(node, node.source?.value, normalizePath(context.filename), {
          isTypeImport: false,
        });
      },
    };
  },
};
