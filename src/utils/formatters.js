// Narxni o'zbek so'mida formatlash (masalan: 12 500 000 so'm)
export const formatPrice = (price) => {
  if (price === undefined || price === null) return "0 so'm";
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
};

// Chegirma foizini hisoblash
export const getDiscountPercent = (oldPrice, price) => {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

// Matnni qisqartirish
export const truncateText = (text, maxLength = 25) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Telefon raqamini chiroyli formatlash (+998 90 123 45 67)
export const formatPhoneNumber = (input) => {
  // Faqat raqamlarni ajratib olamiz
  const numbersOnly = input.replace(/\D/g, '');
  
  // 998 bilan boshlanganini hisobga olamiz yoki olib tashlaymiz
  let localDigits = numbersOnly;
  if (localDigits.startsWith('998')) {
    localDigits = localDigits.substring(3);
  }
  
  // Maksimal 9 ta raqam (operator kodi + raqam)
  localDigits = localDigits.substring(0, 9);
  
  let formatted = '+998';
  if (localDigits.length > 0) {
    formatted += ' ' + localDigits.substring(0, 2);
  }
  if (localDigits.length >= 3) {
    formatted += ' ' + localDigits.substring(2, 5);
  }
  if (localDigits.length >= 6) {
    formatted += ' ' + localDigits.substring(5, 7);
  }
  if (localDigits.length >= 8) {
    formatted += ' ' + localDigits.substring(7, 9);
  }
  
  return formatted;
};

// Telefon to'liq kiritilganini tekshirish
export const isPhoneValid = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('998');
};
