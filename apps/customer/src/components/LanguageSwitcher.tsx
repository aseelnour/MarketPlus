import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative w-9 h-9 rounded-xl hover:bg-secondary/60 flex items-center justify-center transition-colors group"
      title={i18n.language === "en" ? "Switch to Arabic" : "التبديل للإنجليزية"}
    >
      <Globe
        size={18}
        className="text-foreground/70 group-hover:text-foreground"
      />
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-muted text-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {i18n.language === "en" ? "العربية" : "English"}
      </span>
    </button>
  );
};
