import { PRODUCTS } from '../data/products';
import { formatPrice } from '../utils/formatters';

const decodeSecret = (b64) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = '';
  let i = 0;
  const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  while (i < clean.length) {
    const enc1 = chars.indexOf(clean.charAt(i++));
    const enc2 = chars.indexOf(clean.charAt(i++));
    const enc3 = chars.indexOf(clean.charAt(i++));
    const enc4 = chars.indexOf(clean.charAt(i++));
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;
    str += String.fromCharCode(chr1);
    if (enc3 !== 64) str += String.fromCharCode(chr2);
    if (enc4 !== 64) str += String.fromCharCode(chr3);
  }
  return str;
};

// Shifrlangan Gemini AI kalitlari (Multi-key redundancy)
const GEMINI_KEYS = [
  decodeSecret('QVEuQWI4Uk42SUVXdFB5bzJORnNGbTdYcDVVbkNRck5oN0dGRXVOa0VxWkR1a055VzRxLUE='),
  decodeSecret('QVEuQWI4Uk42STlsbmtvYjQ1aTVUT1Y1aFkzVS1TTk9GYm9HSDB5LUk3Umh1Um1IX3pZd2c='),
];

const MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];

function getStoreContext() {
  const productList = PRODUCTS.map(
    (p, i) =>
      `${i + 1}. ${p.name} - Narxi: ${formatPrice(p.price)}${
        p.oldPrice ? ` (Eski narx: ${formatPrice(p.oldPrice)})` : ''
      }, Reyting: ${p.rating} ⭐ (${p.reviewsCount} ta sharh). Toifa: ${p.category}. Tavsif: ${
        p.description
      }`
  ).join('\n');

  return `
Siz SmartBozor internet-do'konining rasmiy aqlli AI maslahatchisisiz (SmartBozor AI Yordamchi).
Sizning vazifalaringiz:
1. Xaridorlarga mahsulot tanlashda, solishtirishda, tavsif va xususiyatlarni tushuntirishda yordam berish.
2. Do'kon qoidalari: O'zbekiston bo'ylab 1 kunda bepul yetkazib beriladi, 100% rasmiy kafolat beriladi, to'lov turlari: Click, Payme, Naqd yoki Karta orqali qabul qilinadi.
3. Shuningdek, xaridor bergan har qanday umumiy savolga (texnologiya, telefonlar, maslahatlar, taqqoslashlar, dasturlash, hayotiy va boshqa barcha mavzular) aqlli, to'liq, ravon va aniq javob berish.
4. Foydalanuvchi qaysi tilda yozsa (O'zbek lotin, O'zbek krill, Ruscha, Inglizcha), xuddi shu tilda muloyim va chiroyli javob bering. Emojilardan o'rnida foydalaning.

SmartBozor katalogidagi mavjud mahsulotlar:
${productList}
`;
}

export async function sendGeminiMessage(userMessage, conversationHistory = []) {
  const systemInstruction = getStoreContext();

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `[Tizim ko'rsatmasi]: ${systemInstruction}\n\nSalom, men SmartBozor xaridoriman.`,
        },
      ],
    },
    {
      role: 'model',
      parts: [
        {
          text: "Assalomu alaykum! SmartBozor rasmiy AI yordamchisiman 🛍️✨ Sizga qanday yordam bera olaman?",
        },
      ],
    },
  ];

  const recentHistory = conversationHistory.slice(-8);
  recentHistory.forEach((msg) => {
    contents.push({
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  let lastError = null;

  for (let keyIndex = 0; keyIndex < GEMINI_KEYS.length; keyIndex++) {
    const apiKey = GEMINI_KEYS[keyIndex];

    for (let modelIndex = 0; modelIndex < MODELS.length; modelIndex++) {
      const model = MODELS[modelIndex];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const replyText =
            data.candidates?.[0]?.content?.parts?.[0]?.text || null;
          if (replyText) {
            return {
              success: true,
              reply: replyText.trim(),
            };
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = errData.error?.message || `Status ${response.status}`;
          console.log(`Gemini ${model} with Key ${keyIndex + 1} failed:`, lastError);
        }
      } catch (networkError) {
        lastError = 'Internet aloqasi mavjud emas';
        console.log('Network error connecting to Gemini:', networkError.message);
      }
    }
  }

  return {
    success: false,
    error:
      lastError === 'Internet aloqasi mavjud emas'
        ? '⚠️ Internet aloqasi mavjud emas. Iltimos, internetga ulanib qayta urinib ko\'ring.'
        : '⚠️ AI Yordamchi xizmatida vaqtinchalik uzilish. Iltimos, bir ozdan so\'ng qayta urinib ko\'ring.',
  };
}
