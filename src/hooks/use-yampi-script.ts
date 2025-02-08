
type YampiPlan = "basic" | "premium";

const YAMPI_SCRIPTS = {
  basic: "https://api.yampi.io/v2/teste1970/public/buy-button/59VB91DFBN/js",
  premium: "https://api.yampi.io/v2/teste1970/public/buy-button/G55W9F5YZK/js",
};

export function useYampiScript(plan: YampiPlan) {
  const loadScript = (modalOpen: boolean) => {
    if (!modalOpen) return () => {};

    const buttonDivId = `yampi-button-${plan}`;
    
    // Clean up any existing buttons in the document body
    const existingButtons = document.querySelectorAll('.ymp-btn-holder');
    existingButtons.forEach(button => button.remove());
    
    // Remove any existing scripts
    const existingScripts = document.querySelectorAll('.ymp-script');
    existingScripts.forEach(script => script.remove());

    // Create new script
    const script = document.createElement('script');
    script.src = YAMPI_SCRIPTS[plan];
    script.async = true;
    script.className = 'ymp-script';
    script.setAttribute('data-yampi-plan', plan);
    
    // Add script to modal
    const modalContent = document.querySelector('[role="dialog"]');
    if (modalContent) {
      modalContent.appendChild(script);
    }

    return () => {
      script.remove();
      const buttonDiv = document.getElementById(buttonDivId);
      if (buttonDiv) {
        buttonDiv.remove();
      }
      // Clean up any stray buttons
      const strayButtons = document.querySelectorAll('.ymp-btn-holder');
      strayButtons.forEach(button => button.remove());
    };
  };

  return { loadScript };
}
