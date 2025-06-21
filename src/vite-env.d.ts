
/// <reference types="vite/client" />

declare global {
  interface Window {
    customElements?: {
      get: (name: string) => any;
    };
  }
}

export {};
