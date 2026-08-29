import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const EditProfileModal = ({ visible, onClose }) => {
  const { currentUser, updateProfile, language } = useApp();
  const isRu = language === 'ru';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && currentUser) {
      setName(currentUser.name || '');
      setPassword('');
      setConfirmPassword('');
      setErrorMessage('');
    }
  }, [visible, currentUser]);

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMessage(isRu ? 'Введите имя' : 'Ismingizni kiriting');
      return;
    }

    if (password) {
      if (password.length < 4) {
        setErrorMessage(
          isRu
            ? 'Пароль должен содержать не менее 4 символов'
            : "Parol kamida 4 ta belgidan iborat bo'lishi kerak"
        );
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(
          isRu ? 'Пароли не совпадают' : 'Parollar bir-biriga mos kelmadi'
        );
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const res = updateProfile(name, password);
      setIsLoading(false);
      if (res.success) {
        if (onClose) onClose();
      } else {
        setErrorMessage(res.error || 'Xatolik yuz berdi');
      }
    }, 400);
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.titleRow}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="person-circle-outline" size={22} color="#2563EB" />
                    </View>
                    <Text style={styles.headerTitle}>
                      {isRu ? 'Редактировать профиль' : 'Profilni tahrirlash'}
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

                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scroll}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Ism va Familiya */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      {isRu ? 'Имя и Фамилия' : 'Ism va Familiya'}
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="person-outline"
                        size={18}
                        color="#64748B"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder={isRu ? 'Ваше имя' : 'Ismingizni kiriting'}
                        placeholderTextColor="#94A3B8"
                        value={name}
                        onChangeText={(t) => {
                          setName(t);
                          if (errorMessage) setErrorMessage('');
                        }}
                      />
                    </View>
                  </View>

                  {/* Telefon raqam */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      {isRu ? 'Номер телефона' : 'Telefon raqam'}
                    </Text>
                    <View style={[styles.inputWrapper, styles.inputDisabled]}>
                      <Ionicons
                        name="call-outline"
                        size={18}
                        color="#94A3B8"
                        style={styles.inputIcon}
                      />
                      <Text style={styles.disabledText}>
                        {currentUser?.phone || '+998 90 123 45 67'}
                      </Text>
                      <Ionicons
                        name="lock-closed"
                        size={16}
                        color="#94A3B8"
                        style={{ marginLeft: 'auto' }}
                      />
                    </View>
                  </View>

                  {/* Parol bo'limi sarlavhasi */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>
                      {isRu ? 'Смена пароля (по желанию)' : "Parolni o'zgartirish (ixtiyoriy)"}
                    </Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Yangi parol */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      {isRu ? 'Новый пароль' : 'Yangi parol'}
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="key-outline"
                        size={18}
                        color="#64748B"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder={isRu ? 'Введите новый пароль' : 'Yangi parolni kiriting'}
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={(t) => {
                          setPassword(t);
                          if (errorMessage) setErrorMessage('');
                        }}
                      />
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowPassword((p) => !p)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={18}
                          color="#64748B"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Parolni tasdiqlash */}
                  {password.length > 0 && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {isRu ? 'Подтвердите пароль' : 'Parolni tasdiqlang'}
                      </Text>
                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={18}
                          color="#64748B"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder={isRu ? 'Повторите новый пароль' : 'Yangi parolni qayta kiriting'}
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showConfirmPassword}
                          value={confirmPassword}
                          onChangeText={(t) => {
                            setConfirmPassword(t);
                            if (errorMessage) setErrorMessage('');
                          }}
                        />
                        <TouchableOpacity
                          style={styles.eyeBtn}
                          onPress={() => setShowConfirmPassword((p) => !p)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons
                            name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                            size={18}
                            color="#64748B"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Saqlash tugmasi */}
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={19}
                          color="#FFFFFF"
                        />
                        <Text style={styles.saveBtnText}>
                          {isRu ? 'Сохранить изменения' : "O'zgarishlarni saqlash"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
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
  keyboardView: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    padding: 20,
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#B91C1C',
    flex: 1,
  },
  scroll: {
    paddingTop: 14,
    paddingBottom: 8,
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  disabledText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
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
