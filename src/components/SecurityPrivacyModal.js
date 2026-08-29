import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const SecurityPrivacyModal = ({ visible, onClose }) => {
  const { language } = useApp();
  const isRu = language === 'ru';

  const POLICIES = isRu
    ? [
        {
          icon: 'shield-checkmark',
          color: '#16A34A',
          title: '100% Конфиденциальность данных',
          desc: 'Все ваши персональные данные (ФИО, адрес, телефон, история заказов) надежно зашифрованы и никогда не передаются и не продаются третьим лицам.',
        },
        {
          icon: 'lock-closed',
          color: '#2563EB',
          title: 'Безопасность платежей и карт',
          desc: 'Данные карт не сохраняются. Все транзакции обрабатываются через защищенные государственные платежные шлюзы (Payme, Click) по стандарту PCI-DSS.',
        },
        {
          icon: 'key',
          color: '#F59E0B',
          title: 'Сквозное SSL/TLS шифрование',
          desc: 'Любые запросы между приложением и серверами шифруются по 256-битным протоколам банковского уровня.',
        },
        {
          icon: 'phone-portrait',
          color: '#6366F1',
          title: 'Локальная защита на устройстве',
          desc: 'Корзина, список избранного и данные авторизации хранятся в защищенном изолированном хранилище вашего смартфона.',
        },
      ]
    : [
        {
          icon: 'shield-checkmark',
          color: '#16A34A',
          title: '100% Maxfiylik va Shaxsiy Ma\'lumotlar Himoyasi',
          desc: 'Sizning barcha shaxsiy ma\'lumotlaringiz (ism-familiya, manzil, telefon raqami, buyurtmalar) to\'liq shifrlangan va uchinchi shaxslarga berilmaydi.',
        },
        {
          icon: 'lock-closed',
          color: '#2563EB',
          title: 'To\'lovlar va Karta Ma\'lumotlari Xavfsizligi',
          desc: 'Bank karta ma\'lumotlaringiz saqlanmaydi. Barcha to\'lovlar PCI-DSS xalqaro sertifikatiga ega rasmiy shlyuzlar (Payme, Click) orqali amalga oshiriladi.',
        },
        {
          icon: 'key',
          color: '#F59E0B',
          title: 'SSL / TLS Shifrlash Standartlari',
          desc: 'Ilova va serverlar o\'rtasidagi barcha ulanishlar 256-bitli zamonaviy xavfsizlik protokollari orqali ishonchli himoyalangan.',
        },
        {
          icon: 'phone-portrait',
          color: '#6366F1',
          title: 'Qurilmadagi Xavfsiz Xotira',
          desc: 'Savat va Sevimlilar ro\'yxati faqat sizning telefoningizning maxsus izolyatsiyalangan AsyncStorage xotirasida xavfsiz saqlanadi.',
        },
      ];

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
                    <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
                  </View>
                  <Text style={styles.headerTitle}>
                    {isRu ? 'Безопасность и Maxfiylik' : 'Xavfsizlik va Maxfiylik'}
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
                <View style={styles.badgeBanner}>
                  <View style={styles.badgeIcon}>
                    <Ionicons name="shield-checkmark" size={32} color="#16A34A" />
                  </View>
                  <Text style={styles.badgeHeading}>
                    {isRu
                      ? 'Ваши данные под 100% защитой'
                      : "Ma'lumotlaringiz 100% himoyalangan"}
                  </Text>
                  <Text style={styles.badgeSub}>
                    {isRu
                      ? 'SmartBozor гарантирует полную безопасность покупок и защиту личной информации.'
                      : "SmartBozor xaridlaringiz xavfsizligi va shaxsiy ma'lumotlaringiz maxfiyligini to'liq kafolatlaydi."}
                  </Text>
                </View>

                {/* Qoidalar ro'yxati */}
                <View style={styles.policyList}>
                  {POLICIES.map((p, idx) => (
                    <View key={idx} style={styles.policyCard}>
                      <View
                        style={[
                          styles.policyIconBg,
                          { backgroundColor: p.color + '15' },
                        ]}
                      >
                        <Ionicons name={p.icon} size={22} color={p.color} />
                      </View>
                      <View style={styles.policyContent}>
                        <Text style={styles.policyTitle}>{p.title}</Text>
                        <Text style={styles.policyDesc}>{p.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Yopish tugmasi */}
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.doneBtnText}>
                    {isRu ? 'Понятно' : 'Tushunarli'}
                  </Text>
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
    backgroundColor: '#F0FDF4',
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
    gap: 16,
  },
  badgeBanner: {
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeHeading: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#166534',
    textAlign: 'center',
    marginBottom: 6,
  },
  badgeSub: {
    fontSize: 12.5,
    color: '#15803D',
    textAlign: 'center',
    lineHeight: 18,
  },
  policyList: {
    gap: 12,
  },
  policyCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    gap: 12,
  },
  policyIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  policyDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  doneBtn: {
    backgroundColor: '#16A34A',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
