export const toArabicNumber = (num: number): string => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
};

export const formatNumber = (num: number, lang: string = "en"): string => {
  if (lang === "ar") {
    return toArabicNumber(num);
  }
  return String(num);
};

export const formatDate = (
  dateInput: string | Date,
  lang: string = "en",
): string => {
  const date = new Date(dateInput);
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  return date.toLocaleDateString(locale);
};

export const formatTime = (
  dateInput: string | Date,
  lang: string = "en",
): string => {
  const date = new Date(dateInput);
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  return date.toLocaleTimeString(locale);
};
