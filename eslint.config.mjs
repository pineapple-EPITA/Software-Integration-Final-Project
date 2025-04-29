import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: ['@typescript-eslint', pluginReact],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended', 
      'plugin:react/recommended',
    ],
    parser: '@typescript-eslint/parser', 
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
