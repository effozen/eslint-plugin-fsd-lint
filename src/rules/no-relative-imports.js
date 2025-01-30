export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallows relative imports and enforces the use of project-defined aliases.",
      recommended: true,
    },
    messages: {
      noRelativePath:
        "🚨 Relative import '{{ importPath }}' is not allowed. Use an alias instead.",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Detects relative imports (starting with ../ or ./)
        if (importPath.startsWith("../") || importPath.startsWith("./")) {
          context.report({
            node,
            messageId: "noRelativePath",
            data: {
              importPath,
            },
          });
        }
      },
    };
  },
};
