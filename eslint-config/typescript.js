import typescript from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default [
  ...typescript.configs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    languageOptions: {
      parserOptions: {
        project: true
      }
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {args: 'none', varsIgnorePattern: '^unused'}],

      // https://stackoverflow.com/a/63961972
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',

      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define':
        ['error', {functions: false, ignoreTypeReferences: true}],

      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'error',

      'no-useless-function': 'off',
      '@typescript-eslint/no-useless-function': 'error',

      // Rules turned off for now
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
].map(config => ({files: ['**/*.{ts,cts,mts}'], ...config}));
