module.exports = {
  root: true,
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      extends: ['eslint:recommended', 'next', 'next/core-web-vitals', 'plugin:prettier/recommended'],
      rules: {},
    },
  ],
};
