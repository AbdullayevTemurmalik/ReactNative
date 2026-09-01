import React, { useState, useEffect } from 'react';
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
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

// Toshkent va O'zbekistonning mashhur hudud va tumanlari
const POPULAR_AREAS = [
  { id: 'yunusobod', name: 'Yunusobod tumani', ruName: 'Юнусабадский район', city: 'Toshkent', landmark: "Amir Temur ko'chasi, Megaplanet" },
  { id: 'chilonzor', name: 'Chilonzor tumani', ruName: 'Чиланзарский район', city: 'Toshkent', landmark: "Bunyodkor shoh ko'chasi, Chilonzor metro" },
  { id: 'mirzo_ulugbek', name: "Mirzo Ulug'bek tumani", ruName: 'Мирзо-Улугбекский район', city: 'Toshkent', landmark: "Buyuk Ipak Yo'li, Maksim Gorkiy" },
  { id: 'mirobod', name: 'Mirobod tumani', ruName: 'Мирабадский район', city: 'Toshkent', landmark: "Oybek ko'chasi, Shimoliy vokzal" },
  { id: 'yakkasaroy', name: 'Yakkasaroy tumani', ruName: 'Яккасарайский район', city: 'Toshkent', landmark: "Shota Rustaveli ko'chasi, Grand Mir" },
  { id: 'shayxontohur', name: 'Shayxontohur tumani', ruName: 'Шайхантахурский район', city: 'Toshkent', landmark: "Navoiy ko'chasi, Chorsu bozori" },
  { id: 'olmazor', name: 'Olmazor tumani', ruName: 'Алмазарский район', city: 'Toshkent', landmark: "Farobiy ko'chasi, Beruniy metro" },
  { id: 'sergeli', name: 'Sergeli tumani', ruName: 'Сергелийский район', city: 'Toshkent', landmark: "Yangi Sergeli ko'chasi, Qipchoq" },
  { id: 'uchtepa', name: 'Uchtepa tumani', ruName: 'Учтепинский район', city: 'Toshkent', landmark: "Lutfiy ko'chasi, Farhod bozori" },
  { id: 'yashnobod', name: 'Yashnobod tumani', ruName: 'Яшнабадский район', city: 'Toshkent', landmark: "Farg'ona yo'li, Do'stlik metro" },
  { id: 'samarkand', name: 'Samarqand shahri', ruName: 'г. Самарканд', city: 'Samarqand', landmark: "Registon ko'chasi" },
  { id: 'bukhara', name: 'Buxoro shahri', ruName: 'г. Бухара', city: 'Buxoro', landmark: "Lab-i Hovuz, B.Naqshband" },
  { id: 'andijan', name: 'Andijon shahri', ruName: 'г. Андижан', city: 'Andijon', landmark: "Bobur shoh ko'chasi" },
  { id: 'fergana', name: "Farg'ona shahri", ruName: 'г. Фергана', city: "Farg'ona", landmark: "Al-Farg'oniy ko'chasi" },
  { id: 'namangan', name: 'Namangan shahri', ruName: 'г. Наманган', city: 'Namangan', landmark: "Bobur bog'i hududi" },
];

