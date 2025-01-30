import fsdPlugin from './src/index.js';

export default [
  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      'fsd/no-relative-imports': 'error',
      'fsd/no-public-api-sidestep': 'error',
      'fsd/no-cross-slice-dependency': 'error',
      'fsd/no-ui-in-business-logic': 'error',
      'fsd/no-global-store-imports': 'error',
      'fsd/forbidden-imports': 'error',
      'fsd/ordered-imports': 'warn',
    },
  },
];