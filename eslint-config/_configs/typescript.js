import typescript from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default [
  ...typescript.configs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {args: 'none', varsIgnorePattern: '^unused'}],

      // https://stackoverflow.com/a/63961972
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',

      // Rules turned off for now
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // These (recommended) rules require access to the parser which
      // isn't supported in TypeScript + Flat config environments yet.
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off'
    }
  }
];
