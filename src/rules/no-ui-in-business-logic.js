export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'entities에서 widgets를 import하는 것을 금지합니다.',
      recommended: true,
    },
    messages: {
      noCrossUI:
        "🚨 '{{ fromLayer }}'에서 '{{ toLayer }}'을(를) import할 수 없습니다. UI는 비즈니스 로직을 몰라야 합니다.",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const filePath = context.filename;
        const importPath = node.source.value;

        // entities에서 widgets를 import하는 경우 감지
        if (filePath.includes('/entities/') && importPath.includes('/widgets/')) {
          context.report({
            node,
            messageId: 'noCrossUI',
            data: {
              fromLayer: 'entities',
              toLayer: 'widgets',
            },
          });
        }
      },
    };
  },
};