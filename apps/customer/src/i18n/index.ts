
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "../locals/en.json";
import arTranslation from "../locals/ar.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  ar: {
    translation: arTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

const updateDirection = (lng: string) => {
  const isRTL = lng === "ar";

  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = lng;

  document.body.dir = isRTL ? "rtl" : "ltr";

  const root = document.getElementById("root");
  if (root) {
    root.dir = isRTL ? "rtl" : "ltr";
  }

  document.documentElement.classList.remove("ltr", "rtl");
  document.documentElement.classList.add(isRTL ? "rtl" : "ltr");
};

updateDirection(i18n.language);

i18n.on("languageChanged", updateDirection);

export default i18n;
