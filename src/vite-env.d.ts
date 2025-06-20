
/// <reference types="vite/client" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        placeholder?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

export {};
