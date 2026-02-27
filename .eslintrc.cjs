// Educational demonstration only — do not use on live platforms without explicit permission.
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  env: {
    node: true,
    es2022: true
  },
  rules: {
    'import/order': ['error', { alphabetize: { order: 'asc' } }]
  }
};
