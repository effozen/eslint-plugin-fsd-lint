import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

import fsdPlugin from '../src/index.js';

function createEslint(ruleName, ruleOptions) {
  return new ESLint({
    overrideConfigFile: true,
    ignore: false,
    overrideConfig: [
      {
        files: ['**/*.ts'],
        plugins: {
          fsd: fsdPlugin,
        },
        rules: {
          [ruleName]: ['error', ruleOptions],
        },
      },
    ],
  });
}

async function lintText(ruleName, ruleOptions, code, filePath) {
  const eslint = createEslint(ruleName, ruleOptions);
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages;
}

describe('rootPath support', () => {
  const rootPathOptions = { rootPath: '/src/root/' };
  const filePath = 'src/root/features/auth/model/file.ts';

  it('accepts rootPath in forbidden-imports options', async () => {
    const messages = await lintText(
      'fsd/forbidden-imports',
      rootPathOptions,
      'import { LoginPage } from "@pages/login";',
      filePath
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].ruleId).toBe('fsd/forbidden-imports');
  });

  it('keeps same-slice imports valid for no-cross-slice-dependency', async () => {
    const messages = await lintText(
      'fsd/no-cross-slice-dependency',
      rootPathOptions,
      'import { authService } from "@features/auth/model/service";',
      filePath
    );

    expect(messages).toHaveLength(0);
  });

  it('flags cross-slice imports for no-cross-slice-dependency', async () => {
    const messages = await lintText(
      'fsd/no-cross-slice-dependency',
      rootPathOptions,
      'import { profileService } from "@features/profile/model/service";',
      filePath
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].ruleId).toBe('fsd/no-cross-slice-dependency');
  });
});
