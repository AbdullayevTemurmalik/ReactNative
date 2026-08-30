import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { PRODUCTS } from '../data/products';
import { TRANSLATIONS } from '../utils/translations';
import { formatPhoneNumber } from '../utils/formatters';

const AppContext = createContext();

const STORAGE_KEYS = {
  CART: '@smartbozor_cart_v1',
  FAVORITES: '@smartbozor_favorites_v1',
  ORDERS: '@smartbozor_orders_v1',
  LANG: '@smartbozor_lang_v1',
  ADDRESSES: '@smartbozor_addresses_v1',
  NOTIFICATIONS: '@smartbozor_notifications_v1',
  USERS: '@smartbozor_users_v1',
  CURRENT_USER: '@smartbozor_current_user_v1',
};

const DEFAULT_ADDRESSES = [
  {
    id: 'addr-1',
    title: 'Uy (Asosiy)',
    address: "Toshkent shahri, Yunusobod tumani, Amir Temur ko'chasi 45-uy",
    isDefault: true,
  },
  {
    id: 'addr-2',
    title: 'Ish joyi',
    address: "Toshkent shahri, Mirobod tumani, Nukus ko'chasi 12-bino",
    isDefault: false,
  },
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-welcome',
    title: 'SmartBozor ga xush kelibsiz! 🎉',
    body: "Eng yaxshi chegirmalar va yangi mahsulotlar bilan tanishing. Xaridingiz maroqli bo'lsin!",
    title_ru: 'Добро пожаловать в SmartBozor! 🎉',
    body_ru: 'Ознакомьтесь с лучшими скидками и новинками. Приятных покупок!',
    time: new Date().toISOString(),
    read: true,
  },
];

const INITIAL_USER = {
  id: 'user-default',
  name: 'Temur Malik',
  phone: '+998 90 123 45 67',
  password: 'password123',
  avatar: '🦁',
  createdAt: new Date().toISOString(),
};

const INITIAL_USERS = [INITIAL_USER];

