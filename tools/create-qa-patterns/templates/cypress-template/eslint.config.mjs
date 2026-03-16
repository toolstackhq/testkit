import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const cypressGlobals = {
  Cypress: "readonly",
  cy: "readonly",
  describe: "readonly",
  it: "readonly",
  before: "readonly",
  beforeEach: "readonly",
  after: "readonly",
  afterEach: "readonly"
};

const nodeGlobals = {
  process: "readonly",
  console: "readonly"
};

export default [
  {
    ignores: ["demo-apps/**", "node_modules/**", "reports/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json"
      },
      globals: {
        ...cypressGlobals,
        ...nodeGlobals
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        fetch: "readonly",
        setTimeout: "readonly"
      }
    }
  },
  {
    files: ["cypress/e2e/**/*.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "cy",
          property: "get",
          message: "Keep selectors in support/page modules or custom commands, not in spec files."
        },
        {
          object: "cy",
          property: "contains",
          message: "Keep selectors in support/page modules or custom commands, not in spec files."
        }
      ]
    }
  },
  {
    files: ["cypress/support/pages/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name='expect']",
          message: "Keep assertions in Cypress spec files."
        }
      ]
    }
  }
];
