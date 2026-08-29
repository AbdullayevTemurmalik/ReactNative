import React from 'react';
import { StyleSheet, Text, View, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
          title: 'Безопасность платежей и банковских карт',
          desc: 'Данные ваших карт не сохраняются на серверах. Все транзакции обрабатываются через защищенные государственные платежные шлюзы (Payme, Click) по стандарту PCI-DSS.',
        },
        {
          icon: 'key',
          color: '#F59E0B',
          title: 'Сквозное SSL/TLS шифрование',
          desc: 'Любые запросы между приложением и базой данных шифруются по протоколам 256-битного шифрования банковского уровня.',
        },
        {
          icon: 'phone-portrait',
          color: '#6366F1',
          title: 'Локальная защита на устройстве',
          desc: 'Корзина, список избранного и персональные настройки хранятся в защищенном изолированном хранилище вашего смартфона.',
        },
      ]
    : [
        {
          icon: 'shield-checkmark',
          color: '#16A34A',
          title: '100% Maxfiylik va Shaxsiy Ma\'lumotlar Himoyasi',
          desc: 'Sizning barcha shaxsiy ma\'lumotlaringiz (ism-familiya, manzil, telefon raqami, buyurtmalar) to\'liq shifrlangan va aslo uchinchi shaxslarga berilmaydi va sotilmaydi.',
        },
        {
          icon: 'lock-closed',
          color: '#2563EB',
          title: 'To\'lovlar va Karta Ma\'lumotlari Xavfsizligi',
          desc: 'Bank karta ma\'lumotlaringiz ilovada saqlanmaydi. Barcha to\'lovlar O\'zbekiston qonunchiligiga mos PCI-DSS xalqaro sertifikatiga ega rasmiy shlyuzlar (Payme, Click) orqali amalga oshiriladi.',
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isRu ? 'Безопасность и конфиденциальность' : 'Xavfsizlik va Maxfiylik Kafolati'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Yuqori kafolat belgisi */}
          <View style={styles.badgeBanner}>
            <View style={styles.badgeIcon}>
              <Ionicons name="shield-checkmark" size={36} color="#16A34A" />
            </View>
            <Text style={styles.badgeHeading}>
              {isRu ? 'Ваши данные под 100% защитой' : 'Ma\'lumotlaringiz 100% himoyalangan'}
            </Text>
            <Text style={styles.badgeSub}>
              {isRu
                ? 'SmartBozor гарантирует полную безопасность ваших покупок и конфиденциальность личной информации.'
                : 'SmartBozor xaridlaringiz xavfsizligi va shaxsiy ma\'lumotlaringiz maxfiyligini to\'liq kafolatlaydi.'}
            </Text>
          </View>

          {/* Qoidalar ro'yxati */}
          <View style={styles.policyList}>
            {POLICIES.map((p, idx) => (
              <View key={idx} style={styles.policyCard}>
                <View style={[styles.policyIconBg, { backgroundColor: p.color + '15' }]}>
                  <Ionicons name={p.icon} size={22} color={p.color} />
                </View>
                <View style={styles.policyInfo}>
                  <Text style={styles.policyTitle}>{p.title}</Text>
                  <Text style={styles.policyDesc}>{p.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Qo'shimcha eslatma */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text style={styles.infoNoteText}>
              {isRu
                ? 'Если у вас возникнут вопросы по поводу безопасности, вы всегда можете обратиться к нашей службе поддержки.'
                : 'Xavfsizlik bo\'yicha savollaringiz bo\'lsa, istalgan vaqtda qo\'llab-quvvatlash xizmatimizga murojaat qilishingiz mumkin.'}
            </Text>
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
  badgeBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 20,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  badgeSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  policyList: {
    gap: 12,
    marginBottom: 20,
  },
  policyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  policyIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  policyInfo: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  policyDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  infoNote: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 10,
    alignItems: 'center',
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 17,
  },
});
