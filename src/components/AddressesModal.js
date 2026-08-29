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
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';

export const AddressesModal = ({ visible, onClose }) => {
  const { addresses, addAddress, setDefaultAddress, deleteAddress, language, showToast } = useApp();
  const isRu = language === 'ru';

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
          isRu ? 'Доступ к геолокации запрещен' : 'Geolokatsiyaga ruxsat berilmadi',
          isRu
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
        const street = place.street || place.name || "Markaziy ko'cha";
        const district = place.district || place.subregion || '';
        detectedAddress = `${city}${district ? ', ' + district : ''}, ${street}`;
      } else {
        detectedAddress = `Koordinatalar: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      setAddressText(detectedAddress);
      if (!title) setTitle(isRu ? 'Текущее местоположение' : 'Joriy joylashuv');
      setIsAdding(true);
      showToast(isRu ? '📍 Адрес определен по GPS' : '📍 Manzil GPS orqali aniqlandi', 'success');
    } catch (error) {
      console.error(error);
      setAddressText("Toshkent shahri, Amir Temur shoh ko'chasi 45-uy");
      if (!title) setTitle(isRu ? 'Мой адрес' : 'Mening manzilim');
      setIsAdding(true);
      showToast(isRu ? '📍 Адрес определен по GPS' : '📍 Manzil GPS orqali aniqlandi', 'success');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveAddress = () => {
    if (!addressText.trim()) {
      showToast(isRu ? '⚠️ Введите адрес' : '⚠️ Manzilni kiriting', 'error');
      return;
    }
    const finalTitle = title.trim() || (isRu ? 'Мой адрес' : 'Mening manzilim');
    addAddress(finalTitle, addressText.trim());
    setTitle('');
    setAddressText('');
    setIsAdding(false);
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
                    <Ionicons name="location" size={20} color="#2563EB" />
                  </View>
                  <Text style={styles.headerTitle}>
                    {isRu ? 'Адреса доставки' : 'Yetkazib berish manzillari'}
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
                    <Ionicons name="navigate-circle" size={22} color="#FFFFFF" />
                  )}
                  <Text style={styles.gpsButtonText}>
                    {isLocating
                      ? isRu
                        ? 'Определение GPS...'
                        : 'Joylashuv aniqlanmoqda...'
                      : isRu
                      ? 'Определить местоположение по GPS'
                      : 'GPS orqali joylashuvni aniqlash'}
                  </Text>
                </TouchableOpacity>

                {/* Yangi manzil qo'shish formasi */}
                {isAdding ? (
                  <View style={styles.addForm}>
                    <Text style={styles.formTitle}>
                      {isRu ? 'Новый адрес' : 'Yangi manzil kiritish'}
                    </Text>

                    <Text style={styles.inputLabel}>
                      {isRu ? 'Название (Uy, Ish joyi va h.k.)' : 'Nomi (Uy, Ish joyi va h.k.)'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder={isRu ? 'Например: Дом' : 'Masalan: Uy'}
                      placeholderTextColor="#94A3B8"
                      value={title}
                      onChangeText={setTitle}
                    />

                    <Text style={styles.inputLabel}>
                      {isRu ? 'Полный адрес' : "To'liq ko'cha va uy manzili"}
                    </Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder={
                        isRu
                          ? 'Улица, дом, квартира...'
                          : "Ko'cha, uy, xonadon, mo'ljal..."
                      }
                      placeholderTextColor="#94A3B8"
                      value={addressText}
                      onChangeText={setAddressText}
                      multiline={true}
                      numberOfLines={3}
                    />

                    <View style={styles.formActions}>
                      <TouchableOpacity
                        style={styles.cancelFormBtn}
                        onPress={() => setIsAdding(false)}
                      >
                        <Text style={styles.cancelFormBtnText}>
                          {isRu ? 'Отмена' : 'Bekor qilish'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.saveFormBtn}
                        onPress={handleSaveAddress}
                      >
                        <Text style={styles.saveFormBtnText}>
                          {isRu ? 'Сохранить' : 'Saqlash'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addNewBtn}
                    onPress={() => setIsAdding(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
                    <Text style={styles.addNewBtnText}>
                      {isRu ? '+ Добавить новый адрес вручную' : "+ Yangi manzilni qo'lda kiritish"}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Saqlangan manzillar ro'yxati */}
                <Text style={styles.sectionLabel}>
                  {isRu ? 'Сохраненные адреса' : 'Saqlangan manzillar'} ({addresses.length})
                </Text>

                <View style={styles.addrList}>
                  {addresses.map((addr) => (
                    <View
                      key={addr.id}
                      style={[
                        styles.addrCard,
                        addr.isDefault && styles.addrCardDefault,
                      ]}
                    >
                      <View style={styles.addrHeader}>
                        <View style={styles.addrTitleRow}>
                          <Ionicons
                            name={addr.isDefault ? 'location' : 'location-outline'}
                            size={18}
                            color={addr.isDefault ? '#2563EB' : '#64748B'}
                          />
                          <Text style={styles.addrTitle}>{addr.title}</Text>
                          {addr.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>
                                {isRu ? 'Основной' : 'Asosiy'}
                              </Text>
                            </View>
                          )}
                        </View>

                        <TouchableOpacity
                          onPress={() => deleteAddress(addr.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.addrDetails}>{addr.address}</Text>

                      {!addr.isDefault && (
                        <TouchableOpacity
                          style={styles.setDefaultBtn}
                          onPress={() => setDefaultAddress(addr.id)}
                        >
                          <Ionicons name="checkmark-circle-outline" size={16} color="#2563EB" />
                          <Text style={styles.setDefaultText}>
                            {isRu ? 'Сделать основным' : 'Asosiy qilib belgilash'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
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
    maxHeight: '90%',
    paddingBottom: 24,
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
    gap: 16,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  addNewBtnText: {
    color: '#2563EB',
    fontSize: 13.5,
    fontWeight: '700',
  },
  addForm: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  formTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelFormBtn: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelFormBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  saveFormBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveFormBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
  },
  addrList: {
    gap: 10,
  },
  addrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
