import type { Api } from './api/api' // <-- tu tipo que exporta la estructura de window.api

declare global {
  interface Window {
    api: Api
  }
}

export {}
