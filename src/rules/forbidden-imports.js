export default {
  meta: {
    type: "problem",
    docs: {
      description: "Prevents imports from higher layers and cross-imports between slices.",
      recommended: true,
    },
    messages: {
      invalidImport:
        "🚨 '{{ fromLayer }}' layer cannot import from '{{ toLayer }}' layer.",
    },
  },

  create(context) {
    const layers = ["shared", "entities", "features", "widgets", "pages", "processes", "app"];

    return {
      ImportDeclaration(node) {
        const filePath = context.filename;
        const importPath = node.source.value;

        const fromLayer = layers.find(layer => filePath.includes(`/${layer}/`));
        const toLayer = layers.find(layer => importPath.includes(`/${layer}/`));

        if (!fromLayer || !toLayer) {
          return;
        }

        if (layers.indexOf(fromLayer) > layers.indexOf(toLayer)) {
          context.report({
            node,
            messageId: "invalidImport",
            data: {
              fromLayer,
              toLayer,
            },
          });
        }
      },
    };
  },
};
