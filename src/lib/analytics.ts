// Tipos compartilhados para analytics
export interface AnalyticsConfig {
  gtmId: string;
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const initializeGTM = () => {
  (function(w: Window, d: Document, s: 'script', l: string, i: string) {
    w[l] = w[l] || [];
    w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    const f = d.getElementsByTagName(s)[0];
    const j = d.createElement(s) as HTMLScriptElement;
    const dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode?.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-WPZJ22P');
};