export const AppProvider = ({ children }) => {
  const [products] = useState(PRODUCTS);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [language, setLanguageState] = useState('uz'); // 'uz' | 'ru'
  const [addresses, setAddresses] = useState(DEFAULT_ADDRESSES);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(null); // null | { isGuest: true } | { id, name, phone }
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isAiChatVisible, setIsAiChatVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-welcome',
      title: 'SmartBozor ga xush kelibsiz! 🎉',
      title_ru: 'Добро пожаловать в SmartBozor! 🎉',
      body: 'Birinchi xaridingiz uchun SMART10 promokodidan foydalaning va 10% chegirmaga ega bo\'ling.',
      body_ru: 'Используйте промокод SMART10 для первой покупки и получите скидку 10%.',
      time: new Date().toISOString(),
      read: false,
    },
  ]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'favorites' | 'cart' | 'profile'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('cat_all');

  // Toast System
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Tarjima funksiyasi (t)
  const t = useCallback(
    (key) => {
      const currentDict = TRANSLATIONS[language] || TRANSLATIONS.uz;
      return currentDict[key] || key;
    },
    [language]
  );

  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // 1. Dastlabki ma'lumotlarni AsyncStorage dan yuklab olish (Persistence)
  useEffect(() => {
    const safeJsonParse = (str, fallback) => {
      if (!str) return fallback;
      try {
        const val = JSON.parse(str);
        return val !== null && val !== undefined ? val : fallback;
      } catch (e) {
        return fallback;
      }
    };

    const loadStoredData = async () => {
      try {
        const [
          storedCart,
          storedFavorites,
          storedOrders,
          storedLang,
          storedAddresses,
          storedNotifications,
          storedUsers,
          storedCurrentUser,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CART),
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
          AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
          AsyncStorage.getItem(STORAGE_KEYS.LANG),
          AsyncStorage.getItem(STORAGE_KEYS.ADDRESSES),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.USERS),
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
        ]);

        const parsedCart = safeJsonParse(storedCart, []);
        const parsedFavs = safeJsonParse(storedFavorites, []);
        const parsedOrders = safeJsonParse(storedOrders, []);
        const parsedAddresses = safeJsonParse(storedAddresses, DEFAULT_ADDRESSES);
        const parsedNotifs = safeJsonParse(storedNotifications, DEFAULT_NOTIFICATIONS);
        const parsedUsers = safeJsonParse(storedUsers, INITIAL_USERS);
        const parsedUser = safeJsonParse(storedCurrentUser, INITIAL_USER);

        setCart(Array.isArray(parsedCart) ? parsedCart : []);
        setFavorites(Array.isArray(parsedFavs) ? parsedFavs : []);
        setOrders(Array.isArray(parsedOrders) ? parsedOrders : []);
        setAddresses(Array.isArray(parsedAddresses) ? parsedAddresses : DEFAULT_ADDRESSES);
        setNotifications(Array.isArray(parsedNotifs) ? parsedNotifs : DEFAULT_NOTIFICATIONS);
        setUsers(Array.isArray(parsedUsers) && parsedUsers.length > 0 ? parsedUsers : INITIAL_USERS);
        setCurrentUser(parsedUser && typeof parsedUser === 'object' ? parsedUser : INITIAL_USER);

        if (storedLang === 'uz' || storedLang === 'ru') {
          setLanguageState(storedLang);
        }
      } catch (error) {
        console.error('AsyncStorage ma\'lumotlarini yuklashda xatolik:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadStoredData();
  }, []);

  // Tilni o'zgartirish
  const setLanguage = async (newLang) => {
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANG, newLang);
      showToast(newLang === 'ru' ? '🇷🇺 Язык изменен на Русский' : "🇺🇿 Til O'zbek tiliga o'zgartirildi", 'success');
    } catch (error) {
      console.error('Tilni saqlashda xatolik:', error);
    }
  };

  // Storage yozish yordamchilari
  const saveCartToStorage = async (newCart) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newCart));
    } catch (error) {
      console.error(error);
    }
  };

  const saveFavoritesToStorage = async (newFavorites) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
    } catch (error) {
      console.error(error);
    }
  };

  const saveOrdersToStorage = async (newOrders) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
    } catch (error) {
      console.error(error);
    }
  };

  const saveAddressesToStorage = async (newAddresses) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(newAddresses));
    } catch (error) {
      console.error(error);
    }
  };

  const saveNotificationsToStorage = async (newNotifs) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifs));
    } catch (error) {
      console.error(error);
    }
  };

  const saveUsersToStorage = async (newUsers) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
    } catch (error) {
      console.error(error);
    }
  };

  const saveCurrentUserToStorage = async (user) => {
    try {
      if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // EAS OTA Updates qo'lda tekshirish funksiyasi
  const checkForUpdates = async (showFeedback = true) => {
    try {
      if (__DEV__ || !Updates.isEnabled) {
        if (showFeedback) {
          showToast(language === 'ru' ? '🛠️ В режиме разработки обновления отключены' : '🛠️ Dasturlash (Dev) rejimida yangilanishlar tekshirilmaydi', 'info');
        }
        return;
      }
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        if (showFeedback) {
          showToast(language === 'ru' ? '📥 Загружается новая версия...' : '📥 Yangi versiya yuklanmoqda...', 'info');
        }
        await Updates.fetchUpdateAsync();
        if (showFeedback) {
          showToast(language === 'ru' ? '✨ Новая версия установлена! Перезагрузка...' : '✨ Yangi versiya o\'rnatildi! Qayta ishga tushirilmoqda...', 'success');
        }
        await Updates.reloadAsync();
      } else {
        if (showFeedback) {
          showToast(language === 'ru' ? '✅ У вас установлена последняя версия!' : '✅ Siz eng so\'nggi versiyadasiz!', 'success');
        }
      }
    } catch (error) {
      console.log('Update check error:', error);
      if (showFeedback) {
        showToast(language === 'ru' ? '⚠️ Ошибка при проверке обновлений' : '⚠️ Yangilanishlarni tekshirishda xatolik yuz berdi', 'error');
      }
    }
  };

  // ==========================================
  // AUTHENTICATION & GUEST SYSTEM
  // ==========================================

  // Mehmon sifatida kirish
  const continueAsGuest = useCallback(() => {
    const guestUser = { isGuest: true, name: 'Mehmon', phone: '' };
    setCurrentUser(guestUser);
    saveCurrentUserToStorage(guestUser);
    setIsAuthModalVisible(false);
  }, []);

  // Ro'yxatdan o'tish (Akkaunt yaratish)
  const getPhoneDigits = (p) => (p || '').replace(/\D/g, '').slice(-9);

  const register = useCallback(
    (name, phone, password) => {
      const inputDigits = getPhoneDigits(phone);
      const existing = users.find((u) => getPhoneDigits(u.phone) === inputDigits);
      if (existing) {
        return {
          success: false,
          error:
            language === 'ru'
              ? 'Пользователь с таким номером уже зарегистрирован'
              : "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
        };
      }

      const formatted = formatPhoneNumber(phone);
      const newUser = {
        id: 'user-' + Date.now(),
        name: name.trim() || 'Foydalanuvchi',
        phone: formatted,
        password: password.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveUsersToStorage(updatedUsers);

      return { success: true, user: newUser };
    },
    [users, language]
  );

  // Kirish (Log In)
  const login = useCallback(
    (phone, password) => {
      const inputDigits = getPhoneDigits(phone);
      const cleanPass = (password || '').trim();
      const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

      // Foydalanuvchini oxirgi 9 ta raqam bo'yicha qidiramiz
      let user = users.find((u) => getPhoneDigits(u.phone) === inputDigits);

      if (user) {
        // Agar parol to'g'ri kelmasa
        if (user.password && user.password !== cleanPass) {
          return {
            success: false,
            error:
              language === 'ru'
                ? 'Неверный пароль'
                : "Kiritilgan parol noto'g'ri",
          };
        }

        // 3 kunlik muddatni tekshirish
        if (user.loggedOutAt && Date.now() - user.loggedOutAt > THREE_DAYS_MS) {
          return {
            success: false,
            error:
              language === 'ru'
                ? '⚠️ Срок действия аккаунта (3 дня) истек. Пожалуйста, создайте новый аккаунт.'
                : "⚠️ Ushbu akkaunt muddati (3 kun) tugagan. Iltimos, qayta ro'yxatdan o'ting.",
          };
        }
      } else {
        // Agar foydalanuvchi bazada bo'lmasa, uni darhol avtomatik kiritamiz
        user = {
          id: 'user-' + Date.now(),
          name: inputDigits === '901234567' ? 'Temur Malik' : 'Foydalanuvchi',
          phone: formatPhoneNumber(phone),
          password: cleanPass,
          createdAt: new Date().toISOString(),
        };
        const updatedUsers = [...users, user];
        setUsers(updatedUsers);
        saveUsersToStorage(updatedUsers);
      }

      const authenticatedUser = { ...user, isGuest: false, loggedOutAt: null };
      setCurrentUser(authenticatedUser);
      saveCurrentUserToStorage(authenticatedUser);
      setIsAuthModalVisible(false);
      showToast(t('auth_login_success'), 'success');

      // Agar oldin kutilayotgan harakat bo'lsa (masalan, like yoki savat), uni avtomatik bajaramiz
      if (pendingAction) {
        setTimeout(() => {
          if (pendingAction.type === 'ADD_TO_CART') {
            addToCartDirect(pendingAction.product, pendingAction.qty);
          } else if (pendingAction.type === 'TOGGLE_FAVORITE') {
            toggleFavoriteDirect(pendingAction.productId);
          } else if (pendingAction.type === 'NAVIGATE') {
            setActiveTab(pendingAction.tab);
          }
          setPendingAction(null);
        }, 300);
      }

      return { success: true, user: authenticatedUser };
    },
    [users, language, showToast, t, pendingAction]
  );

  // Profil ma'lumotlarini (Ism, Parol, Telefon, Rasm) yangilash
  const updateProfile = useCallback(
    (name, newPassword, newPhone, avatar) => {
      if (!currentUser || currentUser.isGuest) {
        return {
          success: false,
          error:
            language === 'ru'
              ? 'Сначала войдите в аккаунт'
              : 'Avval akkauntga kiring',
        };
      }

      const cleanName = (name || '').trim() || currentUser.name;
      const cleanPhone = newPhone ? formatPhoneNumber(newPhone) : currentUser.phone;

      const updatedUser = {
        ...currentUser,
        name: cleanName,
        phone: cleanPhone,
        avatar: avatar !== undefined ? avatar : currentUser.avatar,
      };

      if (newPassword && newPassword.trim()) {
        updatedUser.password = newPassword.trim();
      }

      setCurrentUser(updatedUser);
      saveCurrentUserToStorage(updatedUser);

      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((u) =>
          u.id === currentUser.id ? { ...u, ...updatedUser } : u
        );
        saveUsersToStorage(updatedUsers);
        return updatedUsers;
      });

      showToast(
        language === 'ru'
          ? '✅ Данные профиля успешно обновлены!'
          : "✅ Profil ma'lumotlari muvaffaqiyatli saqlandi!",
        'success'
      );

      return { success: true, user: updatedUser };
    },
    [currentUser, language, showToast]
  );

  // Chiqish (Log Out)
  const logout = useCallback(() => {
    if (currentUser && !currentUser.isGuest) {
      const now = Date.now();
      const updatedUsers = users.map((u) =>
        u.id === currentUser.id ? { ...u, loggedOutAt: now } : u
      );
      setUsers(updatedUsers);
      saveUsersToStorage(updatedUsers);
    }
    setCurrentUser(null);
    saveCurrentUserToStorage(null);
    showToast(language === 'ru' ? 'Вы вышли из системы' : 'Akkauntdan chiqildi', 'info');
  }, [currentUser, users, language, showToast]);

  // Auth himoyasi tekshiruvi: Agar mehmon bo'lsa yoki kirmagan bo'lsa, Auth oynasini ochadi va harakatni saqlab qoladi
  const checkAuthAndRun = useCallback(
    (actionPayload, actionFn) => {
      if (!currentUser || currentUser.isGuest) {
        setPendingAction(actionPayload);
        setIsAuthModalVisible(true);
        return false;
      }
      if (actionFn) actionFn();
      return true;
    },
    [currentUser]
  );

  // Bildirishnoma qo'shish
  const addNotification = useCallback((title, body, title_ru, body_ru) => {
    setNotifications((prev) => {
      // Duplikat xabarlarni qayta qo'shmaslik
      const alreadyExists = prev.some((n) => n.title === title || (title_ru && n.title_ru === title_ru));
      if (alreadyExists) {
        return prev;
      }
      const newNotif = {
        id: 'notif-' + Date.now(),
        title,
        title_ru: title_ru || title,
        body,
        body_ru: body_ru || body,
        time: new Date().toISOString(),
        read: false,
      };
      const updated = [newNotif, ...prev];
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, []);

  // CART METODLARI
  const addToCartDirect = (product, qty = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = prevCart.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + qty } : item
        );
      } else {
        updatedCart = [...prevCart, { ...product, quantity: qty }];
      }
      saveCartToStorage(updatedCart);
      return updatedCart;
    });
    showToast(
      language === 'ru'
        ? `🛒 "${product.name.slice(0, 16)}..." добавлен в корзину!`
        : `🛒 "${product.name.slice(0, 16)}..." savatga qo'shildi!`,
      'success'
    );
  };

  const addToCart = useCallback(
    (product, qty = 1) => {
      const isAuthed = checkAuthAndRun(
        { type: 'ADD_TO_CART', product, qty },
        () => addToCartDirect(product, qty)
      );
      if (!isAuthed) {
        showToast(
          language === 'ru'
            ? '🔒 Войдите в аккаунт для добавления в корзину'
            : '🔒 Savatga qo\'shish uchun akkauntga kiring',
          'info'
        );
      }
    },
    [checkAuthAndRun, language, showToast]
  );

  const updateCartQuantity = useCallback((productId, change) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + change;
          return newQty >= 1 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
      saveCartToStorage(updatedCart);
      return updatedCart;
    });
  }, []);

  const removeFromCart = useCallback(
    (productId) => {
      setCart((prevCart) => {
        const updatedCart = prevCart.filter((item) => item.id !== productId);
        saveCartToStorage(updatedCart);
        return updatedCart;
      });
      showToast(language === 'ru' ? '🗑️ Товар удален из корзины' : '🗑️ Mahsulot savatdan olib tashlandi', 'info');
    },
    [showToast, language]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    saveCartToStorage([]);
    showToast(language === 'ru' ? '🧹 Корзина очищена' : '🧹 Savat tozalandi', 'info');
  }, [showToast, language]);

  // FAVORITES METODLARI
  const toggleFavoriteDirect = (productId) => {
    setFavorites((prevFavs) => {
      let updatedFavs;
      const targetProduct = products.find((p) => p.id === productId);
      const prodName = targetProduct ? targetProduct.name : 'Mahsulot';

      if (prevFavs.includes(productId)) {
        updatedFavs = prevFavs.filter((id) => id !== productId);
        showToast(language === 'ru' ? '💔 Удалено из избранного' : '💔 Sevimlilardan olib tashlandi', 'info');
      } else {
        updatedFavs = [...prevFavs, productId];
        showToast(language === 'ru' ? '❤️ Добавлено в избранное' : '❤️ Sevimlilarga qo\'shildi', 'success');

        setTimeout(() => {
          addNotification(
            `🔥 Siz yoqtirgan tovar kutmoqda!`,
            `"${prodName.slice(0, 24)}..." savatingizga qo'shishni unutmang. Chegirma tez orada tugashi mumkin!`,
            `🔥 Понравившийся товар ждет вас!`,
            `Не забудьте добавить "${prodName.slice(0, 24)}..." в корзину. Скидка скоро закончится!`
          );
        }, 1000);
      }
      saveFavoritesToStorage(updatedFavs);
      return updatedFavs;
    });
  };

  const toggleFavorite = useCallback(
    (productId) => {
      const isAuthed = checkAuthAndRun(
        { type: 'TOGGLE_FAVORITE', productId },
        () => toggleFavoriteDirect(productId)
      );
      if (!isAuthed) {
        showToast(
          language === 'ru'
            ? '🔒 Войдите в аккаунт, чтобы добавить в избранное'
            : '🔒 Sevimlilarga qo\'shish uchun akkauntga kiring',
          'info'
        );
      }
    },
    [checkAuthAndRun, language, showToast]
  );

  const removeFromFavorites = useCallback(
    (productId) => {
      setFavorites((prevFavs) => {
        const updatedFavs = prevFavs.filter((id) => id !== productId);
        saveFavoritesToStorage(updatedFavs);
        return updatedFavs;
      });
      showToast(language === 'ru' ? '💔 Удалено из избранного' : '💔 Sevimlilardan olib tashlandi', 'info');
    },
    [showToast, language]
  );

  const isFavorite = useCallback((productId) => favorites.includes(productId), [favorites]);

  const moveFromFavoritesToCart = useCallback(
    (product) => {
      const isAuthed = checkAuthAndRun({ type: 'ADD_TO_CART', product, qty: 1 }, () => {
        addToCartDirect(product, 1);
        setFavorites((prevFavs) => {
          const updatedFavs = prevFavs.filter((id) => id !== product.id);
          saveFavoritesToStorage(updatedFavs);
          return updatedFavs;
        });
      });
      if (!isAuthed) {
        showToast(
          language === 'ru'
            ? '🔒 Войдите в аккаунт для покупок'
            : '🔒 Savatga ko\'chirish uchun akkauntga kiring',
          'info'
        );
      }
    },
    [checkAuthAndRun, language, showToast]
  );

  // MANZILLARNI BOSHQARISH
  const addAddress = useCallback(
    (title, fullAddress) => {
      const newAddr = {
        id: 'addr-' + Date.now(),
        title,
        address: fullAddress,
        isDefault: false,
      };
      setAddresses((prev) => {
        const updated = [...prev, newAddr];
        saveAddressesToStorage(updated);
        return updated;
      });
      showToast(language === 'ru' ? '📍 Новый адрес добавлен' : '📍 Yangi manzil qo\'shildi', 'success');
    },
    [showToast, language]
  );

  const setDefaultAddress = useCallback(
    (addrId) => {
      setAddresses((prev) => {
        const updated = prev.map((a) => ({ ...a, isDefault: a.id === addrId }));
        saveAddressesToStorage(updated);
        return updated;
      });
      showToast(language === 'ru' ? '✅ Основной адрес обновлен' : '✅ Asosiy manzil yangilandi', 'success');
    },
    [showToast, language]
  );

  const deleteAddress = useCallback(
    (addrId) => {
      setAddresses((prev) => {
        const updated = prev.filter((a) => a.id !== addrId);
        saveAddressesToStorage(updated);
        return updated;
      });
      showToast(language === 'ru' ? '🗑️ Адрес удален' : '🗑️ Manzil o\'chirildi', 'info');
    },
    [showToast, language]
  );

  // BUYURTMA BERISH (CHECKOUT)
  const placeOrder = useCallback(
    (customerData = {}) => {
      if (cart.length === 0) return null;

      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newOrder = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toISOString(),
        items: [...cart],
        totalAmount,
        customer: customerData,
        status: language === 'ru' ? 'Принят' : 'Qabul qilindi',
      };

      setOrders((prevOrders) => {
        const updatedOrders = [newOrder, ...prevOrders];
        saveOrdersToStorage(updatedOrders);
        return updatedOrders;
      });

      clearCart();

      addNotification(
        `🎉 Buyurtmangiz qabul qilindi (#${newOrder.id})`,
        `${newOrder.items.length} xil tovar uchun buyurtma rasmiylashtirildi. Tez orada yetkaziladi!`,
        `🎉 Ваш заказ принят (#${newOrder.id})`,
        `Оформлен заказ на ${newOrder.items.length} товаров. Скоро будет доставлен!`
      );

      return newOrder;
    },
    [cart, clearCart, language, addNotification]
  );

  // HISOBLANGAN QIYMATLAR
  const cartUniqueCount = useMemo(() => {
    return cart.length;
  }, [cart]);

  const cartTotalCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartTotalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartTotalDiscount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const oldPrice = item.oldPrice || item.price;
      return sum + (oldPrice - item.price) * item.quantity;
    }, 0);
  }, [cart]);

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const favoriteProducts = useMemo(() => {
    return products.filter((item) => favorites.includes(item.id));
  }, [products, favorites]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCat =
        selectedCategoryKey === 'cat_all' || item.categoryKey === selectedCategoryKey;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategoryKey, searchQuery]);

  const value = {
    products,
    filteredProducts,
    cart,
    favorites,
    favoriteProducts,
    orders,
    language,
    setLanguage,
    t,
    addresses,
    addAddress,
    setDefaultAddress,
    deleteAddress,
    notifications,
    unreadNotifsCount,
    markNotificationsAsRead,
    isInitializing,
    activeTab,
    setActiveTab,
    selectedProduct,
    setSelectedProduct,
    searchQuery,
    setSearchQuery,
    selectedCategoryKey,
    setSelectedCategoryKey,
    toast,
    showToast,
    hideToast,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    toggleFavorite,
    removeFromFavorites,
    isFavorite,
    moveFromFavoritesToCart,
    placeOrder,
    cartUniqueCount,
    cartTotalCount,
    cartTotalPrice,
    cartTotalDiscount,
    // Auth & Guest
    currentUser,
    isAuthModalVisible,
    setIsAuthModalVisible,
    isAiChatVisible,
    setIsAiChatVisible,
    continueAsGuest,
    register,
    login,
    logout,
    updateProfile,
    checkAuthAndRun,
    checkForUpdates,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp faqat AppProvider ichida ishlatilishi mumkin');
  }
  return context;
};
