/**
 * @fileoverview Tests for ordered-imports rule
 */
import { testRule, withFilename, withOptions } from '../utils/test-utils.js';
import orderedImports from '../../src/rules/ordered-imports.js';

testRule('ordered-imports', orderedImports, {
  valid: [
    // Basic ordered imports
    {
      description: 'Correctly ordered imports (OK)',
      code: `
        import React from 'react';
        import { useDispatch } from 'react-redux';
        import { Button } from '@shared/ui/Button';
        import { User } from '@entities/user';
        import { LoginForm } from '@features/auth';
        import { Header } from '@widgets/header';
        import { HomePage } from '@pages/home';
        import { formatDate } from './utils';
      `,
    },
    {
      description: 'Correctly ordered imports with type imports (OK)',
      code: `
        import React from 'react';
        import type { FC } from 'react';
        import { useDispatch } from 'react-redux';
        import type { RootState } from 'react-redux';
        import { Button } from '@shared/ui/Button';
        import type { ButtonProps } from '@shared/ui/Button';
        import { User } from '@entities/user';
        import type { UserType } from '@entities/user';
        import { LoginForm } from '@features/auth';
        import type { LoginFormProps } from '@features/auth';
        import { Header } from '@widgets/header';
        import type { HeaderProps } from '@widgets/header';
        import { HomePage } from '@pages/home';
        import type { HomePageProps } from '@pages/home';
        import { formatDate } from './utils';
        import type { DateFormat } from './utils';
      `,
    },

    // Node modules and third-party imports
    {
      description: 'Correctly ordered node modules imports (OK)',
      code: `
        import React from 'react';
        import { useDispatch } from 'react-redux';
        import { something } from '@types/react';
      `,
    },
    {
      description: 'Correctly ordered third-party imports (OK)',
      code: `
        import React from 'react';
        import { useDispatch } from 'react-redux';
        import { something } from 'lodash';
      `,
    },

    // Type imports
    {
      description: 'Correctly ordered type imports (OK)',
      code: `
        import type { FC } from 'react';
        import type { RootState } from 'react-redux';
        import type { ButtonProps } from '@shared/ui/Button';
        import type { UserType } from '@entities/user';
        import type { LoginFormProps } from '@features/auth';
        import type { HeaderProps } from '@widgets/header';
        import type { HomePageProps } from '@pages/home';
        import type { DateFormat } from './utils';
      `,
    },

    // Dynamic imports
    {
      description: 'Correctly ordered dynamic imports (OK)',
      code: `
        const React = await import('react');
        const { useDispatch } = await import('react-redux');
        const { Button } = await import('@shared/ui/Button');
        const { User } = await import('@entities/user');
        const { LoginForm } = await import('@features/auth');
        const { Header } = await import('@widgets/header');
        const { HomePage } = await import('@pages/home');
        const { formatDate } = await import('./utils');
      `,
    },

    // Test file exceptions
    {
      description: 'Test file with unordered imports (exception)',
      ...withFilename(
        `
          import { Header } from '@widgets/header';
          import React from 'react';
          import { User } from '@entities/user';
        `,
        'src/features/auth/ui/LoginForm.test.tsx'
      ),
    },
    {
      description: 'Test file in testing directory (exception)',
      ...withFilename(
        `
          import { Header } from '@widgets/header';
          import React from 'react';
          import { User } from '@entities/user';
        `,
        'src/features/auth/testing/service.spec.ts'
      ),
    },

    // Custom configurations
    {
      description: 'Custom import order (OK)',
      ...withOptions(
        `
          import { User } from '@entities/user';
          import React from 'react';
          import { Button } from '@shared/ui/Button';
        `,
        {
          importOrder: ['entities', 'react', 'shared'],
        }
      ),
    },
    {
      description: 'Custom import groups (OK)',
      ...withOptions(
        `
          import React from 'react';
          import { useDispatch } from 'react-redux';
          import { Button } from '@shared/ui/Button';
          import { User } from '@entities/user';
          import { LoginForm } from '@features/auth';
          import { Header } from '@widgets/header';
          import { HomePage } from '@pages/home';
          import { formatDate } from './utils';
        `,
        {
          groups: ['react', 'react-redux', 'shared', 'entities', 'features', 'widgets', 'pages', 'relative'],
        }
      ),
    },
    {
      description: 'Custom import separators (OK)',
      ...withOptions(
        `
          import React from 'react';
          import { useDispatch } from 'react-redux';
          
          import { Button } from '@shared/ui/Button';
          
          import { User } from '@entities/user';
          
          import { LoginForm } from '@features/auth';
          
          import { Header } from '@widgets/header';
          
          import { HomePage } from '@pages/home';
          
          import { formatDate } from './utils';
        `,
        {
          separators: true,
        }
      ),
    },

    // Path variations
    {
      description: 'Windows path format (OK)',
      code: `
        import React from 'react';
        import { Button } from '@shared\\ui\\Button';
        import { User } from '@entities\\user';
        import { LoginForm } from '@features\\auth';
        import { Header } from '@widgets\\header';
        import { HomePage } from '@pages\\home';
        import { formatDate } from '.\\utils';
      `,
    },
    {
      description: 'Unix path format (OK)',
      code: `
        import React from 'react';
        import { Button } from '@shared/ui/Button';
        import { User } from '@entities/user';
        import { LoginForm } from '@features/auth';
        import { Header } from '@widgets/header';
        import { HomePage } from '@pages/home';
        import { formatDate } from './utils';
      `,
    },
    {
      description: 'Mixed path separators (OK)',
      code: `
        import React from 'react';
        import { Button } from '@shared/ui\\Button';
        import { User } from '@entities\\user';
        import { LoginForm } from '@features/auth';
        import { Header } from '@widgets\\header';
        import { HomePage } from '@pages/home';
        import { formatDate } from '.\\utils';
      `,
    },

    // Real-world scenarios
    {
      description: 'Import from hooks directory (OK)',
      code: `
        import React from 'react';
        import { useAuth } from '@features/auth/hooks';
        import { useUser } from '@entities/user/hooks';
        import { useSidebar } from '@widgets/header/hooks';
      `,
    },
    {
      description: 'Import from constants directory (OK)',
      code: `
        import React from 'react';
        import { API_ENDPOINTS } from '@features/auth/constants';
        import { USER_ROLES } from '@entities/user/constants';
        import { HEADER_HEIGHT } from '@widgets/header/constants';
      `,
    },
    {
      description: 'Import from utils directory (OK)',
      code: `
        import React from 'react';
        import { formatDate } from '@shared/utils/date';
        import { formatUserName } from '@entities/user/utils';
        import { formatSidebarTitle } from '@widgets/header/utils';
      `,
    },
  ],

  invalid: [
    // Basic unordered imports
    {
      description: 'Unordered imports (Forbidden)',
      code: `
        import { User } from '@entities/user';
        import React from 'react';
        import { Button } from '@shared/ui/Button';
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },
    {
      description: 'Unordered imports with type imports (Forbidden)',
      code: `
        import type { UserType } from '@entities/user';
        import type { FC } from 'react';
        import type { ButtonProps } from '@shared/ui/Button';
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },

    // Node modules and third-party imports
    {
      description: 'Unordered node modules imports (Forbidden)',
      code: `
        import { something } from '@types/react';
        import React from 'react';
        import { useDispatch } from 'react-redux';
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },
    {
      description: 'Unordered third-party imports (Forbidden)',
      code: `
        import { something } from 'lodash';
        import React from 'react';
        import { useDispatch } from 'react-redux';
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },

    // Type imports
    {
      description: 'Unordered type imports (Forbidden)',
      code: `
        import type { UserType } from '@entities/user';
        import type { FC } from 'react';
        import type { ButtonProps } from '@shared/ui/Button';
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },

    // Dynamic imports
    {
      description: 'Unordered dynamic imports (Forbidden)',
      code: `
        const { User } = await import('@entities/user');
        const React = await import('react');
        const { Button } = await import('@shared/ui/Button');
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },

    // Path variations
    {
      description: 'Windows path format (Forbidden)',
      code: `
        import { User } from '@entities\\user';
        import React from 'react';
        import { Button } from '@shared\\ui\\Button';
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },
    {
      description: 'Unix path format (Forbidden)',
      code: `
        import { User } from '@entities/user';
        import React from 'react';
        import { Button } from '@shared/ui/Button';
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },
    {
      description: 'Mixed path separators (Forbidden)',
      code: `
        import { User } from '@entities\\user';
        import React from 'react';
        import { Button } from '@shared/ui\\Button';
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },

    // Real-world scenarios
    {
      description: 'Unordered imports from hooks directory (Forbidden)',
      code: `
        import { useUser } from '@entities/user/hooks';
        import React from 'react';
        import { useAuth } from '@features/auth/hooks';
        import { useSidebar } from '@widgets/header/hooks';
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },
    {
      description: 'Unordered imports from constants directory (Forbidden)',
      code: `
        import { USER_ROLES } from '@entities/user/constants';
        import React from 'react';
        import { API_ENDPOINTS } from '@features/auth/constants';
        import { HEADER_HEIGHT } from '@widgets/header/constants';
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },
    {
      description: 'Unordered imports from utils directory (Forbidden)',
      code: `
        import { formatUserName } from '@entities/user/utils';
        import React from 'react';
        import { formatDate } from '@shared/utils/date';
        import { formatSidebarTitle } from '@widgets/header/utils';
      `,
      errors: [{ messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }, { messageId: 'unorderedImports' }],
    },

    // Complex scenarios
    {
      description: 'Multiple unordered imports (Forbidden)',
      code: `
        import { User } from '@entities/user';
        import React from 'react';
        import { Button } from '@shared/ui/Button';
        import { LoginForm } from '@features/auth';
        import { Header } from '@widgets/header';
        import { HomePage } from '@pages/home';
        import { formatDate } from './utils';
      `,
      errors: [
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
      ],
    },
    {
      description: 'Mixed ordered and unordered imports (Forbidden)',
      code: `
        import React from 'react';
        import { User } from '@entities/user';
        import { Button } from '@shared/ui/Button';
        import { LoginForm } from '@features/auth';
        import { Header } from '@widgets/header';
        import { HomePage } from '@pages/home';
        import { formatDate } from './utils';
      `,
      errors: [
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
      ],
    },
    {
      description: 'Nested unordered imports (Forbidden)',
      code: `
        import { User } from '@entities/user';
        import { AnotherUser } from '@entities/another-user';
        import React from 'react';
        import { Button } from '@shared/ui/Button';
        import { AnotherButton } from '@shared/ui/AnotherButton';
        import { LoginForm } from '@features/auth';
        import { AnotherLoginForm } from '@features/another-auth';
      `,
      errors: [
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
        { messageId: 'unorderedImports' },
      ],
    },
  ],
});
