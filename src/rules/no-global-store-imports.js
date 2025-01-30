export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallows direct imports of global state (store). Use hooks like useStore or useSelector instead.",
      recommended: true,
    },
    messages: {
      noGlobalStore:
        "🚨 '{{ storeName }}' cannot be directly imported. Use hooks such as useStore or useSelector instead.",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Forbidden global store paths (Redux, Zustand, etc.)
        const forbiddenPatterns = ["/app/store", "/shared/store"];

        if (forbiddenPatterns.some(pattern => importPath.includes(pattern))) {
          context.report({
            node,
            messageId: "noGlobalStore",
            data: {
              storeName: importPath,
            },
          });
        }
      },
    };
  },
};
