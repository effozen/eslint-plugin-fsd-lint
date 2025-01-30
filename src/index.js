import forbiddenImports from "./rules/fsd-forbidden-imports.js";
import noRelativeImports from "./rules/fsd-no-relative-imports.js";
import noPublicApiSidestep from "./rules/fsd-no-public-api-sidestep.js";
import noCrossSliceDependency from "./rules/fsd-no-cross-slice-dependency.js";
import noUiInBusinessLogic from "./rules/fsd-no-ui-in-business-logic.js";
import noGlobalStoreImports from "./rules/fsd-no-global-store-imports.js";
import orderedImports from "./rules/fsd-ordered-imports.js";

export default {
  rules: {
    "forbidden-imports": forbiddenImports, // Prevents forbidden imports between layers
    "no-relative-imports": noRelativeImports, // Enforces alias usage instead of relative imports
    "no-public-api-sidestep": noPublicApiSidestep, // Prevents direct imports bypassing the public API
    "no-cross-slice-dependency": noCrossSliceDependency, // Disallows direct dependencies between feature slices
    "no-ui-in-business-logic": noUiInBusinessLogic, // Ensures business logic does not import UI components
    "no-global-store-imports": noGlobalStoreImports, // Restricts direct imports of global store
    "ordered-imports": orderedImports // Enforces structured import grouping by FSD layers
  },
};