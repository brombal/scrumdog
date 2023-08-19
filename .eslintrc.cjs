const IS_GIT = Object.keys(process.env).some((k) => k.startsWith('GIT_'));
const NORMAL_WARNING_GIT_ERROR = IS_GIT ? 2 : 1;

const jsRules = {
  'no-empty': [
    NORMAL_WARNING_GIT_ERROR,
    {
      allowEmptyCatch: true,
    },
  ],

  // Warn on unused variables.
  // Rest siblings (i.e. { unused1, unused2, ...other }) are allowed.
  // Unused function params beginning with _ are allowed to account for express error handlers.
  // Note that this is upgraded to an error during git commits.
  'no-unused-vars': [
    NORMAL_WARNING_GIT_ERROR,
    { ignoreRestSiblings: true, argsIgnorePattern: '^_' },
  ],

  // Removes unused imports when running eslint.
  // Note that this is upgraded to an error during git commits.
  'unused-imports/no-unused-imports': NORMAL_WARNING_GIT_ERROR,

  // Off in favor of prettier plugin
  'import/order': 0,

  'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
  'import/no-duplicates': ['error', { 'prefer-inline': true }],

  'import/no-empty-named-blocks': 'error',

  // 'debugger' statements are only warnings because we want to allow them during local development
  // Note that this is upgraded to an error during git commits.
  'no-debugger': NORMAL_WARNING_GIT_ERROR,

  eqeqeq: 'error',

  'prettier/prettier': NORMAL_WARNING_GIT_ERROR,
};

const tsRules = {
  /** We warn about this to make you aware that require() is not recommended, but sometimes
   * needed. You should eslint-ignore any valid usages. */
  '@typescript-eslint/no-var-requires': 1,

  // The TS compiler will already error if it can't detect the return type from the code.
  // Forcing the return type is just too noisy sometimes.
  '@typescript-eslint/explicit-function-return-type': 0,
  '@typescript-eslint/explicit-module-boundary-types': 0,

  // This is up for debate. We currently use a lot of I-prefixes so it's disabled for now.
  // https://github.com/microsoft/TypeScript-Handbook/issues/121
  '@typescript-eslint/interface-name-prefix': 0,

  // Many of our API endpoints use snake_case.
  '@typescript-eslint/camelcase': 0,

  // This rule is too restrictive. Try not to use `any` if it's avoidable, but sometimes it's
  // necessary.
  '@typescript-eslint/no-explicit-any': 0,

  // Disables eslint rule in favor of typescript-specific rule.
  'no-unused-vars': 0,
  '@typescript-eslint/no-unused-vars': [
    NORMAL_WARNING_GIT_ERROR,
    { ignoreRestSiblings: true, argsIgnorePattern: '^_' },
  ],

  // Non null assertions (e.g. value!) are useful
  '@typescript-eslint/no-non-null-assertion': 0,

  '@typescript-eslint/consistent-type-imports': [
    NORMAL_WARNING_GIT_ERROR,
    { fixStyle: 'inline-type-imports' },
  ],
};

module.exports = {
  root: true,
  plugins: ['import', 'unused-imports'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  rules: jsRules,
  overrides: [
    {
      files: './**/*.{ts,tsx}',
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
      settings: {
        'import/resolver': {
          typescript: true,
          node: true,
        },
      },
      rules: {
        ...jsRules,
        ...tsRules,
      },
    },
  ],
};
