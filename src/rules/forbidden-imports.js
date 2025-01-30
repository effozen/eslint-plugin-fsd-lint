export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'FSD 레이어 간 올바른 import 규칙을 강제합니다.',
      recommended: true,
    },
    messages: {
      invalidImport: "🚨 '{{ fromLayer }}' 레이어에서는 '{{ toLayer }}' 레이어를 import할 수 없습니다.",
    },
  },

  create(context) {
    // ✅ FSD 레이어 목록 (위에서 아래로)
    const layers = ['shared', 'entities', 'features', 'widgets', 'pages', 'processes', 'app'];

    return {
      ImportDeclaration(node) {
        const filePath = context.filename;
        const importPath = node.source.value;

        // 현재 파일이 속한 레이어 찾기
        const fromLayer = layers.find((layer) => filePath.includes(`/${layer}/`));
        // import 대상 파일이 속한 레이어 찾기
        const toLayer = layers.find((layer) => importPath.includes(`/${layer}/`));

        if (!fromLayer || !toLayer) {
          return; // 둘 중 하나라도 FSD 레이어에 속하지 않으면 검사하지 않음
        }

        // ✅ 올바른 경우 (상위 레이어가 하위 레이어를 import하는 경우) → 통과
        if (layers.indexOf(fromLayer) > layers.indexOf(toLayer)) {
          return;
        }

        // ❌ 잘못된 경우 (하위 레이어가 상위 레이어를 import하는 경우) → 경고 발생
        context.report({
          node,
          messageId: 'invalidImport',
          data: {
            fromLayer,
            toLayer,
          },
        });
      },
    };
  },
};