import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sendGeminiMessage } from '../services/geminiAi';
import { useApp } from '../context/AppContext';

const CHAT_STORAGE_KEY = '@smartbozor_ai_chat_v1';

const SUGGESTED_QUESTIONS = [
  '🔥 Eng yaxshi smartfonlar qaysilar?',
  '💻 Noutbuk tanlashda yordam ber',
  '🚚 Yetkazib berish shartlari qanday?',
  '🛡️ Kafolat va to\'lov turlari qanaqa?',
];

export const AIChatModal = ({ visible, onClose }) => {
  const { language } = useApp();
  const insets = useSafeAreaInsets();
  const isRu = language === 'ru';
  const bottomInputPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 12);

  const defaultWelcomeMessage = {
    id: 'msg-welcome',
    text: isRu
      ? 'Здравствуйте! 👋 Я AI-помощник SmartBozor на базе Gemini AI. Я могу помочь вам с выбором любого товара, рассказать о характеристиках, доставке, скидках или ответить на любой ваш вопрос! Чем могу помочь?'
      : 'Assalomu alaykum! 👋 Men SmartBozor ning rasmiy AI yordamchisiman (Gemini AI asosida). Sizga tovar tanlashda, chegirmalar, kafolat, yetkazib berish haqida ma\'lumot berishim yoki xohlagan savolingizga javob berishim mumkin! Qanday yordam bera olaman?',
    isUser: false,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState([defaultWelcomeMessage]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef(null);

  // Chat tarixini AsyncStorage dan yuklash
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        console.log('Error loading AI chat history:', e);
      }
    };

    if (visible) {
      loadChatHistory();
    }
  }, [visible]);

  // Xabarlarni AsyncStorage ga saqlash
  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
    } catch (e) {
      console.log('Error saving AI chat history:', e);
    }
  };

  // Pastga avtomatik scroll qilish
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  // Xabar yuborish
  const handleSend = async (customText = null) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: 'msg-' + Date.now(),
      text: textToSend,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedWithUser = [...messages, userMessage];
    setMessages(updatedWithUser);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();
    saveMessages(updatedWithUser);

    // Gemini API ga so'rov yuborish
    const result = await sendGeminiMessage(textToSend, updatedWithUser);

    const aiMessage = {
      id: 'msg-' + (Date.now() + 1),
      text: result.success ? result.reply : result.error,
      isUser: false,
      isError: !result.success,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const finalMessages = [...updatedWithUser, aiMessage];
    setMessages(finalMessages);
    setIsLoading(false);
    scrollToBottom();
    saveMessages(finalMessages);
  };

  // Chat tarixini tozalash
  const handleClearChat = () => {
    Alert.alert(
      isRu ? 'Очистить историю' : 'Tarixni tozalash',
      isRu
        ? 'Вы действительно хотите очистить всю историю переписки с AI?'
        : 'Haqiqatan ham AI bilan bo\'lgan barcha suhbat tarixini tozalamoqchimisiz?',
      [
        { text: isRu ? 'Отмена' : 'Bekor qilish', style: 'cancel' },
        {
          text: isRu ? 'Очистить' : 'Tozalash',
          style: 'destructive',
          onPress: async () => {
            setMessages([defaultWelcomeMessage]);
            await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
          },
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Yuqori Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.botAvatar}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>SmartBozor AI</Text>
              <View style={styles.onlineStatusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Gemini AI • Online</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleClearChat}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={20} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Xabarlar ro'yxati */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatScrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {/* Taklif etilayotgan tezkor savollar (faqat 1 ta xabar bo'lganda) */}
          {messages.length <= 1 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>
                {isRu ? '💡 Популярные вопросы:' : '💡 Tezkor savollar:'}
              </Text>
              <View style={styles.suggestionsGrid}>
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionPill}
                    onPress={() => handleSend(q)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.suggestionText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Barcha xabarlar */}
          {messages.map((item) => {
            return (
              <View
                key={item.id}
                style={[
                  styles.messageRow,
                  item.isUser ? styles.messageRowUser : styles.messageRowAi,
                ]}
              >
                {!item.isUser && (
                  <View style={styles.aiMiniAvatar}>
                    <Ionicons name="sparkles" size={12} color="#2563EB" />
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    item.isUser ? styles.bubbleUser : styles.bubbleAi,
                    item.isError && styles.bubbleError,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      item.isUser ? styles.messageTextUser : styles.messageTextAi,
                    ]}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      item.isUser ? styles.messageTimeUser : styles.messageTimeAi,
                    ]}
                  >
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* AI yozayotgandagi loading indikatori */}
          {isLoading && (
            <View style={[styles.messageRow, styles.messageRowAi]}>
              <View style={styles.aiMiniAvatar}>
                <Ionicons name="sparkles" size={12} color="#2563EB" />
              </View>
              <View style={[styles.bubble, styles.bubbleAi, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.typingText}>
                  {isRu ? 'AI печатает ответ...' : 'AI javob tayyorlamoqda...'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Pastki xabar kiritish paneli (3 ta tugmaga xalaqit bermaydigan qilib himoyalangan) */}
        <View style={[styles.inputBar, { paddingBottom: bottomInputPadding }]}>
          <TextInput
            style={styles.textInput}
            placeholder={
              isRu ? 'Задайте вопрос AI...' : 'AI ga savol bering...'
            }
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            maxLength={1000}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || isLoading) && styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatArea: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 16,
    paddingBottom: 20,
    gap: 12,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 10,
  },
  suggestionsGrid: {
    gap: 8,
  },
  suggestionPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  suggestionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 2,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAi: {
    justifyContent: 'flex-start',
  },
  aiMiniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  messageTextAi: {
    color: '#1E293B',
    fontWeight: '400',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeUser: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  messageTimeAi: {
    color: '#94A3B8',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 12.5,
    color: '#64748B',
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
});
