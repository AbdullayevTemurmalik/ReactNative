import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ConfirmModal = ({
  visible,
  title = "O'chirishni tasdiqlang",
  message = "Haqiqatan ham bu elementni o'chirmoqchimisiz?",
  confirmText = "O'chirish",
  cancelText = "Bekor qilish",
  onConfirm,
  onCancel,
  icon = "trash-outline",
  isDestructive = true,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Ikonka */}
          <View style={[styles.iconCircle, isDestructive ? styles.destructiveBg : styles.neutralBg]}>
            <Ionicons
              name={icon}
              size={32}
              color={isDestructive ? '#EF4444' : '#2563EB'}
            />
          </View>

          {/* Sarlavha va matn */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Tugmalar ustun shaklida (harflar aslo sig'may chiqib ketmaydi) */}
          <View style={styles.btnColumn}>
            <TouchableOpacity
              style={[styles.confirmBtn, isDestructive ? styles.destructiveBtn : styles.primaryBtn]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isDestructive ? 'trash-bin' : 'checkmark-circle'}
                size={18}
                color="#FFFFFF"
                style={styles.btnIcon}
              />
              <Text
                style={styles.confirmBtnText}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text
                style={styles.cancelBtnText}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 99999,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  destructiveBg: {
    backgroundColor: '#FEE2E2',
  },
  neutralBg: {
    backgroundColor: '#EFF6FF',
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  btnColumn: {
    width: '100%',
    gap: 10,
  },
  confirmBtn: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  destructiveBtn: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
  },
  btnIcon: {
    marginRight: 8,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelBtn: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});
