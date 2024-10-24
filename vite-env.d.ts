/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string
  readonly SUPABASE_PUBLIC_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __DEV__: boolean

declare const __FEATURES__: {
  COOKIE_MANAGEMENT: boolean
  PROXY_REQUESTS: boolean
  BLOCK_DEVTOOLS: boolean
}

interface Window {
  Etsy?: EtsyAppContext
}

declare interface EtsyAppContext {
  Context: {
    data: {
      initial_data: {
        dashboard: {
          shopSubdomainUrl: string
        }
      }
      shop_data: EtsyAppShopData
    }
  }
}

declare interface EtsyAppShopData {
  shop_id: number
  shop_name: string
  shop_email: string
  currency_code: string
  currency_symbol: string
  country: string
  country_id: number
  icon: EtsyAppShopIcon
}

declare interface EtsyAppShopIcon {
  key: string
  url: string
  image_id: number
  sources: EtsyAppShopIconSource[]
}

declare interface EtsyAppShopIconSource {
  width: number
  height: number
  url: string
}
