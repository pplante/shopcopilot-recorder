import { resolve } from 'node:path'
import antfu from '@antfu/eslint-config'

export default await antfu({
  extends: './.wxt/eslintrc-auto-import.json',
  env: {
    browser: true,
    node: true,
  },
  ignores: [
    '.output',
    '.wxt',
    'supabase',
    'node_modules',
    'public',
    'types',
  ],
  stylistic: { maxLineLength: 100 },
  typescript: {
    tsconfigPath: resolve(process.cwd(), 'tsconfig.json'),
  },
}, {
  files: ['**/*.ts'],
  rules: {
    // fixes issues when passing any Vue component to createApp in a typescript code.
    'ts/no-unsafe-argument': 'off',
  },
})
