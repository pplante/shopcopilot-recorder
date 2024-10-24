import presetRemToPx from '@unocss/preset-rem-to-px'
import { presetAttributify, presetIcons, presetUno, transformerCompileClass, transformerDirectives } from 'unocss'
import { defineConfig } from 'unocss/vite'
import presetAnimations from 'unocss-preset-animations'

export default defineConfig({
  presets: [
    presetRemToPx(),
    presetAttributify(),
    presetIcons(),
    presetAnimations(),
    presetUno({ prefix: 'sc-' }),
  ],
  transformers: [
    transformerDirectives(),
    transformerCompileClass(),
  ],
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|ts|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        './node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}',
      ],
    },
  },
})
