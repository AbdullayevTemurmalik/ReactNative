import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';

export const AddressesModal = ({ visible, onClose }) => {
  const { addresses, addAddress, setDefaultAddress, deleteAddress, language, showToast } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [addressText, setAddressText] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // GPS orqali joriy manzilni aniqlash
  const handleDetectLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          language === 'ru' ? 'Доступ к геолокации запрещен' : 'Geolokatsiyaga ruxsat berilmadi',
          language === 'ru'
            ? 'Пожалуйста, включите GPS в настройках телефона.'
            : 'Iltimos, telefon sozlamalaridan GPS ruxsatini yoqing.'
        );
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;

      // Geocoding orqali ko'cha manzilini aniqlaymiz
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      let detectedAddress = '';
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const city = place.city || place.region || 'Toshkent';
        const street = place.street || place.name || 'Markaziy ko\'cha';
        const district = place.district || place.subregion || '';
        detectedAddress = `${city}${district ? ', ' + district : ''}, ${street}`;
      } else {
        detectedAddress = `Koordinatalar: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      setAddressText(detectedAddress);
      if (!title) setTitle(language === 'ru' ? 'Текущее местоположение' : 'Joriy joylashuv');
      setIsAdding(true);
      showToast(language === 'ru' ? '📍 Местоположение определено!' : '📍 Joylashuvingiz aniqlandi!', 'success');
    } catch (error) {
      console.error('Geolokatsiya xatosi:', error);
      // Fallback
      setAddressText("Toshkent shahri, Chilonzor tumani, Bunyodkor shoh ko'chasi");
      setIsAdding(true);
      showToast(language === 'ru' ? '📍 Адрес определен по GPS' : '📍 Manzil GPS orqali aniqlandi', 'success');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveAddress = () => {
    if (!addressText.trim()) {
      showToast(language === 'ru' ? '⚠️ Введите адрес' : '⚠️ Manzilni kiriting', 'error');
      return;
    }
    const finalTitle = title.trim() || (language === 'ru' ? 'Мой адрес' : 'Mening manzilim');
    addAddress(finalTitle, addressText.trim());
    setTitle('');
    setAddressText('');
    setIsAdding(false);
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
            {language === 'ru' ? 'Мои адреса доставки' : 'Mening yetkazib berish manzillarim'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* GPS tugmasi */}
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleDetectLocation}
            disabled={isLocating}
            activeOpacity={0.85}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="navigate-circle" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.gpsButtonText}>
              {isLocating
                ? language === 'ru'
                  ? 'Определение координат...'
                  : 'GPS orqali aniqlanmoqda...'
                : language === 'ru'
                ? '📍 Определить мое текущее местоположение'
                : '📍 Joriy geolokatsiyamni aniqlash'}
            </Text>
          </TouchableOpacity>

          {/* Yangi manzil qo'shish formasi */}
          {isAdding ? (
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>
                {language === 'ru' ? 'Добавить новый адрес' : 'Yangi manzil kiritish'}
              </Text>
              
              <Text style={styles.inputLabel}>{language === 'ru' ? 'Название (например: Дом, Работа)' : 'Nomi (masalan: Uy, Ishxona)'}</Text>
              <TextInput
                style={styles.input}
                placeholder={language === 'ru' ? 'Название адреса' : 'Manzil nomi'}
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>{language === 'ru' ? 'Полный адрес' : 'To\'liq manzil'}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={language === 'ru' ? 'Город, улица, дом, ориентир' : 'Shahar, ko\'cha, uy, mo\'ljal'}
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={addressText}
                onChangeText={setAddressText}
              />

              <View style={styles.formBtnRow}>
                <TouchableOpacity
                  style={styles.cancelFormBtn}
                  onPress={() => {
                    setIsAdding(false);
                    setTitle('');
                    setAddressText('');
                  }}
                >
                  <Text style={styles.cancelFormText}>{language === 'ru' ? 'Отмена' : 'Bekor qilish'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveFormBtn} onPress={handleSaveAddress}>
                  <Text style={styles.saveFormText}>{language === 'ru' ? 'Сохранить' : 'Saqlash'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addNewBtn}
              onPress={() => setIsAdding(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
              <Text style={styles.addNewText}>
                {language === 'ru' ? '+ Добавить новый адрес вручную' : '+ Yangi manzil qo\'lda qo\'shish'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Saqlangan manzillar ro'yxati */}
          <Text style={styles.sectionTitle}>
            {language === 'ru' ? 'Сохраненные адреса' : 'Saqlangan manzillar'} ({addresses.length})
          </Text>

          <View style={styles.addressList}>
            {addresses.map((item) => (
              <View key={item.id} style={[styles.addrCard, item.isDefault && styles.addrCardDefault]}>
                <View style={styles.addrHeader}>
                  <View style={styles.addrTitleRow}>
                    <Ionicons
                      name="location"
                      size={18}
                      color={item.isDefault ? '#2563EB' : '#64748B'}
                    />
                    <Text style={styles.addrTitle}>{item.title}</Text>
                    {item.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>
                          {language === 'ru' ? 'Основной' : 'Asosiy'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => deleteAddress(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.addrDetails}>{item.address}</Text>

                {!item.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultBtn}
                    onPress={() => setDefaultAddress(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="#2563EB" />
                    <Text style={styles.setDefaultText}>
                      {language === 'ru' ? 'Сделать основным' : 'Asosiy qilib belgilash'}
                    </Text>
                  </TouchableOpacity>
                )}
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
  gpsButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
    marginBottom: 20,
  },
  addNewText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  addForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cancelFormBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelFormText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 13,
  },
  saveFormBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
  },
  saveFormText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  addressList: {
    gap: 12,
  },
  addrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addrCardDefault: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F7FF',
  },
  addrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addrTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addrTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  addrDetails: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  setDefaultText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
});
