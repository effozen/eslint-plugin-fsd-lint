import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import fsdPlugin from "../src/index.js";

async function lintWithConfig(
  config,
  code,
  filePath = "src/features/auth/model/file.ts",
) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    ignore: false,
    overrideConfig: [
      {
        files: ["**/*.ts"],
        ...config,
      },
    ],
  });

  const [result] = await eslint.lintText(code, { filePath });
  return result.messages;
}

describe("preset configs", () => {
  const invalidImport = 'import { LoginPage } from "@pages/login";';

  it("recommended preset applies rules with the fsd namespace", async () => {
    const messages = await lintWithConfig(
      fsdPlugin.configs.recommended,
      invalidImport,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].ruleId).toBe("fsd/forbidden-imports");
    expect(messages[0].severity).toBe(2);
  });

  it("strict preset keeps forbidden-imports as an error", async () => {
    const messages = await lintWithConfig(
      fsdPlugin.configs.strict,
      invalidImport,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].ruleId).toBe("fsd/forbidden-imports");
    expect(messages[0].severity).toBe(2);
  });

  it("strict preset requires slice-level public API imports", async () => {
    const messages = await lintWithConfig(
      fsdPlugin.configs.strict,
      'import { userModel } from "@entities/user/model";',
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].ruleId).toBe("fsd/no-public-api-sidestep");
    expect(messages[0].severity).toBe(2);
  });

  it("strict preset enforces public API imports for shared", async () => {
    const messages = await lintWithConfig(
      fsdPlugin.configs.strict,
      'import { Button } from "@shared/ui/Button";',
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].ruleId).toBe("fsd/no-public-api-sidestep");
    expect(messages[0].severity).toBe(2);
  });

  it("base preset downgrades forbidden-imports to a warning", async () => {
    const messages = await lintWithConfig(
      fsdPlugin.configs.base,
      invalidImport,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].ruleId).toBe("fsd/forbidden-imports");
    expect(messages[0].severity).toBe(1);
  });
});
