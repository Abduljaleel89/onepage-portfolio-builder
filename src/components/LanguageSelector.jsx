import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getLanguage, setLanguage, getAvailableLanguages, t } from "@/lib/i18n";

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("en"); // Default to English to prevent hydration mismatch
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const languages = getAvailableLanguages();

  useEffect(() => {
    setIsClient(true);
    // Only read from localStorage on client side
    const lang = getLanguage();
    setCurrentLang(lang);
  }, []);

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
    // Force re-render by reloading the page (or use context/state management)
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const currentLanguageName = languages.find((l) => l.code === currentLang)?.name || "English";

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        className="premium-button"
        suppressHydrationWarning
      >
        🌐 {isClient ? currentLanguageName : "English"}
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-2 hover:bg-accent transition-colors ${
                  currentLang === lang.code ? "bg-primary/10 font-medium" : ""
                }`}
                aria-label={`Select ${lang.name} language`}
              >
                {lang.name}
                {currentLang === lang.code && " ✓"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

