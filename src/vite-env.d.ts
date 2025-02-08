
/// <reference types="vite/client" />

interface YampiCheckoutType {
  init: () => void;
}

declare global {
  interface Window {
    YampiCheckout: YampiCheckoutType;
  }
}
