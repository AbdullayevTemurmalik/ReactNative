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
import { formatPhoneNumber, isPhoneValid, isPasswordStrong, getPasswordStrength } from '../utils/formatters';

export const EditProfileModal = ({ visible, onClose }) => {
  const { currentUser, updateProfile, language } = useApp();
  const isRu = language === 'ru';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone ? formatPhoneNumber(currentUser.phone) : '+998 ');
      setPassword('');
      setConfirmPassword('');
      setErrorMessage('');
    }
  }, [visible, currentUser]);

  const handlePhoneChange = (text) => {
    if (!text.startsWith('+998')) {
      setPhone('+998 ');
      return;
    }
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
    if (errorMessage) setErrorMessage('');
  };

  const passStrength = getPasswordStrength(password);

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMessage(isRu ? 'Введите имя' : 'Ismingizni kiriting');
      return;
    }

    if (!isPhoneValid(phone)) {
      setErrorMessage(
        isRu
          ? 'Введите корректный номер телефона'
          : "Telefon raqamini to'liq kiriting (+998 90 123 45 67)"
      );
      return;
    }

    if (password) {
      if (!isPasswordStrong(password)) {
        setErrorMessage(
          isRu
            ? '⚠️ Пароль должен содержать минимум 6 символов, 1 букву и 1 цифру'
            : "⚠️ Parol kamida 6 ta belgi, 1 ta harf va 1 ta raqamdan iborat bo'lishi shart"
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
      const res = updateProfile(name, password, phone);
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
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="call-outline"
                        size={18}
                        color="#2563EB"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        keyboardType="phone-pad"
                        placeholder="+998 90 123 45 67"
                        placeholderTextColor="#94A3B8"
                        value={phone}
                        onChangeText={handlePhoneChange}
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

                    {/* Jonli Kuchlilik Indikatori (Qizil / Sariq / Ko'k) */}
                    {password.length > 0 && (
                      <View
                        style={[
                          styles.strengthCard,
                          {
                            backgroundColor: passStrength.bgColor,
                            borderColor: passStrength.color + '35',
                          },
                        ]}
                      >
                        <View style={styles.strengthTopRow}>
                          <View style={styles.strengthLabelRow}>
                            <View
                              style={[
                                styles.strengthDot,
                                { backgroundColor: passStrength.color },
                              ]}
                            />
                            <Text
                              style={[
                                styles.strengthTitle,
                                { color: passStrength.color },
                              ]}
                            >
                              {isRu ? passStrength.label_ru : passStrength.label}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.strengthDesc,
                              { color: passStrength.color },
                            ]}
                          >
                            {isRu ? passStrength.desc_ru : passStrength.desc}
                          </Text>
                        </View>

                        {/* 3 qismli rangli progress chizig'i */}
                        <View style={styles.strengthBarsRow}>
                          <View
                            style={[
                              styles.strengthBar,
                              {
                                backgroundColor:
                                  passStrength.score >= 1
                                    ? passStrength.score === 1
                                      ? '#EF4444'
                                      : passStrength.score === 2
                                      ? '#F59E0B'
                                      : '#2563EB'
                                    : '#E2E8F0',
                              },
                            ]}
                          />
                          <View
                            style={[
                              styles.strengthBar,
                              {
                                backgroundColor:
                                  passStrength.score >= 2
                                    ? passStrength.score === 2
                                      ? '#F59E0B'
                                      : '#2563EB'
                                    : '#E2E8F0',
                              },
                            ]}
                          />
                          <View
                            style={[
                              styles.strengthBar,
                              {
                                backgroundColor:
                                  passStrength.score >= 3
                                    ? '#2563EB'
                                    : '#E2E8F0',
                              },
                            ]}
                          />
                        </View>
                      </View>
                    )}

                    <View
                      style={[
                        styles.inputWrapper,
                        password.length > 0 && !isPasswordStrong(password)
                          ? styles.inputError
                          : null,
                      ]}
                    >
                      <Ionicons
                        name="key-outline"
                        size={18}
                        color={
                          password.length > 0
                            ? passStrength.color
                            : '#64748B'
                        }
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder={
                          isRu ? 'Введите новый пароль' : 'Yangi parolni kiriting'
                        }
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
                      <View
                        style={[
                          styles.inputWrapper,
                          confirmPassword.length > 0 && confirmPassword !== password
                            ? styles.inputError
                            : null,
                        ]}
                      >
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={18}
                          color={
                            confirmPassword.length > 0 && confirmPassword !== password
                              ? '#DC2626'
                              : '#64748B'
                          }
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder={
                            isRu
                              ? 'Повторите новый пароль'
                              : 'Yangi parolni qayta kiriting'
                          }
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
                            name={
                              showConfirmPassword
                                ? 'eye-outline'
                                : 'eye-off-outline'
                            }
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
  strengthCard: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    gap: 8,
  },
  strengthTopRow: {
    gap: 2,
  },
  strengthLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  strengthTitle: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  strengthDesc: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 14,
  },
  strengthBarsRow: {
    flexDirection: 'row',
    gap: 6,
    height: 5,
  },
  strengthBar: {
    flex: 1,
    borderRadius: 3,
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
  inputError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
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
