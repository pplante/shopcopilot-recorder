export const MANAGED_DOMAINS = [
  'etsy.com',
  'shop-test-bed.fly.dev',
  'notetsy.internal',
]

export const URL_FILTER_MATCHERS = MANAGED_DOMAINS.map(domain => `*://*.${domain}/*`)

export const MANAGED_TABS_MATCHERS = [
  ...URL_FILTER_MATCHERS,
  `chrome-extension://${import.meta.env.VITE_CRX_ID}/*`,
]

export const WEB_REQUEST_URL_FILTER = {
  urls: URL_FILTER_MATCHERS,
}

export const ALLOWED_ROOT_PATTERNS = URL_FILTER_MATCHERS.map(url => new MatchPattern(url))
