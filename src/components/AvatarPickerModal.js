import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';

export const EMOJI_AVATARS = [
  { emoji: '🦁', bg: '#FEF3C7', border: '#F59E0B' },
  { emoji: '👑', bg: '#FEF9C3', border: '#EAB308' },
  { emoji: '⚡', bg: '#EFF6FF', border: '#3B82F6' },
  { emoji: '🚀', bg: '#EEF2FF', border: '#6366F1' },
  { emoji: '💎', bg: '#ECFEFF', border: '#06B6D4' },
  { emoji: '🕶️', bg: '#F1F5F9', border: '#475569' },
  { emoji: '🦅', bg: '#FFF7ED', border: '#EA580C' },
  { emoji: '🐯', bg: '#FFFBEB', border: '#D97706' },
  { emoji: '🎯', bg: '#FEF2F2', border: '#EF4444' },
  { emoji: '🌟', bg: '#FEF08A', border: '#CA8A04' },
  { emoji: '🦄', bg: '#FDF4FF', border: '#D946EF' },
  { emoji: '🎮', bg: '#F5F3FF', border: '#8B5CF6' },
  { emoji: '🦊', bg: '#FFF7ED', border: '#F97316' },
  { emoji: '🔥', bg: '#FFF1F2', border: '#F43F5E' },
  { emoji: '🏆', bg: '#FEF9C3', border: '#EAB308' },
  { emoji: '🤖', bg: '#F0FDFA', border: '#14B8A6' },
  { emoji: '🏎️', bg: '#FEF2F2', border: '#DC2626' },
  { emoji: '🥊', bg: '#FFF1F2', border: '#E11D48' },
  { emoji: '🎧', bg: '#F0F9FF', border: '#0284C7' },
  { emoji: '⭐', bg: '#FEF08A', border: '#EAB308' },
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const AvatarPickerModal = ({ visible, onClose, onSelectAvatar, currentAvatar }) => {
  const { language, showToast } = useApp();
  const isRu = language === 'ru';

  const [isLoading, setIsLoading] = useState(false);

  // Galereyadan rasm tanlash
  const handlePickFromGallery = async () => {
    try {
      setIsLoading(true);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          isRu ? 'Доступ запрещен' : 'Ruxsat berilmadi',
          isRu
            ? 'Пожалуйста, разрешите доступ к галерее в настройках телефона.'
            : 'Iltimos, telefon sozlamalaridan galereyaga ruxsat bering.'
        );
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
          Alert.alert(
            isRu ? 'Файл слишком большой' : 'Fayl hajmi juda katta',
            isRu
              ? 'Размер фото превышает 5 МБ. Пожалуйста, выберите фото меньшего размера.'
              : 'Tanlangan rasm hajmi 5 MB dan katta. Iltimos, kichikroq rasm tanlang.'
          );
          setIsLoading(false);
          return;
        }

        onSelectAvatar(asset.uri);
        showToast(
          isRu ? '📸 Фото профиля обновлено!' : "📸 Rasm muvaffaqiyatli o'rnatildi!",
          'success'
        );
        if (onClose) onClose();
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        isRu ? 'Ошибка' : 'Xatolik',
        isRu ? 'Не удалось выбрать фото' : 'Rasmni tanlashda xatolik yuz berdi'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Kamera orqali rasmga olish
  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          isRu ? 'Доступ к камере запрещен' : 'Kameraga ruxsat berilmadi',
          isRu
            ? 'Пожалуйста, разрешите доступ к камере в настройках телефона.'
            : 'Iltimos, telefon sozlamalaridan kameraga ruxsat bering.'
        );
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
          Alert.alert(
            isRu ? 'Файл слишком большой' : 'Fayl hajmi juda katta',
            isRu
              ? 'Размер фото превышает 5 МБ. Пожалуйста, сделайте другое фото.'
              : 'Surat hajmi 5 MB dan katta. Iltimos, boshqa surat oling.'
          );
          setIsLoading(false);
          return;
        }

        onSelectAvatar(asset.uri);
        showToast(
          isRu ? '📸 Фото профиля обновлено!' : "📸 Rasm muvaffaqiyatli o'rnatildi!",
          'success'
        );
        if (onClose) onClose();
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        isRu ? 'Ошибка' : 'Xatolik',
        isRu ? 'Не удалось сделать фото' : 'Suratga olishda xatolik yuz berdi'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Emoji avatar tanlash
  const handleSelectEmoji = (emoji) => {
    onSelectAvatar(emoji);
    showToast(
      isRu ? `✨ Аватар ${emoji} установлен!` : `✨ ${emoji} avatari o'rnatildi!`,
      'success'
    );
    if (onClose) onClose();
  };

  // Rasmni o'chirish / Boshlang'ich harflarga qaytarish
  const handleResetAvatar = () => {
    onSelectAvatar('');
    showToast(
      isRu ? '🗑️ Аватар сброшен' : '🗑️ Standart holatga qaytarildi',
      'info'
    );
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="sparkles" size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.headerTitle}>
                    {isRu ? 'Аватар профиля' : 'Profil rasmi va Emoji'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
              >
                {/* 1. Galereyadan yoki Kameradan yuklash tugmalari */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionLabel}>
                    {isRu ? 'Загрузить с устройства:' : 'Qurilmadan yuklash:'}
                  </Text>
                  <View style={styles.sizeLimitBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
                    <Text style={styles.sizeLimitText}>
                      {isRu ? 'макс. 5 МБ' : 'maks. 5 MB'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.galleryBtn}
                    onPress={handlePickFromGallery}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#2563EB" size="small" />
                    ) : (
                      <>
                        <View style={styles.actionIconCircle}>
                          <Ionicons name="images" size={20} color="#2563EB" />
                        </View>
                        <View style={styles.actionTextCol}>
                          <Text style={styles.galleryBtnTitle}>
                            {isRu ? 'Из галереи' : 'Galereyadan'}
                          </Text>
                          <Text style={styles.galleryBtnSub}>
                            {isRu ? 'до 5 МБ' : '5 MB gacha'}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#2563EB" />
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cameraBtn}
                    onPress={handleTakePhoto}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cameraIconCircle}>
                      <Ionicons name="camera" size={18} color="#16A34A" />
                    </View>
                    <Text style={styles.cameraBtnText}>
                      {isRu ? 'Камера' : 'Kamera'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 2. Emojilar to'plami */}
                <View style={styles.emojiSectionHeader}>
                  <Text style={styles.sectionLabel}>
                    {isRu ? 'Или выберите 3D Emoji:' : 'Yoki qiziqarli Emoji tanlang:'}
                  </Text>
                </View>

                <View style={styles.emojiGrid}>
                  {EMOJI_AVATARS.map((item, idx) => {
                    const isSelected = currentAvatar === item.emoji;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.emojiItem,
                          { backgroundColor: item.bg, borderColor: item.border },
                          isSelected && styles.emojiItemSelected,
                        ]}
                        onPress={() => handleSelectEmoji(item.emoji)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.emojiCenterBox}>
                          <Text style={styles.emojiChar}>{item.emoji}</Text>
                        </View>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Ionicons name="checkmark-circle" size={14} color="#2563EB" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3. Standart holatga qaytarish */}
                {currentAvatar ? (
                  <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={handleResetAvatar}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={15} color="#EF4444" />
                    <Text style={styles.resetBtnText}>
                      {isRu ? 'Удалить аватар' : "Rasmni o'chirish"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingTop: 12,
    paddingBottom: 6,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
  },
  sizeLimitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  sizeLimitText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  galleryBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    gap: 8,
  },
  actionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  actionTextCol: {
    flex: 1,
  },
  galleryBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  galleryBtnSub: {
    fontSize: 10.5,
    color: '#60A5FA',
    marginTop: 1,
  },
  cameraBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    gap: 6,
  },
  cameraIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  emojiSectionHeader: {
    marginTop: 4,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  emojiItem: {
    width: '17.5%',
    aspectRatio: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  emojiItemSelected: {
    borderWidth: 2.5,
    borderColor: '#2563EB',
  },
  emojiCenterBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  emojiChar: {
    fontSize: 22,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    ...Platform.select({
      android: {
        marginTop: 0,
      },
    }),
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    gap: 6,
    marginTop: 4,
  },
  resetBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EF4444',
  },
});
