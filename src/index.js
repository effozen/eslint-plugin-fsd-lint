/**
 * @fileoverview ESLint plugin for Feature-Sliced Design architecture
 */

import forbiddenImports from "./rules/forbidden-imports.js";
import noCrossSliceDependency from "./rules/no-cross-slice-dependency.js";
import noGlobalStoreImports from "./rules/no-global-store-imports.js";
import noPublicApiSidestep from "./rules/no-public-api-sidestep.js";
import noRelativeImports from "./rules/no-relative-imports.js";
import noUiInBusinessLogic from "./rules/no-ui-in-business-logic.js";
import orderedImports from "./rules/ordered-imports.js";

// Export all rules
export const rules = {
  "forbidden-imports": forbiddenImports,
  "no-cross-slice-dependency": noCrossSliceDependency,
  "no-global-store-imports": noGlobalStoreImports,
  "no-public-api-sidestep": noPublicApiSidestep,
  "no-relative-imports": noRelativeImports,
  "no-ui-in-business-logic": noUiInBusinessLogic,
  "ordered-imports": orderedImports,
};

const plugin = {
  rules,
};

// Export configurations
export const configs = {
  recommended: {
    plugins: {
      fsd: plugin,
    },
    rules: {
      "fsd/forbidden-imports": "error",
      "fsd/no-cross-slice-dependency": "error",
      "fsd/no-global-store-imports": "error",
      "fsd/no-public-api-sidestep": "error",
      "fsd/no-relative-imports": "error",
      "fsd/no-ui-in-business-logic": "error",
      "fsd/ordered-imports": "warn",
    },
  },
  strict: {
    plugins: {
      fsd: plugin,
    },
    rules: {
      "fsd/forbidden-imports": "error",
      "fsd/no-cross-slice-dependency": "error",
      "fsd/no-global-store-imports": "error",
      "fsd/no-public-api-sidestep": [
        "error",
        {
          publicApi: {
            allowSegmentImports: false,
            enforceShared: true,
          },
        },
      ],
      "fsd/no-relative-imports": "error",
      "fsd/no-ui-in-business-logic": "error",
      "fsd/ordered-imports": "error",
    },
  },

  base: {
    plugins: {
      fsd: plugin,
    },
    rules: {
      "fsd/forbidden-imports": "warn",
      "fsd/no-cross-slice-dependency": "warn",
      "fsd/no-global-store-imports": "error",
      "fsd/no-public-api-sidestep": "warn",
      "fsd/no-relative-imports": "off",
      "fsd/no-ui-in-business-logic": "error",
      "fsd/ordered-imports": "warn",
    },
  },
};

plugin.configs = configs;

export default plugin;
