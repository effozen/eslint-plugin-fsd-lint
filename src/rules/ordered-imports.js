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

        const sourceCode = context.sourceCode || context.getSourceCode();
        const sourceText = sourceCode.getText();
        const sourceLines = sourceText.split("\n");

        // ✅ FSD Layer order (top to bottom)
        const layers = ["app", "processes", "pages", "widgets", "features", "entities", "shared"];

        // Group imports by FSD layer
        const groupedImports = layers.reduce((acc, layer) => {
          acc[layer] = [];
          return acc;
        }, {});

        // Imports that are NOT part of the FSD structure
        const nonFSDImports = [];

        // 모든 주석 가져오기
        const allComments = sourceCode.getAllComments ?
          sourceCode.getAllComments() :
          sourceCode.getComments(node).leading.concat(sourceCode.getComments(node).trailing);

        // 첫 번째 import의 시작 위치와 마지막 import의 끝 위치 저장
        const firstImportStart = importNodes[0].range[0];
        const lastImportEnd = importNodes[importNodes.length - 1].range[1];

        // 각 import 노드와 그 앞의 모든 내용(주석 + 빈 줄) 함께 처리
        for (let i = 0; i < importNodes.length; i++) {
          const importNode = importNodes[i];
          const importPath = importNode.source.value;

          // 이전 노드의 끝 위치 (또는 처음이면 파일 시작)
          const prevNodeEnd = i > 0 ? importNodes[i-1].range[1] : 0;

          // 이전 노드와 현재 노드 사이의 모든 텍스트 가져오기 (빈 줄 + 주석 포함)
          let precedingText = "";
          if (i === 0) {
            // 첫 번째 import면 파일 시작부터 import 시작 전까지의 텍스트 가져오기
            // 단, 이 부분이 import 블록과 관련된 내용인지 확인
            const startLine = importNode.loc.start.line;
            let relevantStart = 0;

            // 관련된 빈 줄과 주석 찾기
            for (let line = startLine - 1; line >= 1; line--) {
              const lineText = sourceLines[line - 1];
              // 의미 있는 코드(import가 아닌)를 만나면 중단
              if (lineText.trim() !== "" &&
                !lineText.trim().startsWith("//") &&
                !lineText.trim().startsWith("/*") &&
                !lineText.trim().startsWith("*")) {
                break;
              }
              relevantStart = sourceLines.slice(0, line - 1).join("\n").length;
              if (line > 1) relevantStart += 1; // 줄바꿈 문자 고려
            }

            if (relevantStart > 0) {
              precedingText = sourceText.substring(relevantStart, importNode.range[0]);
            }
          } else {
            // 다른 import면 이전 import 끝부터 현재 import 시작까지의 텍스트
            precedingText = sourceText.substring(prevNodeEnd, importNode.range[0]);
          }

          // import 텍스트
          const importText = sourceCode.getText(importNode);

          // 전체 텍스트 (빈 줄 + 주석 + import)
          const combinedText = precedingText + importText;

          // 레이어에 따라 분류
          const layer = layers.find(l => importPath.includes(`/${l}/`));

          if (layer) {
            groupedImports[layer].push({ node: importNode, text: combinedText });
          } else {
            nonFSDImports.push({ node: importNode, text: combinedText });
          }
        }

        // 레이어별로 정렬된 import 생성
        const sortedImports = layers.flatMap(layer => groupedImports[layer]);

        // 비 FSD import를 앞에 배치
        const finalImportOrder = [...nonFSDImports, ...sortedImports];

        // 정렬된 import의 전체 텍스트 생성
        // 첫 번째 항목의 앞부분 공백은 제거 (첫 번째 import 앞의 주석/빈 줄만 유지)
        let sortedImportText = "";

        finalImportOrder.forEach((item, index) => {
          if (index === 0) {
            // 첫 번째 항목은 앞의 불필요한 줄바꿈 제거
            sortedImportText += item.text.trimStart();
          } else {
            sortedImportText += item.text;
          }
        });

        // 원본 import 블록 텍스트
        const originalText = sourceText.substring(firstImportStart, lastImportEnd);

        // 변경이 필요한지 확인
        if (originalText.trim() !== sortedImportText.trim()) {
          context.report({
            node: importNodes[0],
            messageId: "incorrectGrouping",
            data: {
              currentImport: importNodes[0].source.value,
            },
            fix(fixer) {
              return fixer.replaceTextRange([firstImportStart, lastImportEnd], sortedImportText);
            },
          });
        }
      },
    };
  },
};