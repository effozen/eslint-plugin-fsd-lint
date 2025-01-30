import noRelativeImports from './rules/no-relative-imports.js';
import noPublicApiSidestep from './rules/no-public-api-sidestep.js';
import noCrossSliceDependency from './rules/no-cross-slice-dependency.js';
import noUiInBusinessLogic from './rules/no-ui-in-business-logic.js';
import noGlobalStoreImports from './rules/no-global-store-imports.js';
import fsdLayerImports from './rules/forbidden-imports.js';
import orderedImports from './rules/ordered-imports.js';

export default {
  rules: {
    'no-relative-imports': noRelativeImports,
    'no-public-api-sidestep': noPublicApiSidestep,
    'no-cross-slice-dependency': noCrossSliceDependency,
    'no-ui-in-business-logic': noUiInBusinessLogic,
    'no-global-store-imports': noGlobalStoreImports,
    'forbidden-imports': fsdLayerImports,
    'ordered-imports': orderedImports,
  },
};