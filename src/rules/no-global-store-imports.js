export default {
  meta: {
    type: 'problem',
    docs: {
      description: '전역 상태(store)를 직접 import하는 것을 금지합니다.',
      recommended: true,
    },
    messages: {
      noGlobalStore:
        "🚨 '{{ storeName }}' 전역 store를 직접 import할 수 없습니다. useStore 또는 useSelector를 사용하세요.",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // 전역 store 경로 패턴 (Redux, Zustand 등 고려)
        const forbiddenPatterns = ['/app/store', '/shared/store'];

        // 전역 store를 직접 import하는지 검사
        if (forbiddenPatterns.some((pattern) => importPath.includes(pattern))) {
          context.report({
            node,
            messageId: 'noGlobalStore',
            data: {
              storeName: importPath,
            },
          });
        }
      },
    };
  },
};