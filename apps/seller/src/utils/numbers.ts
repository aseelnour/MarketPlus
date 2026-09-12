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

export const formatCurrency = (
  amount: number,
  lang: string = "en",
  currency: string = "$",
): string => {
  const formatted = amount.toFixed(2);

  if (lang === "ar") {
    
    const parts = formatted.split(".");
    const integerPart = toArabicNumber(parseInt(parts[0]));
    const decimalPart = toArabicNumber(parseInt(parts[1]));
    return `${integerPart}.${decimalPart} ${currency}`;
  }

  return `${currency}${formatted}`;
};

export const formatPrice = (amount: number, lang: string = "en"): string => {
  const formatted = amount.toFixed(2);

  if (lang === "ar") {
    const parts = formatted.split(".");
    const integerPart = toArabicNumber(parseInt(parts[0]));
    const decimalPart = toArabicNumber(parseInt(parts[1]));
    return `${integerPart}.${decimalPart}`;
  }

  return formatted;
};
export const formatPhoneNumber = (
  phone: string,
  locale: string = "ar",
): string => {
  if (!phone) return "";
  if (!locale.startsWith("ar")) return phone;

  const englishToArabicDigits: { [key: string]: string } = {
    "0": "٠",
    "1": "١",
    "2": "٢",
    "3": "٣",
    "4": "٤",
    "5": "٥",
    "6": "٦",
    "7": "٧",
    "8": "٨",
    "9": "٩",
  };

  return phone.replace(/[0-9]/g, (w) => englishToArabicDigits[w]);
};
