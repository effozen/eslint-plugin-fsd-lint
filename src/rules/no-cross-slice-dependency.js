export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevents direct imports between feature slices. Use entities or shared modules instead.",
      recommended: true,
    },
    messages: {
      noFeatureDependency:
        "🚨 '{{ fromFeature }}' cannot directly import from '{{ toFeature }}'. Use entities or shared modules instead.",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const filePath = context.filename;
        const importPath = node.source.value;

        // Detect direct imports between feature slices
        if (filePath.includes("/features/") && importPath.includes("/features/")) {
          const fromFeature = filePath.split("/features/")[1].split("/")[0];
          const toFeature = importPath.split("/features/")[1].split("/")[0];

          if (fromFeature !== toFeature) {
            context.report({
              node,
              messageId: "noFeatureDependency",
              data: {
                fromFeature,
                toFeature,
              },
            });
          }
        }
      },
    };
  },
};
