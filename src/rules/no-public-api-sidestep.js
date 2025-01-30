export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'features, widgets, entities 내부 파일을 직접 import하지 않고, index.ts를 통해 import하도록 강제합니다.',
      recommended: true,
    },
    messages: {
      noDirectImport:
        "🚨 '{{ importPath }}' 파일을 직접 import할 수 없습니다. 반드시 public API(index.ts)를 통해 import하세요.",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // 검사할 레이어 목록
        const restrictedLayers = ['features', 'entities', 'widgets'];

        // import 대상이 특정 레이어 내부 파일인지 확인
        const isRestrictedImport = restrictedLayers.some(
          (layer) => importPath.includes(`/${layer}/`) && !importPath.endsWith('index.ts')
        );

        if (isRestrictedImport) {
          context.report({
            node,
            messageId: 'noDirectImport',
            data: {
              importPath,
            },
          });
        }
      },
    };
  },
};