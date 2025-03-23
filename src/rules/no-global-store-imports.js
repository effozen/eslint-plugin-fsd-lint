/**
 * @fileoverview Disallows direct imports of global state (store). Use hooks or selectors instead.
 */

import { normalizePath, isTestFile } from '../utils/path-utils.js';
import { mergeConfig } from '../utils/config-utils.js';

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallows direct imports of global state (store). Use hooks like useStore or useSelector instead.",
      recommended: true,
    },
    messages: {
      noGlobalStore:
        "🚨 '{{ storeName }}' cannot be directly imported. Use hooks such as useStore or useSelector instead."
    },
    schema: [
      {
        type: "object",
        properties: {
          forbiddenPaths: {
            type: "array",
            items: { type: "string" },
            description: "Paths that should not be directly imported (default: ['/app/store', '/shared/store'])"
          },
          allowedPaths: {
            type: "array",
            items: { type: "string" },
            description: "Paths that are exceptions to the forbidden paths"
          },
          testFilesPatterns: {
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

    // Default forbidden store paths
    const forbiddenPaths = options.forbiddenPaths || [
      '/app/store',
      '/shared/store',
      '/store/',
      '/redux/',
      '/zustand/',
      '/mobx/',
      '/recoil/'
    ];

    // Paths that are exceptions to the rule
    const allowedPaths = options.allowedPaths || [];

    return {
      ImportDeclaration(node) {
        const filePath = normalizePath(context.getFilename());
        const importPath = node.source.value;

        // Skip test files - tests typically need direct store access
        if (isTestFile(filePath, config.testFilesPatterns)) {
          return;
        }

        // Skip if import is in the allowed paths list
        if (allowedPaths.some(path => importPath.includes(path))) {
          return;
        }

        // Check if import includes any forbidden path
        const isForbidden = forbiddenPaths.some(path => importPath.includes(path));

        if (isForbidden) {
          context.report({
            node,
            messageId: "noGlobalStore",
            data: {
              storeName: importPath
            }
          });
        }
      }
    };
  }
};