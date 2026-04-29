import { ESLint } from "eslint";
import tsParser from "@typescript-eslint/parser";
import { describe, expect, it } from "vitest";

import fsdPlugin from "../src/index.js";

function createEslint(ruleOptions = {}) {
  return new ESLint({
    overrideConfigFile: true,
    ignore: false,
    overrideConfig: [
      {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
          parser: tsParser,
          ecmaVersion: 2022,
          sourceType: "module",
        },
        plugins: {
          fsd: fsdPlugin,
        },
        rules: {
          "fsd/forbidden-imports": ["error", ruleOptions],
        },
      },
    ],
  });
}

async function lintText(code, filePath, ruleOptions) {
  const eslint = createEslint(ruleOptions);
  const [result] = await eslint.lintText(code, { filePath });

  return result.messages;
}

describe("forbidden-imports same-slice aliases", () => {
  it("allows issue #26 pages same-slice imports with slash aliases", async () => {
    const messages = await lintText(
      `
        import { articleSections } from "@/pages/articles/api/queries";
        import { ArticlesLayout } from "@/pages/articles/ui/articles-page";
      `,
      "apps/web/src/pages/articles/ui/articles-pending-page.tsx",
      {
        rootPath: "/apps/web/src/",
        alias: {
          value: "@",
          withSlash: true,
        },
      },
    );

    expect(messages).toEqual([]);
  });

  it("keeps reporting pages cross-slice imports with slash aliases", async () => {
    const messages = await lintText(
      'import { ProfilePage } from "@/pages/profile/ui/profile-page";',
      "apps/web/src/pages/articles/ui/articles-pending-page.tsx",
      {
        rootPath: "/apps/web/src/",
        alias: {
          value: "@",
          withSlash: true,
        },
      },
    );

    expect(messages.map((message) => message.ruleId)).toEqual([
      "fsd/forbidden-imports",
    ]);
  });

  it("allows same-slice imports with default non-slash aliases", async () => {
    const messages = await lintText(
      'import { session } from "@features/auth/model/session";',
      "src/features/auth/ui/LoginForm.tsx",
    );

    expect(messages).toEqual([]);
  });

  it("keeps reporting cross-slice imports with default non-slash aliases", async () => {
    const messages = await lintText(
      'import { profileService } from "@features/profile/model/service";',
      "src/features/auth/ui/LoginForm.tsx",
    );

    expect(messages.map((message) => message.ruleId)).toEqual([
      "fsd/forbidden-imports",
    ]);
  });

  it("supports same-slice aliases when a layer folder is renamed", async () => {
    const ruleOptions = {
      rootPath: "/renamed/src/",
      alias: {
        value: "~",
        withSlash: true,
      },
      layers: {
        pages: {
          pattern: "screens",
        },
      },
    };

    await expect(
      lintText(
        'import { selectDashboardTitle } from "~/screens/dashboard/model/selectors";',
        "renamed/src/screens/dashboard/ui/DashboardScreen.tsx",
        ruleOptions,
      ),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import { selectProfileTitle } from "~/screens/profile/model/selectors";',
        "renamed/src/screens/dashboard/ui/DashboardScreen.tsx",
        ruleOptions,
      ),
    ).resolves.toHaveLength(1);
  });

  it("does not weaken normal layer direction checks", async () => {
    await expect(
      lintText(
        'import { Header } from "@widgets/header";',
        "src/pages/dashboard/ui/DashboardPage.tsx",
      ),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import { DashboardPage } from "@pages/dashboard";',
        "src/entities/user/model/user.ts",
      ),
    ).resolves.toHaveLength(1);
  });
});
