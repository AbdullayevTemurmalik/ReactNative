import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
];

export const AvatarPickerModal = ({ visible, onClose, onSelectAvatar, currentAvatar }) => {
  const { language, showToast } = useApp();
  const isRu = language === 'ru';

  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [customUrl, setCustomUrl] = useState('');
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  const handleApply = (avatarUrl) => {
    const url = avatarUrl || selectedAvatar;
    if (!url) {
      Alert.alert(
        isRu ? 'Выберите аватар' : 'Rasmni tanlang',
        isRu ? 'Пожалуйста, выберите фото из списка или введите ссылку' : "Iltimos, ro'yxatdan rasm tanlang yoki havolani kiriting"
      );
      return;
    }
    onSelectAvatar(url);
    showToast(
      isRu ? '📸 Фото профиля обновлено!' : "📸 Profil rasmi yangilandi!",
      'success'
    );
    if (onClose) onClose();
  };

  const handleCustomUrlSubmit = () => {
    if (!customUrl.trim() || !customUrl.startsWith('http')) {
      Alert.alert(
        isRu ? 'Некорректная ссылка' : "Noto'g'ri havola",
        isRu ? 'Ссылка должна начинаться с https://' : "Rasm havolasi https:// bilan boshlanishi kerak"
      );
      return;
    }
    handleApply(customUrl.trim());
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
                    <Ionicons name="camera-outline" size={20} color="#2563EB" />
                  </View>
                  <Text style={styles.headerTitle}>
                    {isRu ? 'Выберите фото профиля' : 'Profil rasmini tanlang'}
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
                {/* Joriy tanlangan rasm */}
                <View style={styles.previewSection}>
                  <View style={styles.previewWrapper}>
                    {selectedAvatar ? (
                      <Image
                        source={{ uri: selectedAvatar }}
                        style={styles.previewImage}
                      />
                    ) : (
                      <View style={styles.previewPlaceholder}>
                        <Ionicons name="person" size={48} color="#94A3B8" />
                      </View>
                    )}
                    <View style={styles.cameraBadge}>
                      <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text style={styles.previewHint}>
                    {isRu
                      ? 'Выберите понравившийся аватар ниже'
                      : "Quyidagi tayyor professional rasmlardan birini tanlang"}
                  </Text>
                </View>

                {/* Tayyor avatarlar to'plami */}
                <Text style={styles.sectionLabel}>
                  {isRu ? 'Коллекция аватаров:' : "Rasmlar to'plami:"}
                </Text>
                <View style={styles.avatarGrid}>
                  {PRESET_AVATARS.map((url, idx) => {
                    const isSelected = selectedAvatar === url;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.avatarItem,
                          isSelected && styles.avatarItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedAvatar(url);
                        }}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: url }} style={styles.avatarImg} />
                        {isSelected && (
                          <View style={styles.checkOverlay}>
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color="#2563EB"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* O'z havolasini kiritish */}
                <View style={styles.customSection}>
                  <TouchableOpacity
                    style={styles.toggleCustomBtn}
                    onPress={() => setIsAddingUrl((prev) => !prev)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isAddingUrl ? 'chevron-up' : 'link-outline'}
                      size={18}
                      color="#2563EB"
                    />
                    <Text style={styles.toggleCustomText}>
                      {isRu
                        ? 'Использовать свою ссылку на фото'
                        : "O'z rasm havolangizni (URL) kiritish"}
                    </Text>
                  </TouchableOpacity>

                  {isAddingUrl && (
                    <View style={styles.urlInputRow}>
                      <TextInput
                        style={styles.urlInput}
                        placeholder="https://images.unsplash.com/..."
                        placeholderTextColor="#94A3B8"
                        value={customUrl}
                        onChangeText={setCustomUrl}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.urlSubmitBtn}
                        onPress={handleCustomUrlSubmit}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Saqlash tugmasi */}
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => handleApply(selectedAvatar)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>
                    {isRu ? 'Установить фото' : "Rasmni o'rnatish"}
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
    paddingVertical: 18,
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
  previewSection: {
    alignItems: 'center',
    marginBottom: 6,
  },
  previewWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#2563EB',
  },
  previewPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  previewHint: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  avatarItem: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  avatarItemSelected: {
    borderColor: '#2563EB',
    borderWidth: 3,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  checkOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  customSection: {
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleCustomText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 12.5,
    color: '#0F172A',
  },
  urlSubmitBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
});
