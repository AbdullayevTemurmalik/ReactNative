import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const SupportModal = ({ visible, onClose }) => {
  const { language } = useApp();
  const isRu = language === 'ru';

  const handleOpenTelegram = async () => {
    const tgUrl = 'https://t.me/TM_Backdev';
    try {
      const canOpen = await Linking.canOpenURL(tgUrl);
      if (canOpen) {
        await Linking.openURL(tgUrl);
      } else {
        await Linking.openURL('https://telegram.me/TM_Backdev');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Telegram', '@TM_Backdev profili orqali bog\'lanishingiz mumkin');
    }
  };

  const handleCallCenter = () => {
    Linking.openURL('tel:+998712000000');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="headset-outline" size={20} color="#2563EB" />
                  </View>
                  <Text style={styles.headerTitle}>
                    {isRu ? 'Служба поддержки 24/7' : "Qo'llab-quvvatlash markazi 24/7"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
              >
                {/* Banner */}
                <View style={styles.banner}>
                  <View style={styles.bannerIcon}>
                    <Ionicons name="headset" size={36} color="#2563EB" />
                  </View>
                  <Text style={styles.bannerHeading}>
                    {isRu ? 'Мы всегда готовы помочь!' : 'Sizga yordam berishdan mamnunmiz!'}
                  </Text>
                  <Text style={styles.bannerSub}>
                    {isRu
                      ? 'Возникли вопросы по заказам, доставке или товарам? Свяжитесь с нами любым удобным способом.'
                      : "Buyurtmalar, to'lov yoki yetkazib berish bo'yicha savollaringiz bormi? Qulay usul orqali biz bilan bog'laning."}
                  </Text>
                </View>

                {/* TELEGRAM TUGMASI (@TM_Backdev) */}
                <TouchableOpacity
                  style={styles.telegramCard}
                  onPress={handleOpenTelegram}
                  activeOpacity={0.85}
                >
                  <View style={styles.telegramIconBg}>
                    <Ionicons name="paper-plane" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={styles.telegramTitle}>Telegram orqali yozish</Text>
                    <Text style={styles.telegramHandle}>@TM_Backdev</Text>
                    <Text style={styles.telegramHint}>
                      {isRu ? 'Ответ в течение 1-2 минут' : '1-2 daqiqa ichida tezkor javob'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {/* QO'NG'IROQ MARKAZI */}
                <TouchableOpacity
                  style={styles.phoneCard}
                  onPress={handleCallCenter}
                  activeOpacity={0.8}
                >
                  <View style={styles.phoneIconBg}>
                    <Ionicons name="call" size={22} color="#16A34A" />
                  </View>
                  <View style={styles.phoneInfo}>
                    <Text style={styles.phoneTitle}>Call-Markaz (Bepul)</Text>
                    <Text style={styles.phoneNumber}>+998 (71) 200-00-00</Text>
                    <Text style={styles.phoneHint}>Har kuni 09:00 dan 22:00 gacha</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 20,
    gap: 14,
  },
  banner: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerHeading: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#1E40AF',
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 12.5,
    color: '#3B82F6',
    textAlign: 'center',
    lineHeight: 18,
  },
  telegramCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2AABEE',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#2AABEE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  telegramIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  channelInfo: {
    flex: 1,
  },
  telegramTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  telegramHandle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
  telegramHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  phoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  phoneIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phoneInfo: {
    flex: 1,
  },
  phoneTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  phoneNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 2,
  },
  phoneHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});