export const MapPickerModal = ({ visible, onClose, onSelectAddress, language = 'uz', initialAddress = '' }) => {
  const isRu = language === 'ru';

  const [selectedArea, setSelectedArea] = useState(POPULAR_AREAS[0]);
  const [streetDetail, setStreetDetail] = useState('');
  const [apartmentDetail, setApartmentDetail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsAddress, setGpsAddress] = useState(null);
  const [mapCoordOffset, setMapCoordOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (initialAddress) {
      setStreetDetail(initialAddress);
    }
  }, [initialAddress, visible]);

  // GPS orqali avtomatik joylashuvni aniqlash
  const handleDetectGPS = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          isRu ? 'Геолокация недоступна' : 'Geolokatsiyaga ruxsat berilmadi',
          isRu
            ? 'Вы можете выбрать район и улицу вручную на карте.'
            : "Siz hudud va ko'chani xaritadan qo'lda tanlashingiz mumkin."
        );
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      let detectedText = '';

      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const city = place.city || place.region || 'Toshkent';
          const district = place.district || place.subregion || '';
          const street = place.street || place.name || "Markaziy ko'cha";
          const streetNumber = place.streetNumber ? (', ' + place.streetNumber + '-uy') : '';
          detectedText = city + (district ? ', ' + district : '') + ', ' + street + streetNumber;
        }
      } catch (err) {
        // ignore geocode error
      }

      if (!detectedText) {
        detectedText = 'Toshkent, GPS: ' + latitude.toFixed(4) + ', ' + longitude.toFixed(4);
      }

      setGpsAddress(detectedText);
      setStreetDetail(detectedText);
      setMapCoordOffset({ x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 40 });
    } catch (e) {
      Alert.alert(
        isRu ? 'Ошибка GPS' : 'GPS xatoligi',
        isRu
          ? 'Не удалось определить координаты. Выберите адрес из списка.'
          : "Koordinatalarni aniqlab bo'lmadi. Ro'yxatdan tanlang."
      );
    } finally {
      setIsLocating(false);
    }
  };

  // Hududni tanlash
  const handleSelectArea = (area) => {
    setSelectedArea(area);
    const text = isRu
      ? (area.city + ', ' + area.ruName + ', ' + area.landmark)
      : (area.city + ', ' + area.name + ', ' + area.landmark);
    setStreetDetail(text);
    setGpsAddress(null);
    setMapCoordOffset({ x: (Math.random() - 0.5) * 30, y: (Math.random() - 0.5) * 30 });
  };

  // Xaritadagi biror nuqtani bosganda
  const handleMapPress = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    setMapCoordOffset({ x: locationX - width * 0.45, y: locationY - 90 });
    const currentText = streetDetail || (isRu ? (selectedArea.city + ', ' + selectedArea.ruName) : (selectedArea.city + ', ' + selectedArea.name));
    setStreetDetail(currentText);
  };

  // Manzilni tasdiqlash
  const handleConfirm = () => {
    let fullAddress = streetDetail.trim();
    if (!fullAddress) {
      fullAddress = isRu
        ? (selectedArea.city + ', ' + selectedArea.ruName + ', ' + selectedArea.landmark)
        : (selectedArea.city + ', ' + selectedArea.name + ', ' + selectedArea.landmark);
    }

    if (apartmentDetail.trim()) {
      fullAddress += isRu ? (', кв./офис: ' + apartmentDetail.trim()) : (', xonadon/ofis: ' + apartmentDetail.trim());
    }

    onSelectAddress(fullAddress);
    onClose();
  };

  const filteredAreas = POPULAR_AREAS.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.ruName.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.landmark.toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {isRu ? 'Адрес доставки на карте' : 'Yetkazib berish manzili'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isRu ? 'Укажите точку или выберите район' : 'Nuqtani belgilang yoki tuman tanlang'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.gpsBtnHeader}
            onPress={handleDetectGPS}
            disabled={isLocating}
            activeOpacity={0.7}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Ionicons name="navigate-circle" size={26} color="#2563EB" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* INTERAKTIV XARITA KO'RINISHI */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleMapPress}
            style={styles.mapContainer}
          >
            {/* Map Background Grid & Roads Design */}
            <View style={styles.mapRoadHorizontal} />
            <View style={[styles.mapRoadHorizontal, { top: 120, height: 16, backgroundColor: '#E2E8F0' }]} />
            <View style={styles.mapRoadVertical} />
            <View style={[styles.mapRoadVertical, { left: '70%', width: 14, backgroundColor: '#CBD5E1' }]} />
            <View style={styles.mapRiver} />

            {/* Toshkent / O'zbekiston Map Watermarks */}
            <View style={styles.mapBuildingBlock1}>
              <Text style={styles.mapBlockText}>SmartBozor Hub</Text>
            </View>
            <View style={styles.mapBuildingBlock2}>
              <Text style={styles.mapBlockText}>Tashkent City</Text>
            </View>
            <View style={styles.mapBuildingBlock3}>
              <Text style={styles.mapBlockText}>Amir Temur Xiyoboni</Text>
            </View>

            {/* Live Animated Pin Marker in Center */}
            <View
              style={[
                styles.pinWrapper,
                {
                  transform: [
                    { translateX: mapCoordOffset.x },
                    { translateY: mapCoordOffset.y },
                  ],
                },
              ]}
              pointerEvents="none"
            >
              <View style={styles.pinBubble}>
                <Text style={styles.pinBubbleText} numberOfLines={1}>
                  {gpsAddress ? (isRu ? '🎯 Мой GPS' : '🎯 Joriy GPS') : selectedArea.name}
                </Text>
              </View>
              <Ionicons name="location" size={42} color="#EF4444" style={styles.pinIcon} />
              <View style={styles.pinShadow} />
            </View>

            {/* GPS Floating Action Button */}
            <TouchableOpacity
              style={styles.gpsFloatingBtn}
              onPress={handleDetectGPS}
              activeOpacity={0.8}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="locate" size={18} color="#FFFFFF" />
                  <Text style={styles.gpsFloatingText}>
                    {isRu ? 'Мое местоположение' : 'Mening joylashuvim'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.mapHintBadge}>
              <Ionicons name="hand-left-outline" size={14} color="#475569" />
              <Text style={styles.mapHintText}>
                {isRu ? 'Нажмите на карту для выбора точки' : "Xaritaga bosib nuqtani o'zgartiring"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* QIDIRUV VA TANLANGAN MANZIL KARTASI */}
          <View style={styles.addressFormCard}>
            <Text style={styles.cardSectionTitle}>
              {isRu ? '📍 Выбранный адрес' : '📍 Tanlangan manzil'}
            </Text>

            <View style={styles.inputGroup}>
              <Ionicons name="location-outline" size={20} color="#2563EB" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder={isRu ? 'Улица, дом, ориентир...' : "Ko'cha, uy raqami, mo'ljal..."}
                placeholderTextColor="#94A3B8"
                value={streetDetail}
                onChangeText={setStreetDetail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Ionicons name="business-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder={isRu ? 'Квартира, подъезд, этаж (необязательно)' : 'Xonadon, podyezd, qavat (ixtiyoriy)'}
                placeholderTextColor="#94A3B8"
                value={apartmentDetail}
                onChangeText={setApartmentDetail}
              />
            </View>

            <View style={styles.deliveryTimeBadge}>
              <Ionicons name="bicycle" size={18} color="#10B981" />
              <Text style={styles.deliveryTimeText}>
                {isRu ? 'Экспресс-доставка: 30 - 45 минут' : 'Kuryer yetkazib berish: 30 - 45 daqiqa'}
              </Text>
            </View>
          </View>

          {/* TEZKOR HUDUD VA TUMANLAR RO'YXATI */}
          <View style={styles.areasSection}>
            <Text style={styles.cardSectionTitle}>
              {isRu ? '🏙️ Популярные районы и города' : '🏙️ Tuman va hududlar'}
            </Text>

            {/* Qidiruv */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder={isRu ? 'Поиск района или города...' : 'Tuman yoki shaharni qidirish...'}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.areasGrid}>
              {filteredAreas.map((area) => {
                const isSelected = selectedArea.id === area.id && !gpsAddress;
                return (
                  <TouchableOpacity
                    key={area.id}
                    style={[styles.areaChip, isSelected && styles.areaChipActive]}
                    onPress={() => handleSelectArea(area)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={isSelected ? '#2563EB' : '#94A3B8'}
                    />
                    <View style={styles.areaChipTextContainer}>
                      <Text style={[styles.areaChipName, isSelected && styles.areaChipNameActive]}>
                        {isRu ? area.ruName : area.name}
                      </Text>
                      <Text style={styles.areaChipCity}>{area.city}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* FOOTER TASDIQLASH TUGMASI */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>
              {isRu ? 'Подтвердить адрес доставки' : 'Manzilni tasdiqlash'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  gpsBtnHeader: {
    padding: 6,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    width: '100%',
    height: 230,
    backgroundColor: '#E0F2FE',
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapRoadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 60,
    height: 12,
    backgroundColor: '#CBD5E1',
  },
  mapRoadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '35%',
    width: 12,
    backgroundColor: '#CBD5E1',
  },
  mapRiver: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    right: 30,
    width: 24,
    backgroundColor: '#93C5FD',
    transform: [{ rotate: '15deg' }],
  },
  mapBuildingBlock1: {
    position: 'absolute',
    top: 15,
    left: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#94A3B8',
    elevation: 1,
  },
  mapBuildingBlock2: {
    position: 'absolute',
    bottom: 35,
    left: '20%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#94A3B8',
    elevation: 1,
  },
  mapBuildingBlock3: {
    position: 'absolute',
    top: 30,
    right: 80,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#94A3B8',
    elevation: 1,
  },
  mapBlockText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBubble: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 2,
    maxWidth: 180,
  },
  pinBubbleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  pinIcon: {
    marginTop: -4,
  },
  pinShadow: {
    width: 14,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    marginTop: -2,
  },
  gpsFloatingBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  gpsFloatingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mapHintBadge: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  mapHintText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  addressFormCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  deliveryTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
    gap: 8,
  },
  deliveryTimeText: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '600',
  },
  areasSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    width: '48%',
  },
  areaChipActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  areaChipTextContainer: {
    flex: 1,
  },
  areaChipName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  areaChipNameActive: {
    color: '#2563EB',
  },
  areaChipCity: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    height: 50,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
