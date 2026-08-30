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
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmModal } from './ConfirmModal';
import { sendGeminiMessage } from '../services/geminiAi';
import { useApp } from '../context/AppContext';

const CHAT_STORAGE_KEY = '@smartbozor_ai_chat_v1';

const SUGGESTED_QUESTIONS = [
  '🔥 Eng yaxshi smartfonlar qaysilar?',
  '💻 Noutbuk tanlashda yordam ber',
  '🚚 Yetkazib berish shartlari qanday?',
  '👨‍💻 Bu ilovani kim yaratgan?',
];

export const AIChatModal = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { language, showToast } = useApp();
  const isRu = language === 'ru';
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

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
        console.log('Chat history load error:', e);
      }
    };
    if (visible) {
      loadChatHistory();
    }
  }, [visible]);

  // Xabarlar yangilanganda AsyncStorage ga saqlash
  const saveChatHistory = async (newMessages) => {
    try {
      await AsyncStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(newMessages.slice(-20))
      );
    } catch (e) {
      console.log('Chat history save error:', e);
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 150);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Xabar yuborish
  const handleSend = async (customText = null) => {
    const query = (customText || inputText || '').trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      text: query,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    setInputText('');
    setIsLoading(true);
    saveChatHistory(updatedWithUser);

    try {
      const response = await sendGeminiMessage(query, updatedWithUser);

      if (response.success) {
        await AsyncStorage.removeItem('@smartbozor_pending_ai_query');
      } else {
        await AsyncStorage.setItem('@smartbozor_pending_ai_query', JSON.stringify({ query, time: Date.now() }));
      }

      const aiMsg = {
        id: 'msg-ai-' + Date.now(),
        text: response.success
          ? response.reply
          : response.error || (isRu ? 'Произошла ошибка, попробуйте еще раз.' : 'Xatolik yuz berdi, qaytadan urinib ko\'ring.'),
        isUser: false,
        isError: !response.success,
        failedQuery: !response.success ? query : null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedWithUser, aiMsg];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      await AsyncStorage.setItem('@smartbozor_pending_ai_query', JSON.stringify({ query, time: Date.now() }));
      const errorMsg = {
        id: 'msg-err-' + Date.now(),
        text: isRu
          ? 'Произошла ошибка подключения. Как только интернет появится, ответ придет автоматически.'
          : '⚠️ Internet bilan aloqa uzildi. Internet ulanganda AI javobi avtomatik yetkaziladi.',
        isUser: false,
        isError: true,
        failedQuery: query,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const finalMessages = [...updatedWithUser, errorMsg];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // Suhbat tarixini tozalash (Chiroyli Modal orqali)
  const handleClearChat = () => {
    setIsConfirmClearOpen(true);
  };

  const handleConfirmClear = async () => {
    setIsConfirmClearOpen(false);
    setMessages([defaultWelcomeMessage]);
    await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
    await AsyncStorage.removeItem('@smartbozor_pending_ai_query');
    showToast(
      isRu ? '🧹 История чата очищена' : '🧹 Suhbat tarixi muvaffaqiyatli tozalandi',
      'info'
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
      <SafeAreaView
        style={[
          styles.safeContainer,
          { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 28 : 0) },
        ]}
        edges={['left', 'right']}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Yuqori Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.botAvatar}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
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
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Xabarlar ro'yxati */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                    {item.isError && item.failedQuery && (
                      <TouchableOpacity
                        style={styles.retryBtn}
                        onPress={() => handleSend(item.failedQuery)}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="refresh" size={13} color="#DC2626" />
                        <Text style={styles.retryBtnText}>
                          {isRu ? 'Повторить попытку' : 'Qaytadan so\'rash'}
                        </Text>
                      </TouchableOpacity>
                    )}
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

          {/* Pastki xabar kiritish paneli */}
          <View
            style={[
              styles.inputBar,
              {
                paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 18 : 8) + 4,
              },
            ]}
          >
            <TextInput
              style={styles.textInput}
              placeholder={
                isRu ? 'Задайте вопрос AI...' : 'AI ga savol bering...'
              }
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
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
                <Ionicons name="send" size={17} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* CHIROYLI MAXSUS TARIXNI TOZALASH MODALI */}
      <ConfirmModal
        visible={isConfirmClearOpen}
        title={isRu ? 'Очистить историю чата?' : 'Tarixni tozalash'}
        message={
          isRu
            ? 'Вы действительно хотите очистить всю историю переписки с AI? Все сообщения будут удалены.'
            : 'Haqiqatan ham AI bilan bo\'lgan barcha suhbat tarixini tozalamoqchimisiz?'
        }
        confirmText={isRu ? 'Ha, tozalash' : 'Ha, tozalash'}
        cancelText={isRu ? 'Bekor qilish' : 'Bekor qilish'}
        icon="trash-bin-outline"
        isDestructive={true}
        onConfirm={handleConfirmClear}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatArea: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 14,
    paddingBottom: 16,
    gap: 10,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
  },
  suggestionsGrid: {
    gap: 6,
  },
  suggestionPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  suggestionText: {
    fontSize: 12,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 3,
  },
  bubbleAi: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  bubbleError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 2,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  retryBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 19,
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
    fontSize: 9.5,
    marginTop: 3,
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
    paddingVertical: 10,
  },
  typingText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
