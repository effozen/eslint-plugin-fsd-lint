/**
 * @fileoverview Tests for no-global-store-imports rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import noGlobalStoreImports from '../../src/rules/no-global-store-imports.js';

testRule('no-global-store-imports', noGlobalStoreImports, {
  valid: [
    {
      description: 'Store access via hooks (OK)',
      code: 'import { useAppSelector, useAppDispatch } from "@shared/hooks";'
    },
    {
      description: 'Entity actions import (OK)',
      code: 'import { userActions } from "@entities/user";'
    },
    {
      description: 'Unrelated import (OK)',
      code: 'import { Button } from "@shared/ui/Button";'
    },
    {
      description: 'Relative path import (OK)',
      code: 'import { loginSlice } from "../model/slice";'
    },
    {
      description: 'Specific function import only (OK)',
      code: 'import { configureStore } from "@reduxjs/toolkit";'
    },
    {
      description: 'Local store (scoped store) import (OK)',
      code: 'import { loginStore } from "./store";'
    },
    {
      description: 'Data access function import (OK)',
      code: 'import { getUserData } from "@entities/user/model/selectors";'
    },
    {
      description: 'Feature reducer import (OK)',
      code: 'import { authReducer } from "@features/auth";'
    },
    {
      description: 'Test file importing store (exception)',
      ...withFilename('import { store } from "@app/store";', "src/features/auth/ui/LoginForm.test.tsx")
    },
    {
      description: 'Allowed path by configuration (OK)',
      ...withOptions(
        'import { store } from "@app/store/testing";',
        {
          allowedPaths: ['/store/testing']
        }
      )
    },
    {
      description: 'Custom forbidden paths (OK)',
      ...withOptions(
        'import { store } from "@app/store";',
        {
          forbiddenPaths: ['/global-store/']
        }
      )
    }
  ],

  invalid: [
    {
      description: 'Direct app layer store import (Forbidden)',
      code: 'import { store } from "@app/store";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: 'Direct shared layer store import (Forbidden)',
      code: 'import { store } from "@shared/store";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: 'Import via store/hooks path (Forbidden)',
      code: 'import { useStore } from "@shared/store/hooks";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: 'Direct Redux store import (Forbidden)',
      code: 'import { store } from "@app/store/redux";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: 'Direct Zustand store import (Forbidden)',
      code: 'import { globalStore } from "@app/store/zustand";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: 'Root reducer direct import (Forbidden)',
      code: 'import { rootReducer } from "@app/store/rootReducer";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: 'Multiple forbidden store imports (Forbidden)',
      code: `
        import { store } from "@app/store";
        import { rootReducer } from "@app/store/rootReducer";
      `,
      errors: [
        { messageId: "noGlobalStore" },
        { messageId: "noGlobalStore" }
      ],
    },
    {
      description: 'Renamed store import (Forbidden)',
      code: 'import { store as appStore } from "@app/store";',
      errors: [{ messageId: "noGlobalStore" }],
    },
    {
      description: 'Custom forbidden paths (Forbidden)',
      code: 'import { globalStore } from "@app/global-store";',
      options: [{
        forbiddenPaths: ['/global-store/']
      }],
      errors: [{ messageId: "noGlobalStore" }],
    }
  ],
});