/**
 * @fileoverview ESLint rule testing utilities
 */
import { describe, it, expect } from 'vitest';
import { RuleTester } from 'eslint';

// ESLint RuleTester configuration
export const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

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
  return { ...testCase, options: [options] };
}

/**
 * ESLint rule test wrapper function
 * @param {string} ruleName - Rule name
 * @param {Object} rule - ESLint rule object
 * @param {Object} tests - Test cases (valid and invalid arrays)
 */
export function testRule(ruleName, rule, tests) {
  describe(ruleName, () => {
    it('valid cases', () => {
      tests.valid.forEach((test, index) => {
        const testDescription = test.description || `valid case #${index + 1}`;

        try {
          ruleTester.run(`${ruleName}_valid_${index}`, rule, {
            valid: [test],
            invalid: []
          });
        } catch (error) {
          console.error(`Test failed: ${testDescription}`);
          throw error;
        }
      });
    });

    it('invalid cases', () => {
      tests.invalid.forEach((test, index) => {
        const testDescription = test.description || `invalid case #${index + 1}`;

        try {
          ruleTester.run(`${ruleName}_invalid_${index}`, rule, {
            valid: [],
            invalid: [test]
          });
        } catch (error) {
          console.error(`Test failed: ${testDescription}`);
          throw error;
        }
      });
    });
  });
}