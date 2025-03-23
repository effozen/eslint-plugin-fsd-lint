/**
 * @fileoverview Tests for ordered-imports rule
 */
import { testRule } from '../utils/test-utils.js';
import orderedImports from '../../src/rules/ordered-imports.js';

testRule('ordered-imports', orderedImports, {
  valid: [
    {
      description: 'Already correctly ordered imports (OK)',
      code: `
import { fetchData } from "../api/api";

import { config } from "@app/config";
import { initAuth } from "@processes/auth";
import { ProfilePage } from "@pages/profile";
import { Header } from "@widgets/Header";
import { LoginForm } from "@features/auth";
import { User } from "@entities/user";
import { Button } from "@shared/ui";
      `
    },
    {
      description: 'Imports with correct layer grouping and spacing (OK)',
      code: `
// External imports
import React from 'react';
import { useState } from 'react';

// Relative imports
import { fetchData } from "../api/api";

// App layer
import { config } from "@app/config";

// Processes layer
import { initAuth } from "@processes/auth";

// Pages layer
import { ProfilePage } from "@pages/profile";

// Widgets layer
import { Header } from "@widgets/Header";

// Features layer
import { LoginForm } from "@features/auth";

// Entities layer
import { User } from "@entities/user";

// Shared layer
import { Button } from "@shared/ui";
      `
    },
    {
      description: 'Imports with comments preserved and correct order (OK)',
      code: `
// Relative path imports
import { fetchData } from "../api/api";

// App configuration
import { config } from "@app/config";
// Auth process
import { initAuth } from "@processes/auth";
// Pages
import { ProfilePage } from "@pages/profile";
// UI components
import { Header } from "@widgets/Header";
import { LoginForm } from "@features/auth";
import { User } from "@entities/user";
import { Button } from "@shared/ui";
      `
    },
    {
      description: 'Only non-FSD imports (OK)',
      code: `
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
      `
    },
    {
      description: 'Partial layer imports in correct order (OK)',
      code: `
import { config } from "@app/config";
import { LoginForm } from "@features/auth";
import { Button } from "@shared/ui";
      `
    },
    {
      description: 'Correctly ordered imports with @/shared format (OK)',
      code: `
import { config } from "@/app/config";
import { Header } from "@/widgets/Header";
import { LoginForm } from "@/features/auth";
import { Button } from "@/shared/ui";
      `,
      options: [{
        alias: { value: "@", withSlash: true }
      }]
    },
    {
      description: 'Custom layer order (OK)',
      code: `
import { Button } from "@shared/ui";
import { User } from "@entities/user";
import { LoginForm } from "@features/auth";
import { Header } from "@widgets/Header";
      `,
      options: [{
        customOrder: ['shared', 'entities', 'features', 'widgets']
      }]
    }
  ],

  invalid: [
    {
      description: 'Incorrectly ordered imports (should fix)',
      code: `
import { Button } from "@shared/ui";
import { User } from "@entities/user";
import { LoginForm } from "@features/auth";
import { Header } from "@widgets/Header";
import { ProfilePage } from "@pages/profile";
import { initAuth } from "@processes/auth";
import { config } from "@app/config";
import { fetchData } from "../api/api";
     `,
      errors: [{ messageId: "incorrectGrouping" }],
      output: `
import { fetchData } from "../api/api";

import { config } from "@app/config";
import { initAuth } from "@processes/auth";
import { ProfilePage } from "@pages/profile";
import { Header } from "@widgets/Header";
import { LoginForm } from "@features/auth";
import { User } from "@entities/user";
import { Button } from "@shared/ui";
     `,
    },
    {
      description: 'Imports with comments that need reordering (should fix)',
      code: `
// UI components
import { Button } from "@shared/ui";
// User related 
import { User } from "@entities/user";
// Auth feature
import { LoginForm } from "@features/auth";
// Header widget
import { Header } from "@widgets/Header";
     `,
      errors: [{ messageId: "incorrectGrouping" }],
      output: `
// Header widget
import { Header } from "@widgets/Header";
// Auth feature
import { LoginForm } from "@features/auth";
// User related 
import { User } from "@entities/user";
// UI components
import { Button } from "@shared/ui";
     `,
    },
    {
      description: 'Mixed import types with incorrect ordering (should fix)',
      code: `
import { Button } from "@shared/ui";
// This is an entity
import { User } from "@entities/user";
import { LoginForm } from "@features/auth";

// API imports
import { fetchData } from "../api/api";

import { config } from "@app/config";
     `,
      errors: [{ messageId: "incorrectGrouping" }],
      output: `
// API imports
import { fetchData } from "../api/api";

import { config } from "@app/config";
import { LoginForm } from "@features/auth";
// This is an entity
import { User } from "@entities/user";
import { Button } from "@shared/ui";
     `,
    },
    {
      description: 'Imports with blank lines between them (should fix)',
      code: `
import { Button } from "@shared/ui";

import { User } from "@entities/user";

import { LoginForm } from "@features/auth";

import { Header } from "@widgets/Header";

import { config } from "@app/config";
     `,
      errors: [{ messageId: "incorrectGrouping" }],
      output: `
import { config } from "@app/config";
import { Header } from "@widgets/Header";
import { LoginForm } from "@features/auth";
import { User } from "@entities/user";
import { Button } from "@shared/ui";
     `,
    },
    {
      description: 'Imports with complex comments and blank lines (should fix)',
      code: `
// Shared UI components
// These are reusable across the app
import { Button } from "@shared/ui";
import { Input } from "@shared/ui";

// Entity layer
// User model and components
import { User } from "@entities/user";

// Feature modules
import { LoginForm } from "@features/auth";

// App configuration
import { config } from "@app/config";
     `,
      errors: [{ messageId: "incorrectGrouping" }],
      output: `
// App configuration
import { config } from "@app/config";

// Feature modules
import { LoginForm } from "@features/auth";

// Entity layer
// User model and components
import { User } from "@entities/user";

// Shared UI components
// These are reusable across the app
import { Button } from "@shared/ui";
import { Input } from "@shared/ui";
     `,
    },
    {
      description: '@/shared format with incorrect ordering (should fix)',
      code: `
import { Button } from "@/shared/ui";
import { User } from "@/entities/user";
import { ProfilePage } from "@/pages/profile";
     `,
      options: [{
        alias: { value: "@", withSlash: true }
      }],
      errors: [{ messageId: "incorrectGrouping" }],
      output: `
import { ProfilePage } from "@/pages/profile";
import { User } from "@/entities/user";
import { Button } from "@/shared/ui";
     `,
    }
  ],
});