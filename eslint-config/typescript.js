import typescript from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default [
  ...[
    ...typescript.configs.recommended,
    importPlugin.flatConfigs.typescript,
    {
      languageOptions: {
        parserOptions: {
          project: true
        }
      },
      settings: {
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true
          },
          node: {
            extensions: ['.js', '.mjs', '.cjs', '.ts', '.cts', '.mts', '.d.ts', '.json']
          }
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

        'no-empty-function': 'off',
        '@typescript-eslint/no-empty-function': 'error',

        // Rules turned off for now
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      }
    }
  ].map(config => ({files: ['**/*.{ts,cts,mts}'], ...config})),
  {
    files: ['**/*.test.{ts,cts,mts}'],
    rules: {
      '@typescript-eslint/no-floating-promises': ['error', {
        allowForKnownSafeCalls: [
          {from: 'package', package: 'node:test', name: ['describe', 'it', 'suite', 'test']}
        ]
      }],
      'no-restricted-syntax': ['error', {
        selector:
          "ExpressionStatement > CallExpression[callee.type='MemberExpression'][callee.property.name='test']",
        message: 'Subtests created with context.test() must be awaited or returned.'
      }, {
        selector:
          "ExpressionStatement > CallExpression[callee.type='MemberExpression'][callee.object.type='MemberExpression'][callee.object.property.name='test'][callee.property.name=/^(only|skip|todo)$/]",
        message: 'Subtests created with context.test.*() must be awaited or returned.'
      }]
    }
  }
];
