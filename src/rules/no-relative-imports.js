export default {
  meta: {
    type: 'problem',
    docs: {
      description: '상대 경로 import를 금지하고, 프로젝트에서 설정한 alias 사용을 강제합니다.',
      recommended: true,
    },
    messages: {
      noRelativePath: "🚨 '{{ importPath }}' 상대 경로 import를 사용할 수 없습니다. alias를 사용하세요.",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // 상대 경로인지 확인 (../ 또는 ./로 시작하는 경우)
        if (importPath.startsWith('../') || importPath.startsWith('./')) {
          context.report({
            node,
            messageId: 'noRelativePath',
            data: {
              importPath,
            },
          });
        }
      },
    };
  },
};