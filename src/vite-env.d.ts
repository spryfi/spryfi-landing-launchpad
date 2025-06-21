
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

// Declare custom Google Maps Extended Components
declare namespace JSX {
  interface IntrinsicElements {
    'gmpx-placeautocomplete': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      id?: string;
      placeholder?: string;
      theme?: string;
      style?: React.CSSProperties;
      className?: string;
    };
  }
}

export {};
