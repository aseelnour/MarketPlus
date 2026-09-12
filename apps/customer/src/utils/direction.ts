

export const updateDirection = (lang: string) => {
  const isRTL = lang === "ar";

  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = lang;

  document.body.dir = isRTL ? "rtl" : "ltr";
  document.body.className = isRTL ? "rtl" : "ltr";

  const root = document.getElementById("root");
  if (root) {
    root.dir = isRTL ? "rtl" : "ltr";
    root.className = isRTL ? "rtl" : "ltr";
  }

  document.documentElement.classList.remove("ltr", "rtl");
  document.documentElement.classList.add(isRTL ? "rtl" : "ltr");
};
