/**
 * @fileoverview Prevents direct dependencies between slices in the same layer. Each slice should be isolated.
 */

import {
  extractLayerFromPath,
  extractLayerFromImportPath,
  extractSliceFromPath,
  isTestFile,
  normalizePath,
  isRelativePath,
} from '../utils/path-utils.js';
import { mergeConfig } from '../utils/config-utils.js';

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevents direct imports between slices in the same layer (not just features).',
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
        type: 'object',
        properties: {
          featuresOnly: {
            type: 'boolean',
            description: 'If true, only check dependencies between feature slices',
          },
          excludeLayers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Layers to exclude from this rule (shared is always excluded)',
          },
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
            description: 'Allow type-only imports between slices',
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
    const featuresOnly = config.featuresOnly === true;

    // Allow type imports if configured
    const allowTypeImports = options.allowTypeImports || false;

    // Layers to exclude from this rule (shared is always excluded)
    const excludeLayers = new Set(['shared', ...(config.excludeLayers || [])]);

    // Track imports to detect circular dependencies
    const importTracker = new Map();

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

        // Skip type-only imports if configured
        if (allowTypeImports && node.importKind === 'type') {
          return;
        }

        // Extract current file's layer
        const fromLayer = extractLayerFromPath(filePath, config);

        // Skip excluded layers
        if (!fromLayer || excludeLayers.has(fromLayer)) {
          return;
        }

        // If using legacy behavior, only check the features layer
        if (featuresOnly && fromLayer !== 'features') {
          return;
        }

        // Extract current file's slice
        const fromSlice = extractSliceFromPath(filePath, config);
        if (!fromSlice) {
          return;
        }

        // Handle relative paths by checking if they go outside the slice
        if (isRelativePath(importPath)) {
          // For relative paths, we need to analyze if they cross slice boundaries
          const pathSegments = importPath.split('/');

          // Count up-traversals
          let upCount = 0;
          for (const segment of pathSegments) {
            if (segment === '..') {
              upCount++;
            } else {
              break;
            }
          }

          // If going up enough levels to potentially reach another slice
          const layerPathPosition = filePath.indexOf(`/${fromLayer}/`);

          if (layerPathPosition !== -1) {
            const layerPathParts = filePath.substring(layerPathPosition + fromLayer.length + 2).split('/');
            const sliceDepth = layerPathParts.length;

            // If going up enough levels to exit the current slice (but staying in the same layer)
            if (upCount > 0 && upCount < sliceDepth && upCount >= layerPathParts[0].length) {
              // Extract the target slice name from the relative path
              const targetSlice = pathSegments[upCount];

              if (targetSlice && targetSlice !== fromSlice) {
                if (fromLayer === 'features' || featuresOnly) {
                  context.report({
                    node,
                    messageId: 'noFeatureDependency',
                    data: {
                      fromFeature: fromSlice,
                      toFeature: targetSlice,
                    },
                  });
                } else {
                  context.report({
                    node,
                    messageId: 'noSliceDependency',
                    data: {
                      layer: fromLayer,
                      fromSlice: fromSlice,
                      toSlice: targetSlice,
                    },
                  });
                }
              }
            }
          }

          return;
        }

        // For absolute imports, check if it's importing from the same layer but different slice
        const toLayer = extractLayerFromImportPath(importPath, config);

        // Only check imports within the same layer
        if (toLayer !== fromLayer) {
          return;
        }

        // Extract import path's slice
        let toSlice;

        // Handle alias format
        if (!isRelativePath(importPath)) {
          const aliasConfig = config.alias;
          const aliasValue = aliasConfig.value;
          const withSlash = aliasConfig.withSlash;

          // Extract path after alias and layer
          let pathWithoutAlias;
          if (withSlash) {
            pathWithoutAlias = importPath.substring(aliasValue.length + `/${fromLayer}/`.length);
          } else {
            pathWithoutAlias = importPath.substring(aliasValue.length + `${fromLayer}/`.length);
            // Remove leading slash if present
            if (pathWithoutAlias.startsWith('/')) {
              pathWithoutAlias = pathWithoutAlias.substring(1);
            }
          }

          // First segment is the slice
          toSlice = pathWithoutAlias.split('/')[0];
        }

        // Skip if slice info is missing or same slice
        if (!toSlice || toSlice === fromSlice) {
          return;
        }

        // Check for circular dependencies
        const importKey = `${fromLayer}/${fromSlice}`;
        const targetKey = `${toLayer}/${toSlice}`;

        if (!importTracker.has(importKey)) {
          importTracker.set(importKey, new Set());
        }

        const imports = importTracker.get(importKey);

        // Check if this would create a circular dependency
        if (imports.has(targetKey)) {
          // Check if the target slice also imports from the current slice
          if (importTracker.has(targetKey) && importTracker.get(targetKey).has(importKey)) {
            context.report({
              node,
              messageId: fromLayer === 'features' || featuresOnly ? 'noFeatureDependency' : 'noSliceDependency',
              data: {
                fromFeature: fromSlice,
                toFeature: toSlice,
                layer: fromLayer,
                fromSlice: fromSlice,
                toSlice: toSlice,
              },
            });
            return;
          }
        }

        imports.add(targetKey);

        // Report errors with appropriate message based on layer
        if (fromLayer === 'features' || featuresOnly) {
          context.report({
            node,
            messageId: 'noFeatureDependency',
            data: {
              fromFeature: fromSlice,
              toFeature: toSlice,
            },
          });
        } else {
          context.report({
            node,
            messageId: 'noSliceDependency',
            data: {
              layer: fromLayer,
              fromSlice: fromSlice,
              toSlice: toSlice,
            },
          });
        }
      },
      CallExpression(node) {
        // Handle dynamic imports
        if (node.callee.type === 'Import') {
          const importPath = node.arguments[0].value;

          // Skip relative imports
          if (isRelativePath(importPath)) {
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

          // Extract current file's layer
          const fromLayer = extractLayerFromPath(context.getFilename(), config);

          // Skip excluded layers
          if (!fromLayer || excludeLayers.has(fromLayer)) {
            return;
          }

          // If using legacy behavior, only check the features layer
          if (featuresOnly && fromLayer !== 'features') {
            return;
          }

          // Extract current file's slice
          const fromSlice = extractSliceFromPath(context.getFilename(), config);
          if (!fromSlice) {
            return;
          }

          // For absolute imports, check if it's importing from the same layer but different slice
          const toLayer = extractLayerFromImportPath(importPath, config);

          // Only check imports within the same layer
          if (toLayer !== fromLayer) {
            return;
          }

          // Extract import path's slice
          let toSlice;

          // Handle alias format
          const aliasConfig = config.alias;
          const aliasValue = aliasConfig.value;
          const withSlash = aliasConfig.withSlash;

          // Extract path after alias and layer
          let pathWithoutAlias;
          if (withSlash) {
            pathWithoutAlias = importPath.substring(aliasValue.length + `/${fromLayer}/`.length);
          } else {
            pathWithoutAlias = importPath.substring(aliasValue.length + `${fromLayer}/`.length);
            // Remove leading slash if present
            if (pathWithoutAlias.startsWith('/')) {
              pathWithoutAlias = pathWithoutAlias.substring(1);
            }
          }

          // First segment is the slice
          toSlice = pathWithoutAlias.split('/')[0];

          // Skip if slice info is missing or same slice
          if (!toSlice || toSlice === fromSlice) {
            return;
          }

          // Check for circular dependencies
          const importKey = `${fromLayer}/${fromSlice}`;
          const targetKey = `${toLayer}/${toSlice}`;

          if (!importTracker.has(importKey)) {
            importTracker.set(importKey, new Set());
          }

          const imports = importTracker.get(importKey);

          // Check if this would create a circular dependency
          if (imports.has(targetKey)) {
            // Check if the target slice also imports from the current slice
            if (importTracker.has(targetKey) && importTracker.get(targetKey).has(importKey)) {
              context.report({
                node,
                messageId: fromLayer === 'features' || featuresOnly ? 'noFeatureDependency' : 'noSliceDependency',
                data: {
                  fromFeature: fromSlice,
                  toFeature: toSlice,
                  layer: fromLayer,
                  fromSlice: fromSlice,
                  toSlice: toSlice,
                },
              });
              return;
            }
          }

          imports.add(targetKey);

          // Report errors with appropriate message based on layer
          if (fromLayer === 'features' || featuresOnly) {
            context.report({
              node,
              messageId: 'noFeatureDependency',
              data: {
                fromFeature: fromSlice,
                toFeature: toSlice,
              },
            });
          } else {
            context.report({
              node,
              messageId: 'noSliceDependency',
              data: {
                layer: fromLayer,
                fromSlice: fromSlice,
                toSlice: toSlice,
              },
            });
          }
        }
      },
    };
  },
};
