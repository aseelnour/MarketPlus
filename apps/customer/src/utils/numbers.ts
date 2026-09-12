export const toArabicNumber = (val: number | string): string => {
  if (val === null || val === undefined) return "٠";

  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  return String(val)
    .replace(/\d/g, (digit) => arabicDigits[parseInt(digit, 10)])
    .replace(/\./g, "٫"); 
};

export const formatNumber = (
  val: number | string,
  lang: string = "en",
): string => {
  if (val === null || val === undefined) return "0";

  if (lang === "ar") {
    return toArabicNumber(val);
  }
  return String(val);
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

export const formatCurrency = (
  amount: number,
  lang: string = "en",
  currency: string = "USD",
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";

  return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
