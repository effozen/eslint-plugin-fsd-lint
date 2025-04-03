module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['fsd-lint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:fsd-lint/recommended',
  ],
  rules: {
    'fsd-lint/no-public-api-sidestep': 'error',
    'fsd-lint/no-cross-slice-dependency': 'error',
    'fsd-lint/no-relative-imports': 'error',
    'fsd-lint/no-ui-in-business-logic': 'error',
    'fsd-lint/ordered-imports': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
