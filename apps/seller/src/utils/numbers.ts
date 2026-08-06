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
