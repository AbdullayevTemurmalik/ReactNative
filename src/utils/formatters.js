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
  if (!input) return '+998 ';
  const numbersOnly = input.replace(/\D/g, '');
  
  let localDigits = numbersOnly;
  if (localDigits.startsWith('998')) {
    localDigits = localDigits.substring(3);
  }
  
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

// Telefon kiritilganini tekshirish (kamida 9 ta raqam bo'lishi kifoya)
export const isPhoneValid = (phone) => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 9;
};

// Kuchli parol tekshiruvi (kamida 6 ta belgi, 1 ta harf va 1 ta raqam)
export const isPasswordStrong = (pass) => {
  if (!pass || pass.length < 6) return false;
  const hasLetter = /[a-zA-Z]/.test(pass);
  const hasDigit = /[0-9]/.test(pass);
  return hasLetter && hasDigit;
};

// Parol darajasini hisoblash (Oson [Qizil], O'rtacha [Sariq], Kuchli [Ko'k])
export const getPasswordStrength = (pass) => {
  if (!pass) {
    return {
      score: 0,
      label: '',
      label_ru: '',
      color: '#E2E8F0',
      percent: 0,
      desc: '',
      desc_ru: '',
    };
  }

  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

  if (score <= 2) {
    return {
      score: 1,
      label: 'Oson parol',
      label_ru: 'Простой пароль',
      color: '#EF4444', // Qizil
      bgColor: '#FEF2F2',
      percent: 33,
      desc: "Kamida 6 ta belgi, 1 ta harf va 1 ta raqam kiriting",
      desc_ru: 'Минимум 6 символов, 1 буква и 1 цифра',
    };
  } else if (score <= 3) {
    return {
      score: 2,
      label: "O'rtacha parol",
      label_ru: 'Средний пароль',
      color: '#F59E0B', // Sariq / Olovrang
      bgColor: '#FFFBEB',
      percent: 66,
      desc: "Bosh harflar yoki maxsus belgilar qo'shing",
      desc_ru: 'Добавьте заглавные буквы или символы',
    };
  } else {
    return {
      score: 3,
      label: 'Kuchli parol 🔥',
      label_ru: 'Надежный пароль 🔥',
      color: '#2563EB', // Ko'k (Royal Blue)
      bgColor: '#EFF6FF',
      percent: 100,
      desc: 'Parol juda xavfsiz va ishonchli',
      desc_ru: 'Пароль надежный и безопасный',
    };
  }
};
