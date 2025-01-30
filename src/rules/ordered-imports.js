export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforces ordered imports by Feature-Sliced Design (FSD) layers.",
      recommended: true,
    },
    messages: {
      incorrectGrouping:
        "🚨 '{{ currentImport }}' import is not correctly grouped. Keep imports ordered by layer.",
    },
    fixable: "code",
  },

  create(context) {
    return {
      Program(node) {
        const importNodes = node.body.filter(statement => statement.type === "ImportDeclaration");

        if (importNodes.length === 0) {
          return;
        }

        const sourceCode = context.getSourceCode();

        // ✅ FSD Layer order (top to bottom)
        const layers = ["app", "processes", "pages", "widgets", "features", "entities", "shared"];

        // Group imports by FSD layer
        const groupedImports = layers.reduce((acc, layer) => {
          acc[layer] = [];
          return acc;
        }, {});

        importNodes.forEach(importNode => {
          const importPath = importNode.source.value;
          const layer = layers.find(l => importPath.includes(`/${l}/`));

          if (layer) {
            groupedImports[layer].push(importNode);
          }
        });

        // Flatten to get ordered import statements
        const sortedImports = layers.flatMap(layer => groupedImports[layer]);

        // 🚀 Convert AST nodes to text before comparison
        const importText = importNodes.map(node => sourceCode.getText(node)).join("\n");
        const sortedImportText = sortedImports.map(node => sourceCode.getText(node)).join("\n");

        if (importText !== sortedImportText) {
          context.report({
            node: importNodes[0],
            messageId: "incorrectGrouping",
            data: {
              currentImport: importNodes[0].source.value,
            },
            fix(fixer) {
              return fixer.replaceTextRange(
                [importNodes[0].range[0], importNodes[importNodes.length - 1].range[1]],
                sortedImportText
              );
            },
          });
        }
      },
    };
  },
};
