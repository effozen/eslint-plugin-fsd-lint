export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'features 내부에서 다른 features를 직접 import하지 않고, 반드시 entities 또는 shared를 통해 의존하도록 강제합니다.',
      recommended: true,
    },
    messages: {
      noFeatureDependency:
        "🚨 '{{ fromFeature }}'에서 '{{ toFeature }}'을(를) 직접 import할 수 없습니다. 반드시 entities 또는 shared를 통해 의존하세요.",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const filePath = context.filename;
        const importPath = node.source.value;

        // features 내부에서 다른 features를 직접 import하는지 검사
        if (filePath.includes('/features/') && importPath.includes('/features/')) {
          const fromFeature = filePath.split('/features/')[1].split('/')[0];
          const toFeature = importPath.split('/features/')[1].split('/')[0];

          if (fromFeature !== toFeature) {
            context.report({
              node,
              messageId: 'noFeatureDependency',
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