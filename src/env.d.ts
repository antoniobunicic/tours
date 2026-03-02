/// <reference types="astro/client" />

interface ImportMetaEnv {
  // PayPal — public key, safe to expose in browser
  readonly PUBLIC_PAYPAL_CLIENT_ID: string;
  // Google Calendar ICS feed URL (server-side only, not exposed to browser)
  readonly GOOGLE_CALENDAR_ICS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
