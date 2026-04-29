import { ESLint } from "eslint";
import tsParser from "@typescript-eslint/parser";
import { describe, expect, it } from "vitest";

import fsdPlugin from "../src/index.js";

const fixtureOptions = {
  rootPath: "/tests/fixtures/resolve-project/src/",
};

const allArchitecturalRules = {
  "fsd/forbidden-imports": ["error", fixtureOptions],
  "fsd/no-cross-slice-dependency": ["error", fixtureOptions],
  "fsd/no-public-api-sidestep": ["error", fixtureOptions],
};

function createEslint(rules) {
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
        rules,
      },
    ],
  });
}

async function lintText(code, filePath, rules = allArchitecturalRules) {
  const eslint = createEslint(rules);
  const [result] = await eslint.lintText(code, { filePath });

  return result.messages;
}

function ruleIds(messages) {
  return messages.map((message) => message.ruleId);
}

describe("latest FSD architectural rules", () => {
  it.each([
    [
      "app can import pages",
      'import { ArticlesLayout } from "@articles/ui/articles-page";',
      "tests/fixtures/resolve-project/src/app/providers/AppProvider.tsx",
      [],
    ],
    [
      "pages can import features",
      'import { authPublicApi } from "@auth";',
      "tests/fixtures/resolve-project/src/pages/articles/ui/articles-page.tsx",
      [],
    ],
    [
      "features can import entities",
      'import { userPublicApi } from "@user";',
      "tests/fixtures/resolve-project/src/features/auth/model/session.ts",
      [],
    ],
    [
      "entities cannot import features",
      'import { authPublicApi } from "@auth";',
      "tests/fixtures/resolve-project/src/entities/user/model/session.ts",
      ["fsd/forbidden-imports"],
    ],
    [
      "shared cannot import entities",
      'import { userPublicApi } from "@user";',
      "tests/fixtures/resolve-project/src/shared/lib/date.ts",
      ["fsd/forbidden-imports"],
    ],
    [
      "features cannot import widgets",
      'import { Header } from "@/widgets/header";',
      "tests/fixtures/resolve-project/src/features/auth/model/session.ts",
      ["fsd/forbidden-imports"],
    ],
  ])("%s", async (_name, code, filePath, expectedRuleIds) => {
    const messages = await lintText(code, filePath, {
      "fsd/forbidden-imports": [
        "error",
        {
          ...fixtureOptions,
          alias: {
            value: "@",
            withSlash: true,
          },
        },
      ],
    });

    expect(ruleIds(messages)).toEqual(expectedRuleIds);
  });

  it.each([
    [
      "pages cross-slice is blocked",
      'import { ProfilePage } from "@profile/ui/profile-page";',
      "tests/fixtures/resolve-project/src/pages/articles/ui/articles-page.tsx",
      ["fsd/forbidden-imports", "fsd/no-cross-slice-dependency"],
    ],
    [
      "features cross-slice is blocked",
      'import { authSession } from "@auth/model/session";',
      "tests/fixtures/resolve-project/src/features/profile/ui/ProfilePage.tsx",
      [
        "fsd/forbidden-imports",
        "fsd/no-cross-slice-dependency",
        "fsd/no-public-api-sidestep",
      ],
    ],
    [
      "same page slice hidden alias is allowed",
      'import { articleSections } from "@articles/api/queries";',
      "tests/fixtures/resolve-project/src/pages/articles/ui/articles-page.tsx",
      [],
    ],
  ])("%s", async (_name, code, filePath, expectedRuleIds) => {
    const messages = await lintText(code, filePath);

    expect(ruleIds(messages)).toEqual(expectedRuleIds);
  });

  it("does not treat app and shared internals as cross-slice imports", async () => {
    await expect(
      lintText(
        'import { initProviders } from "./providers/init";',
        "tests/fixtures/resolve-project/src/app/App.tsx",
      ),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import { formatDate } from "../lib/date";',
        "tests/fixtures/resolve-project/src/shared/ui/button/index.ts",
      ),
    ).resolves.toEqual([]);
  });

  it("allows entities @x public APIs only for the declared consumer slice", async () => {
    await expect(
      lintText(
        'import type { SongForArtist } from "@song/@x/artist";',
        "tests/fixtures/resolve-project/src/entities/artist/model/artist.ts",
      ),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import type { SongForArtist } from "@song-for-artist";',
        "tests/fixtures/resolve-project/src/entities/artist/model/artist.ts",
      ),
    ).resolves.toEqual([]);

    const wrongConsumerMessages = await lintText(
      'import type { SongForArtist } from "@song/@x/artist";',
      "tests/fixtures/resolve-project/src/entities/playlist/model/playlist.ts",
    );

    expect(ruleIds(wrongConsumerMessages)).toEqual([
      "fsd/forbidden-imports",
      "fsd/no-cross-slice-dependency",
      "fsd/no-public-api-sidestep",
    ]);
  });

  it("keeps non-@x entity internals private across entity slices", async () => {
    const messages = await lintText(
      'import { songInternal } from "@song/model/song";',
      "tests/fixtures/resolve-project/src/entities/artist/model/artist.ts",
    );

    expect(ruleIds(messages)).toEqual([
      "fsd/forbidden-imports",
      "fsd/no-cross-slice-dependency",
      "fsd/no-public-api-sidestep",
    ]);
  });

  it("does not let higher layers use an entities @x API as a general public API", async () => {
    const messages = await lintText(
      'import type { SongForArtist } from "@song/@x/artist";',
      "tests/fixtures/resolve-project/src/features/auth/model/session.ts",
    );

    expect(ruleIds(messages)).toEqual(["fsd/no-public-api-sidestep"]);
  });

  it("keeps public API imports valid when tsconfig paths point to index files", async () => {
    await expect(
      lintText(
        'import { songPublicApi } from "@song";',
        "tests/fixtures/resolve-project/src/features/auth/model/session.ts",
      ),
    ).resolves.toEqual([]);

    await expect(
      lintText(
        'import { userPublicApi } from "@user";',
        "tests/fixtures/resolve-project/src/pages/articles/ui/articles-page.tsx",
      ),
    ).resolves.toEqual([]);
  });

  it("falls back to legacy FSD path parsing when files are unresolved", async () => {
    const messages = await lintText(
      'import { profileService } from "@features/profile/model/service";',
      "src/features/auth/ui/LoginForm.tsx",
      {
        "fsd/forbidden-imports": "error",
        "fsd/no-cross-slice-dependency": "error",
        "fsd/no-public-api-sidestep": "error",
      },
    );

    expect(ruleIds(messages)).toEqual([
      "fsd/forbidden-imports",
      "fsd/no-cross-slice-dependency",
      "fsd/no-public-api-sidestep",
    ]);
  });

  it("handles dynamic imports through the same resolver path", async () => {
    const messages = await lintText(
      'const profile = await import("@profile/ui/profile-page");',
      "tests/fixtures/resolve-project/src/pages/articles/ui/articles-page.tsx",
      {
        "fsd/no-cross-slice-dependency": ["error", fixtureOptions],
      },
    );

    expect(messages.map((message) => message.messageId)).toEqual([
      "noSliceDependency",
    ]);
  });
});
