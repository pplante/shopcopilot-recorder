import { resolve } from 'node:path'
import process from 'node:process'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import vue from '@vitejs/plugin-vue'
import { config } from 'dotenv'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'wxt'

config()

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  imports: {
    addons: {
      vueTemplate: true,
    },
    eslintrc: {
      enabled: true,
    },
  },
  extensionApi: 'chrome',
  // modules: ['@wxt-dev/module-vue'],
  manifest: {
    key: process.env.VITE_CRX_PUBLIC_KEY,
    name: 'Shop Copilot Recorder',
    web_accessible_resources: [
      {
        matches: ['<all_urls>'],
        resources: [
          'rule-builder.html',
        ],
      },
    ],
    action: {},
    permissions: [
      'storage',
      'tabs',
      'sidePanel',
      'webRequest',
      'webNavigation',
      'declarativeNetRequest',
    ],
  },
  vite: () => ({
    define: {
      __DEV__: true,
      __FEATURES__: JSON.stringify({
        COOKIE_MANAGEMENT: true,
        PROXY_REQUESTS: false,
        BLOCK_DEVTOOLS: false,
      }),
    },
    plugins: [
      vue(),
      TurboConsole({
        specifiedEditor: 'webstorm',
      }),
      AutoImport({
        imports: [
          'vue',
        ],
        dts: resolve('src/types/auto-imports.d.ts'),
      }),

      // https://github.com/antfu/unplugin-vue-components
      Components({
        dirs: [resolve('src/components/')],
        dts: resolve('src/types/components.d.ts'),
        resolvers: [
          PrimeVueResolver(),
          // auto import icons
        ],
      }),

      // https://github.com/antfu/unplugin-icons
      Icons(),
      UnoCSS(),
    ],
    build: {
      // Enabling sourcemaps with Vue during development is known to cause problems with Vue
      sourcemap: false,
    },
    ssr: {
      noExternal: [
        '@webext-core/messaging',
        '@webext-core/storage',
      ],
    },
  }),
})
