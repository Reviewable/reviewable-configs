import {fixupPluginRules} from '@eslint/compat';
import lodashPlugin from 'eslint-plugin-lodash';

const lodashConfig = lodashPlugin.configs.canonical;
// Compatibility with Flat configs and ESLint 10.
lodashConfig.plugins = {lodash: fixupPluginRules(lodashPlugin)};

export default [
  lodashConfig,
  {
    rules: {
      'lodash/chaining': ['error', 'implicit'],
      'lodash/prefer-filter': 'off',
      'lodash/prefer-invoke-map': 'off',
      'lodash/prop-shorthand': 'off',
      'lodash/matches-prop-shorthand': 'off',
      'lodash/prefer-immutable-method': 'off',
      'lodash/prefer-lodash-method': ['error', {ignoreMethods: ['split', 'replace']}],
      'lodash/prefer-map': 'off',
      'lodash/prefer-thru': 'off'
    }
  }
];
