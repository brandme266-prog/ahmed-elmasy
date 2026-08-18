import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Check if user has already dismissed it this session
      const dismissed = sessionStorage.getItem("pwa-dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("pwa-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-28 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[110] max-w-sm"
        >
          <div className="bg-card border border-primary/20 p-5 rounded-2xl shadow-2xl flex gap-4 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
            
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-cairo font-bold text-foreground text-sm">تثبيت تطبيق أحمد الماسي</h4>
              <p className="font-cairo text-xs text-muted-foreground mt-0.5">تسوق أسرع وتابع طلباتك بسهولة</p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleInstall} size="sm" className="font-cairo text-xs h-8 px-4">تثبيت</Button>
            </div>

            <button 
              onClick={handleDismiss}
              className="absolute top-2 left-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="إغلاق نافذة التثبيت"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPWA;
