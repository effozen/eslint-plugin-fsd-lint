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
          "fsd/no-public-api-sidestep": ["error", ruleOptions],
        },
      },
    ],
  });
}

async function lintText(
  code,
  ruleOptions,
  filePath = "src/features/profile/model/profile.ts",
) {
  const eslint = createEslint(ruleOptions);
  const [result] = await eslint.lintText(code, {
    filePath,
  });

  return result.messages;
}

function getMessageIds(messages) {
  return messages.map((message) => message.messageId);
}

describe("no-public-api-sidestep publicApi options", () => {
  it("keeps segment-level public API imports allowed by default", async () => {
    const messages = await lintText(
      `
        import { userModel } from "@entities/user/model";
        import { userUi } from "@entities/user/ui";
      `,
    );

    expect(messages).toEqual([]);
  });

  it("allows same-slice aliased internal imports", async () => {
    const messages = await lintText(
      `
        import { authSession } from "@features/auth/model/session";
        import { LoginFormView } from "@features/auth/ui/LoginFormView";
      `,
      undefined,
      "src/features/auth/ui/LoginForm.tsx",
    );

    expect(messages).toEqual([]);
  });

  it("keeps reporting cross-slice aliased internal imports", async () => {
    const messages = await lintText(
      'import { authSession } from "@features/auth/model/session";',
      undefined,
      "src/features/profile/ui/ProfilePage.tsx",
    );

    expect(getMessageIds(messages)).toEqual(["noDirectImport"]);
  });

  it("allows same-slice aliased internal imports when pages public APIs are enforced", async () => {
    const messages = await lintText(
      `
        import { articleSections } from "@/pages/articles/api/queries";
        import { ArticlesLayout } from "@/pages/articles/ui/articles-page";
      `,
      {
        rootPath: "/apps/web/src/",
        alias: {
          value: "@",
          withSlash: true,
        },
        publicApi: {
          enforceForLayers: ["pages"],
        },
      },
      "apps/web/src/pages/articles/ui/articles-pending-page.tsx",
    );

    expect(messages).toEqual([]);
  });

  it("can require slice-level public API imports only", async () => {
    const messages = await lintText(
      `
        import { User } from "@entities/user";
        import { UserIndex } from "@entities/user/index";
        import { userModel } from "@entities/user/model";
        import { userModelIndex } from "@entities/user/model/index";
      `,
      {
        publicApi: {
          allowSegmentImports: false,
        },
      },
    );

    expect(getMessageIds(messages)).toEqual([
      "noDirectImport",
      "noDirectImport",
    ]);
  });

  it("keeps shared unrestricted by default", async () => {
    const messages = await lintText(
      `
        import { Button } from "@shared/ui/Button";
        import { formatDate } from "@shared/lib/date";
      `,
    );

    expect(messages).toEqual([]);
  });

  it("can enforce public API imports for shared", async () => {
    const messages = await lintText(
      `
        import { SharedUi } from "@shared/ui";
        import { Button } from "@shared/ui/Button";
        import { formatDate } from "@shared/lib/date";
      `,
      {
        publicApi: {
          enforceShared: true,
        },
      },
    );

    expect(getMessageIds(messages)).toEqual([
      "noDirectImport",
      "noDirectImport",
    ]);
  });

  it("can require root public API imports for shared", async () => {
    const messages = await lintText(
      `
        import { sharedApi } from "@shared";
        import { sharedIndex } from "@shared/index";
        import { SharedUi } from "@shared/ui";
      `,
      {
        publicApi: {
          enforceShared: true,
          allowSegmentImports: false,
        },
      },
    );

    expect(getMessageIds(messages)).toEqual(["noDirectImport"]);
  });

  it("reports dynamic import expressions with the same public API options", async () => {
    const messages = await lintText(
      'const userModel = await import("@entities/user/model");',
      {
        publicApi: {
          allowSegmentImports: false,
        },
      },
    );

    expect(getMessageIds(messages)).toEqual(["noDirectImport"]);
  });

  it("ignores nonliteral dynamic import expressions", async () => {
    const messages = await lintText("const module = await import(modulePath);");

    expect(messages).toEqual([]);
  });
});
