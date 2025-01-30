export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevents direct imports from internal files of features, widgets, or entities. All imports must go through index.ts (public API).",
      recommended: true,
    },
    messages: {
      noDirectImport:
        "🚨 Direct import from '{{ importPath }}' is not allowed. Use the public API (index.ts) instead.",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Restricted layers that must use a public API
        const restrictedLayers = ["features", "entities", "widgets"];

        const isRestrictedImport = restrictedLayers.some(
          (layer) => importPath.includes(`/${layer}/`) && !importPath.endsWith("index.ts")
        );

        if (isRestrictedImport) {
          context.report({
            node,
            messageId: "noDirectImport",
            data: {
              importPath,
            },
          });
        }
      },
    };
  },
};
