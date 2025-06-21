
/// <reference types="vite/client" />

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, options?: any) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              place_id?: string;
              formatted_address?: string;
              geometry?: {
                location: {
                  lat: () => number;
                  lng: () => number;
                };
              };
              address_components?: Array<{
                long_name: string;
                short_name: string;
                types: string[];
              }>;
            };
          };
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

declare global {
  namespace JSX {
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
}

export {};
