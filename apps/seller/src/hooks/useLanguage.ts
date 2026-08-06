import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "en");

  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng") || "en";
    i18n.changeLanguage(savedLang);
    setCurrentLanguage(savedLang);
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = savedLang;
  }, []);

  const changeLanguage = (lang: "en" | "ar") => {
    console.log("🌍 Changing language to:", lang);
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;

    window.location.reload();
  };

  return {
    currentLanguage,
    changeLanguage,
    isRTL: currentLanguage === "ar",
  };
};
