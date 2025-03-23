/**
 * @fileoverview ESLint plugin for Feature-Sliced Design architecture
 */

import forbiddenImports from './rules/forbidden-imports.js';
import noCrossSliceDependency from './rules/no-cross-slice-dependency.js';
import noGlobalStoreImports from './rules/no-global-store-imports.js';
import noPublicApiSidestep from './rules/no-public-api-sidestep.js';
import noRelativeImports from './rules/no-relative-imports.js';
import noUiInBusinessLogic from './rules/no-ui-in-business-logic.js';
import orderedImports from './rules/ordered-imports.js';

// Export all rules
export const rules = {
  'forbidden-imports': forbiddenImports,
  'no-cross-slice-dependency': noCrossSliceDependency,
  'no-global-store-imports': noGlobalStoreImports,
  'no-public-api-sidestep': noPublicApiSidestep,
  'no-relative-imports': noRelativeImports,
  'no-ui-in-business-logic': noUiInBusinessLogic,
  'ordered-imports': orderedImports
};

// Export configurations
export const configs = {
  // Recommended configuration
  recommended: {
    plugins: ['fsd-lint'],
    rules: {
      'fsd-lint/forbidden-imports': 'error',
      'fsd-lint/no-cross-slice-dependency': 'error',
      'fsd-lint/no-global-store-imports': 'error',
      'fsd-lint/no-public-api-sidestep': 'error',
      'fsd-lint/no-relative-imports': 'error',
      'fsd-lint/no-ui-in-business-logic': 'error',
      'fsd-lint/ordered-imports': 'warn'
    }
  },

  // Strict configuration
  strict: {
    plugins: ['fsd-lint'],
    rules: {
      'fsd-lint/forbidden-imports': 'error',
      'fsd-lint/no-cross-slice-dependency': 'error',
      'fsd-lint/no-global-store-imports': 'error',
      'fsd-lint/no-public-api-sidestep': 'error',
      'fsd-lint/no-relative-imports': 'error',
      'fsd-lint/no-ui-in-business-logic': 'error',
      'fsd-lint/ordered-imports': 'error'
    }
  },

  // Base configuration (less strict)
  base: {
    plugins: ['fsd-lint'],
    rules: {
      'fsd-lint/forbidden-imports': 'warn',
      'fsd-lint/no-cross-slice-dependency': 'warn',
      'fsd-lint/no-global-store-imports': 'error',
      'fsd-lint/no-public-api-sidestep': 'warn',
      'fsd-lint/no-relative-imports': 'off',
      'fsd-lint/no-ui-in-business-logic': 'error',
      'fsd-lint/ordered-imports': 'warn'
    }
  }
};

// Default export for ESM
export default {
  rules,
  configs
};