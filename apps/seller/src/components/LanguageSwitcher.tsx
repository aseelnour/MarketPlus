import React from "react";
import { useLanguage } from "../hooks/useLanguage";
import { Globe } from "lucide-react";

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-dark-400" />
      <button
        onClick={() => changeLanguage(currentLanguage === "en" ? "ar" : "en")}
        className="px-3 py-1 rounded-lg text-sm font-medium bg-dark-700 hover:bg-dark-600 text-dark-300 transition-colors"
      >
        {currentLanguage === "en" ? "العربية" : "EN"}
      </button>
    </div>
  );
};
