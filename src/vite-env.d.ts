
/// <reference types="vite/client" />

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          PlaceAutocompleteElement: any;
          PlacesService: any;
          PlacesServiceStatus: {
            OK: string;
          };
        };
        event: {
          clearInstanceListeners: (instance: any) => void;
        };
      };
    };
    customElements?: {
      get: (name: string) => any;
    };
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmpx-placeautocomplete': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        placeholder?: string;
        theme?: string;
        style?: React.CSSProperties;
        className?: string;
        country?: string;
        types?: string;
        value?: string;
      };
    }
  }
}

export {};
