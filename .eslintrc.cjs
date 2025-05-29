module.exports = {
  root: true,
  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  plugins: [
    'react-refresh'
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      {
        allowConstantExport: true,
        allowExportNames: ['useSession', 'useSidebar'],
      },
    ],
    'import/extensions': 'off',
    'eol-last': ['error', 'always'],
    indent: ['error', 2],
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    'comma-dangle': ['error', 'always-multiline'],
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: ['dist', 'eslint.config.js'],
}; 