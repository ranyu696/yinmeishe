/** @type {import("eslint").Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:@typescript-eslint/recommended',
    'plugin:tailwindcss/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all', // 对所有声明的变量进行检查，确保它们被使用
        varsIgnorePattern: '^_', // 对名称以 `_` 开头的变量忽略检查
        args: 'after-used', // 只检查函数参数中未使用的部分
        argsIgnorePattern: '^_', // 对名称以 `_` 开头的函数参数忽略检查
      },
    ],
    '@typescript-eslint/require-await': 'off',
    'tailwindcss/no-custom-classname': 'off',
    'react/jsx-curly-brace-presence': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
  },
}
module.exports = config
