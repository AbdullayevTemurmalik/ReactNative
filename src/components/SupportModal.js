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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isRu ? 'Служба поддержки 24/7' : 'Qo\'llab-quvvatlash markazi 24/7'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Ionicons name="headset" size={40} color="#2563EB" />
            </View>
            <Text style={styles.bannerHeading}>
              {isRu ? 'Мы всегда готовы помочь!' : 'Sizga yordam berishdan mamnunmiz!'}
            </Text>
            <Text style={styles.bannerSub}>
              {isRu
                ? 'Возникли вопросы по заказам, доставке или товарам? Свяжитесь с нами любым удобным способом.'
                : 'Buyurtmalar, to\'lov yoki yetkazib berish bo\'yicha savollaringiz bormi? Qulay usul orqali biz bilan bog\'laning.'}
            </Text>
          </View>

          {/* TELEGRAM TUGMASI (@TM_Backdev) */}
          <TouchableOpacity
            style={styles.telegramCard}
            onPress={handleOpenTelegram}
            activeOpacity={0.85}
          >
            <View style={styles.telegramIconBg}>
              <Ionicons name="paper-plane" size={26} color="#FFFFFF" />
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
            <Ionicons name="call-outline" size={20} color="#16A34A" />
          </TouchableOpacity>

          {/* FAQ */}
          <Text style={styles.sectionHeading}>
            {isRu ? 'Часто задаваемые вопросы' : 'Ko\'p beriladigan savollar'}
          </Text>

          <View style={styles.faqList}>
            {[
              {
                q: isRu ? 'Как отследить доставку?' : 'Yetkazib berishni qanday kuzataman?',
                a: isRu
                  ? 'Статус заказа обновляется в разделе "Мой профиль -> Мои заказы".'
                  : 'Buyurtmangiz holatini "Mening profilim -> Oxirgi buyurtmalarim" bo\'limida kuzatishingiz mumkin.',
              },
              {
                q: isRu ? 'Каковы условия возврата товара?' : 'Tovarni qaytarish shartlari qanday?',
                a: isRu
                  ? 'Вы можете вернуть товар в течение 10 дней при сохранении товарного вида и чека.'
                  : 'Tovarni qadoqi buzilmagan holda 10 kun ichida bepul qaytarishingiz mumkin.',
              },
            ].map((faq, idx) => (
              <View key={idx} style={styles.faqCard}>
                <Text style={styles.faqQ}>❓ {faq.q}</Text>
                <Text style={styles.faqA}>{faq.a}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scroll: {
    padding: 20,
  },
  banner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  bannerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  telegramCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2AABEE',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#2AABEE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  telegramIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  channelInfo: {
    flex: 1,
  },
  telegramTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  telegramHandle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E0F2FE',
    marginTop: 1,
  },
  telegramHint: {
    fontSize: 11,
    color: '#F0F9FF',
    marginTop: 2,
  },
  phoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  phoneIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  phoneInfo: {
    flex: 1,
  },
  phoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 2,
  },
  phoneHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  faqList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqQ: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  faqA: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
});
