export default [
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        URL: "readonly",
        HTMLInputElement: "readonly",
        HTMLSelectElement: "readonly",
        MutationObserver: "readonly",
        CSS: "readonly",
        Object: "readonly",
        Array: "readonly",
        String: "readonly",
        Number: "readonly",
        Math: "readonly",
        Date: "readonly",
        JSON: "readonly",
        Promise: "readonly",
        Map: "readonly",
        Set: "readonly",
        RegExp: "readonly",
        Error: "readonly",
        // Chrome extension APIs
        chrome: "readonly"
      }
    },
    rules: {
      // Error prevention
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-undef": "error",
      "no-console": "off",
      "no-debugger": "warn",

      // Best practices
      "eqeqeq": ["error", "smart"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-return-await": "warn",
      "prefer-const": "warn",

      // Style (handled by Prettier, so minimal rules)
      "semi": ["error", "always"],
      "quotes": ["warn", "single", { "avoidEscape": true }]
    }
  },
  {
    // Background script uses ES modules
    files: ["src/background/*.js"],
    languageOptions: {
      sourceType: "module"
    }
  }
];
