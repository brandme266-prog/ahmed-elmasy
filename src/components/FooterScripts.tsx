import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FooterScripts = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (settings?.footer_scripts) {
      // Find and remove existing custom scripts to prevent duplicates on navigation
      const existing = document.getElementById('custom-footer-scripts');
      if (existing) existing.remove();

      const container = document.createElement('div');
      container.id = 'custom-footer-scripts';
      container.innerHTML = settings.footer_scripts;
      
      // Execute any scripts within the injected HTML
      const scripts = container.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = document.createElement('script');
        script.text = scripts[i].text;
        document.body.appendChild(script);
      }
      
      document.body.appendChild(container);
    }
  }, [settings?.footer_scripts]);

  return null;
};

export default FooterScripts;
