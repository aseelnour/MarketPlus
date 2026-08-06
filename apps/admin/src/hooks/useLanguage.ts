import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: "en" | "ar") => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("i18nextLng", lang);
  };

  const currentLanguage = i18n.language;

  return {
    currentLanguage,
    changeLanguage,
    isRTL: currentLanguage === "ar",
  };
};
