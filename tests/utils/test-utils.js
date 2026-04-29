/**
 * @fileoverview ESLint rule testing utilities
 */
import { describe, it } from "vitest";
import { RuleTester } from "eslint";
import tsParser from "@typescript-eslint/parser";

// Wire RuleTester to vitest so each ruleTester.run case becomes a real
// vitest test. Without this, RuleTester falls back to no-op handlers and
// silently skips every assertion.
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

// ESLint RuleTester configuration
export const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

function normalizeTestCase(testCase) {
  const normalized =
    typeof testCase === "string" ? { code: testCase } : { ...testCase };

  if (normalized.description && !normalized.name) {
    normalized.name = normalized.description;
  }

  delete normalized.description;
  return normalized;
}

/**
 * Helper function to add filename to test cases
 * @param {string} code - Code to test
 * @param {string} filename - File path
 * @returns {Object} - Object containing code and filename
 */
export function withFilename(code, filename) {
  return { code, filename };
}

/**
 * Helper function to add options to test cases
 * @param {Object} testCase - Test case
 * @param {Object} options - Options to add
 * @returns {Object} - Test case with options
 */
export function withOptions(testCase, options) {
  return { ...normalizeTestCase(testCase), options: [options] };
}

/**
 * ESLint rule test wrapper. RuleTester registers a vitest test per case
 * via the describe/it bindings above, so we hand it the full valid /
 * invalid arrays and let it expand them.
 * @param {string} ruleName - Rule name
 * @param {Object} rule - ESLint rule object
 * @param {Object} tests - Test cases (valid and invalid arrays)
 */
export function testRule(ruleName, rule, tests) {
  ruleTester.run(ruleName, rule, {
    valid: tests.valid.map(normalizeTestCase),
    invalid: tests.invalid.map(normalizeTestCase),
  });
}
