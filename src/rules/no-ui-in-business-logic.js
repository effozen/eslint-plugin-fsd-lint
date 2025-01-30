export default {
  meta: {
    type: "problem",
    docs: {
      description: "Prevents business logic layers (entities) from importing UI components (widgets).",
      recommended: true,
    },
    messages: {
      noCrossUI:
        "🚨 '{{ fromLayer }}' cannot import from '{{ toLayer }}'. UI components must not be imported in business logic layers.",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const filePath = context.filename;
        const importPath = node.source.value;

        // Detect imports from entities to widgets
        if (filePath.includes("/entities/") && importPath.includes("/widgets/")) {
          context.report({
            node,
            messageId: "noCrossUI",
            data: {
              fromLayer: "entities",
              toLayer: "widgets",
            },
          });
        }
      },
    };
  },
};
