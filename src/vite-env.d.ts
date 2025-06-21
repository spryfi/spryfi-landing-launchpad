
/// <reference types="vite/client" />

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          PlacesService: any;
          PlacesServiceStatus: {
            OK: string;
          };
        };
      };
    };
    customElements?: {
      get: (name: string) => any;
    };
  }
}

export {};
