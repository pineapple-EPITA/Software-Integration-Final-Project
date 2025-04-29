import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: {
      'eslint-plugin-react': pluginReact, // Thêm plugin react
      '@typescript-eslint': tseslint, // Thêm plugin TypeScript
    },
    extends: [
      'plugin:@typescript-eslint/recommended', // Cấu hình chuẩn TypeScript
      'plugin:react/recommended', // Cấu hình chuẩn React
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
