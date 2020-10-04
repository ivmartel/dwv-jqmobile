module.exports = {
  env: {
    browser: true,
    node: true,
    jquery: true,
    es6: true
  },
  globals: {
    dwv: 'readonly'
  },
  extends: 'eslint:recommended',
  rules: {
    // force 2 space indent
    indent: ['error', 2],
    // force single quotes (default 'double')
    quotes: ['error', 'single'],
    // no space for named functions (default 'always')
    'space-before-function-paren': ['error', { named: 'never' }]
  }
};
