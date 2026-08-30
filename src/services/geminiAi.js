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

// Gemini AI kalitlari (Multi-key redundancy)
const GEMINI_KEYS = [
  decodeSecret('QVEuQWI4Uk42SUVXdFB5bzJORnNGbTdYcDVVbkNRck5oN0dGRXVOa0VxWkR1a055VzRxLUE='),
  decodeSecret('QVEuQWI4Uk42STlsbmtvYjQ1aTVUT1Y1aFkzVS1TTk9GYm9HSDB5LUk3Umh1Um1IX3pZd2c='),
];

// Eng tezkor va barqaror Gemini modellari
const MODELS = ['gemini-3.1-flash-lite-preview', 'gemini-3.5-flash', 'gemini-3.6-flash'];

function getStoreContext() {
  const topProducts = PRODUCTS.slice(0, 10).map(
    (p, i) => `${i + 1}. ${p.name} - ${formatPrice(p.price)} (${p.category})`
  ).join(', ');

  return `Siz SmartBozor mobil ilovasining har tomonlama mukammal, universal va cheksiz bilimga ega rasmiy aqlli AI yordamchisisiz (Gemini AI).
Sizning Qoidalar va Qobiliyatlaringiz:
1. CHEKSIZ UNIVERSAL BILIM: Siz nafaqat do'kon, balki dasturlash (JavaScript, Python, React Native va h.k.), texnologiyalar, matematika, fizika, tibbiyot, tarix, jahon bilimlari, falsafa, shaxsiy maslahatlar, she'riyat, tarjima, biznes, psixologiya, pazandachilik va har qanday hayotiy yoki ilmiy savollarga chuqur, aniq, qiziqarli va mukammal javob bera olasiz! Hech qachon "men faqat do'kon haqida bilaman" demang — barcha savollarga do'stona va professional javob bering.
2. DASTURCHI VA MUALLIF: Ushbu SmartBozor mobil ilovasi va butun platformasini mohir va iqtidorli dasturchi **Temurmalik Abdullayev** (Abdullayev Temurmalik) tomonidan eng ilg'or, zamonaviy texnologiyalar va jahon standartlari asosida yaratilgan. Agar "Bu ilovani kim qilgan?", "Dasturchisi kim?", "Kim yaratgan?", "Muallifi kim?" yoki shunga o'xshash savol berilsa, doimo mohir dasturchi Temurmalik Abdullayev haqida faxr bilan, qoyilmaqom qilib ayting!
3. DO'KON XIZMATLARI: SmartBozor do'konida O'zbekiston bo'ylab 1 kunda bepul yetkazib berish, 100% rasmiy kafolat, Click/Payme/Naqd to'lov turlari mavjud. Top tovarlarimiz: ${topProducts}.
4. MULOQOT TILI: Foydalanuvchi qaysi tilda yozsa (O'zbek, Rus, Ingliz va boshqalar), o'sha tilda ravon, tushunarli, muloyim va foydali javob bering.`;
}

export async function sendGeminiMessage(userMessage, conversationHistory = []) {
  const systemInstruction = getStoreContext();

  // Suhbat tarixini qisqa va toza formatlash (oxirgi 4 ta xabar)
  const contents = [];
  const recentHistory = (conversationHistory || []).slice(-4);

  recentHistory.forEach((msg) => {
    if (msg && msg.text && !msg.isError) {
      contents.push({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }
  });

  // Hozirgi yangi savol
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000); // 7 soniya timeout

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 400,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

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
          console.log(`Gemini ${model} Key ${keyIndex + 1} status:`, response.status, lastError);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          lastError = 'Javob berish vaqti tugadi';
        } else {
          lastError = 'Internet aloqasi mavjud emas';
        }
        console.log(`Gemini ${model} Key ${keyIndex + 1} error:`, err.message);
      }
    }
  }

  return {
    success: false,
    error:
      lastError === 'Internet aloqasi mavjud emas'
        ? "⚠️ Internet aloqasi mavjud emas. Iltimos, internetga ulanib qayta urinib ko'ring."
        : "⚠️ AI Yordamchi tezkor javob bera olmadi. Iltimos, qaytadan savol bering.",
  };
}
