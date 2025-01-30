export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "FSD import 구문을 레이어별로 정렬하여 가독성을 높입니다.",
      recommended: true,
    },
    messages: {
      incorrectGrouping:
        "🚨 '{{ currentImport }}' import가 올바른 그룹에 정렬되지 않았습니다. 같은 레이어별로 정렬하세요.",
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

        // ✅ FSD 레이어 목록 (위에서 아래로)
        const layers = ["app", "processes", "pages", "widgets", "features", "entities", "shared"];

        // import 경로를 기반으로 그룹화
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

        // 올바른 순서대로 import가 정렬되었는지 확인
        const sortedImports = layers.flatMap(layer => groupedImports[layer]);

        // 🚀 AST 노드를 문자열로 변환 후 비교
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
