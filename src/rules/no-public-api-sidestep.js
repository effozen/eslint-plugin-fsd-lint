/**
 * @fileoverview Prevents direct imports from internal files of modules. Use public API (index) instead.
 */

import { mergeConfig } from "../utils/config-utils.js";
import {
  extractLayerFromPath,
  extractSliceFromPath,
  findLayerBySegment,
  getEntityCrossImportPublicApiInfo,
  getImportTargetInfo,
  getRelativePathFromRoot,
  getImportPathWithoutAlias,
  isRelativePath,
  isTestFile,
  normalizePath,
} from "../utils/path-utils.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevents direct imports from internal files of features, widgets, or entities. All imports must go through index files (public API).",
      recommended: true,
    },
    messages: {
      noDirectImport:
        "🚨 Direct import from '{{ importPath }}' is not allowed. Use the public API (index file) instead.",
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
                  withSlash: { type: "boolean" },
                },
                required: ["value"],
                additionalProperties: false,
              },
            ],
          },
          layers: {
            oneOf: [
              {
                type: "array",
                items: { type: "string" },
                description:
                  "Layers that require using public API (default: ['features', 'entities', 'widgets'])",
              },
              {
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
                description:
                  "Custom layer configuration. Use publicApi.enforceForLayers to customize restricted layers.",
              },
            ],
          },
          rootPath: { type: "string" },
          tsconfigPath: { type: "string" },
          folderPattern: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
              regex: { type: "string" },
              extractionGroup: { type: "number" },
            },
            additionalProperties: false,
          },
          publicApi: {
            type: "object",
            properties: {
              enforceForLayers: {
                type: "array",
                items: { type: "string" },
              },
              fileNames: {
                type: "array",
                items: { type: "string" },
              },
              allowSegmentImports: {
                type: "boolean",
                description:
                  "Allow imports from segment-level public API entry points such as @entities/user/model",
              },
              enforceShared: {
                type: "boolean",
                description:
                  "Also enforce public API imports for the shared layer",
              },
            },
            additionalProperties: false,
          },
          publicApiFiles: {
            type: "array",
            items: { type: "string" },
            description:
              "Files that are considered public API (default: ['index.ts', 'index.tsx', 'index.js', 'index.jsx'])",
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
            description: "Allow direct imports of type definitions",
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    // Merge user config with default config
    const options = context.options[0] || {};
    const config = mergeConfig({
      ...options,
      layers: Array.isArray(options.layers) ? undefined : options.layers,
    });

    // Layers that require public API
    const restrictedLayerList = Array.isArray(options.layers)
      ? options.layers
      : config.publicApi?.enforceForLayers || [
          "features",
          "entities",
          "widgets",
        ];
    const restrictedLayers = new Set(restrictedLayerList);

    if (config.publicApi?.enforceShared) {
      restrictedLayers.add("shared");
    }

    // Files that are considered public API
    const publicApiFiles = options.publicApiFiles ||
      config.publicApi?.fileNames || [
        "index.ts",
        "index.tsx",
        "index.js",
        "index.jsx",
      ];

    // Allow type imports if configured
    const allowTypeImports = options.allowTypeImports || false;

    const allowSegmentImports = config.publicApi?.allowSegmentImports !== false;

    function isPublicApiFileName(segment) {
      return publicApiFiles.some((apiFile) => {
        const fileName = normalizePath(apiFile).split("/").pop();
        const fileNameWithoutExtension = fileName.replace(/\.[^.]+$/, "");

        return segment === fileName || segment === fileNameWithoutExtension;
      });
    }

    function isAllowedSlicePublicApiImport(segments) {
      // @features/auth
      if (segments.length === 2) {
        return true;
      }

      // @features/auth/index or @features/auth/index.ts
      if (segments.length === 3 && isPublicApiFileName(segments[2])) {
        return true;
      }

      if (!allowSegmentImports) {
        return false;
      }

      // @features/auth/model
      if (segments.length === 3) {
        return true;
      }

      // Preserve existing behavior where any configured index file is treated
      // as a public API entry point.
      return isPublicApiFileName(segments[segments.length - 1]);
    }

    function isAllowedSharedPublicApiImport(segments) {
      // @shared
      if (segments.length === 1) {
        return true;
      }

      // @shared/index or @shared/index.ts
      if (segments.length === 2 && isPublicApiFileName(segments[1])) {
        return true;
      }

      if (!allowSegmentImports) {
        return false;
      }

      // @shared/ui
      if (segments.length === 2) {
        return true;
      }

      // Preserve existing behavior for explicit index public API files.
      return isPublicApiFileName(segments[segments.length - 1]);
    }

    function isAllowedPublicApiImport(importPath, importLayer) {
      const pathWithoutAlias = getImportPathWithoutAlias(importPath, config);

      if (!pathWithoutAlias) {
        return false;
      }

      const segments = pathWithoutAlias.split("/").filter(Boolean);
      if (segments.length === 0) {
        return false;
      }

      if (findLayerBySegment(segments[0], config) !== importLayer) {
        return false;
      }

      if (importLayer === "shared") {
        return isAllowedSharedPublicApiImport(segments);
      }

      return isAllowedSlicePublicApiImport(segments);
    }

    function isAllowedResolvedPublicApiImport(resolvedPath, importLayer) {
      const relativePath = getRelativePathFromRoot(
        resolvedPath,
        config.rootPath,
      );
      if (!relativePath) {
        return false;
      }

      const segments = relativePath.split("/").filter(Boolean);
      if (segments.length === 0) {
        return false;
      }

      if (importLayer === "shared") {
        if (segments.length === 2 && isPublicApiFileName(segments[1])) {
          return true;
        }

        return (
          allowSegmentImports &&
          segments.length >= 3 &&
          isPublicApiFileName(segments[segments.length - 1])
        );
      }

      if (segments.length === 3 && isPublicApiFileName(segments[2])) {
        return true;
      }

      return (
        allowSegmentImports &&
        segments.length === 4 &&
        isPublicApiFileName(segments[3])
      );
    }

    function isAllowedEntityCrossImport(importPath, filePath, importLayer) {
      const crossImportInfo = getEntityCrossImportPublicApiInfo(
        importPath,
        filePath,
        config,
      );

      if (!crossImportInfo || importLayer !== "entities") {
        return false;
      }

      return (
        extractLayerFromPath(filePath, config) === "entities" &&
        extractSliceFromPath(filePath, config) === crossImportInfo.consumerSlice
      );
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

      // Skip relative imports
      if (isRelativePath(importPath)) {
        return;
      }

      // Skip type-only imports if configured
      if (allowTypeImports && isTypeImport) {
        return;
      }

      const target = getImportTargetInfo(importPath, filePath, config);
      const importLayer = target.layer;

      // Skip if not importing from a restricted layer
      if (!importLayer || !restrictedLayers.has(importLayer)) {
        return;
      }

      const currentLayer = extractLayerFromPath(filePath, config);
      if (currentLayer === importLayer) {
        const currentSlice = extractSliceFromPath(filePath, config);
        const importSlice = target.slice;

        if (currentSlice && importSlice && currentSlice === importSlice) {
          return;
        }
      }

      if (
        isAllowedEntityCrossImport(importPath, filePath, importLayer) ||
        (target.resolvedPath &&
          isAllowedResolvedPublicApiImport(target.resolvedPath, importLayer)) ||
        isAllowedPublicApiImport(importPath, importLayer)
      ) {
        return;
      }

      context.report({
        node,
        messageId: "noDirectImport",
        data: {
          importPath,
        },
      });
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
