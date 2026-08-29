import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const LanguageBottomSheet = ({ visible, onClose }) => {
  const { language, setLanguage, t } = useApp();

  const LANGUAGES = [
    { id: 'uz', label: "O'zbek tili", flag: '🇺🇿', sub: 'Lotin yozuvi' },
    { id: 'ru', label: 'Русский язык', flag: '🇷🇺', sub: 'Кириллица' },
  ];

  const handleSelectLanguage = (langId) => {
    setLanguage(langId);
    onClose();
  };

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
            <View style={styles.sheet}>
              <View style={styles.handle} />
              
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{t('select_language_title')}</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsList}>
                {LANGUAGES.map((lang) => {
                  const isSelected = language === lang.id;
                  return (
                    <TouchableOpacity
                      key={lang.id}
                      style={[styles.langCard, isSelected && styles.langCardActive]}
                      onPress={() => handleSelectLanguage(lang.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.flagText}>{lang.flag}</Text>
                      <View style={styles.langInfo}>
                        <Text style={[styles.langLabel, isSelected && styles.langLabelActive]}>
                          {lang.label}
                        </Text>
                        <Text style={styles.langSub}>{lang.sub}</Text>
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  optionsList: {
    gap: 10,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  langCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  flagText: {
    fontSize: 26,
    marginRight: 14,
  },
  langInfo: {
    flex: 1,
  },
  langLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  langLabelActive: {
    color: '#2563EB',
  },
  langSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#2563EB',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
});
