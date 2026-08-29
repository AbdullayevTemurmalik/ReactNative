import React, { useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { formatPhoneNumber, isPhoneValid } from '../utils/formatters';

export const AuthModal = ({ visible, onClose }) => {
  const { login, register, continueAsGuest, t, language, showToast } = useApp();
  const isRu = language === 'ru';

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login maydonlari
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register maydonlari
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+998 ');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Xatoliklar va yuklanish
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handlePhoneChange = (text, isReg = false) => {
    if (!text.startsWith('+998')) {
      if (isReg) setRegPhone('+998 ');
      else setPhone('+998 ');
      return;
    }
    const formatted = formatPhoneNumber(text);
    if (isReg) setRegPhone(formatted);
    else setPhone(formatted);
    if (errorMessage) setErrorMessage('');
  };

  // Kirish funksiyasi
  const handleLogin = () => {
    if (!isPhoneValid(phone)) {
      setErrorMessage(isRu ? 'Введите корректный номер телефона' : 'Telefon raqamini to\'liq kiriting (+998 90 123 45 67)');
      return;
    }
    if (!password.trim()) {
      setErrorMessage(isRu ? 'Введите пароль' : 'Parolni kiriting');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const res = login(phone, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || (isRu ? 'Неверный номер или пароль' : 'Telefon raqami yoki parol noto\'g\'ri'));
      } else {
        setPassword('');
        if (onClose) onClose();
      }
    }, 400);
  };

  // Ro'yxatdan o'tish funksiyasi
  const handleRegister = () => {
    if (!regName.trim()) {
      setErrorMessage(isRu ? 'Введите имя' : 'Ismingizni kiriting');
      return;
    }
    if (!isPhoneValid(regPhone)) {
      setErrorMessage(isRu ? 'Введите полный номер телефона' : 'Telefon raqamini to\'liq kiriting (+998 90 123 45 67)');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage(isRu ? 'Пароль должен содержать минимум 6 символов' : 'Parol kamida 6 ta belgidan iborat bo\'lishi shart');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage(isRu ? 'Пароли не совпадают' : 'Parollar bir-biriga mos kelmadi');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const res = register(regName, regPhone, regPassword);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error);
      } else {
        // Muvaffaqiyatli yaratildi modalini ko'rsatamiz
        setIsSuccessModalOpen(true);
      }
    }, 500);
  };

  const handleSuccessDone = () => {
    setIsSuccessModalOpen(false);
    // Login rejimiga o'tkazamiz va ma'lumotlarni to'ldirib beramiz
    setMode('login');
    setPhone(regPhone);
    setPassword(regPassword);
    setRegName('');
    setRegPhone('+998 ');
    setRegPassword('');
    setRegConfirmPassword('');
    showToast(
      isRu
        ? '✅ Аккаунт успешно создан! Нажмите «Войти»'
        : "✅ Akkaunt muvaffaqiyatli yaratildi! Endi «Kirish» tugmasini bosing",
      'success'
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (onClose) onClose();
      }}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                if (onClose) onClose();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
            <View style={styles.logoRow}>
              <Text style={styles.logoDark}>Smart</Text>
              <Text style={styles.logoBlue}>Bozor</Text>
            </View>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Sarlavha */}
            <View style={styles.headingSection}>
              <Text style={styles.mainTitle}>
                {mode === 'login' ? t('auth_welcome_back') : t('auth_create_title')}
              </Text>
              <Text style={styles.subTitle}>
                {mode === 'login' ? t('auth_login_sub') : t('auth_create_sub')}
              </Text>
            </View>

            {/* Xatolik xabari */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* LOGIN FORMASI */}
            {mode === 'login' ? (
              <View style={styles.form}>
                {/* Telefon raqam */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth_phone_label')}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="call-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="+998 90 123 45 67"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={(txt) => handlePhoneChange(txt, false)}
                      maxLength={17}
                    />
                  </View>
                </View>

                {/* Parol va ko'zcha ikonka */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth_password_label')}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
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
                      onPress={() => setShowPassword((prev) => !prev)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Kirish tugmasi */}
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>{t('auth_login_btn')}</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>

                {/* Akkaunt yo'q bo'lsa -> Bu yerni bosing !! */}
                <View style={styles.switchAuthRow}>
                  <Text style={styles.switchText}>{t('auth_no_account')} </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setMode('register');
                      setErrorMessage('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.switchLink}>{t('auth_click_here')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dividerRow}>
                  <View style={styles.line} />
                  <Text style={styles.orText}>yoki</Text>
                  <View style={styles.line} />
                </View>

                {/* Mehmon sifatida kirish */}
                <TouchableOpacity
                  style={styles.guestBtn}
                  onPress={continueAsGuest}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-outline" size={18} color="#475569" />
                  <Text style={styles.guestBtnText}>{t('auth_guest_btn')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* RO'YXATDAN O'TISH (REGISTER) FORMASI */
              <View style={styles.form}>
                {/* Ism va Familiya */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth_name_label')}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth_name_placeholder')}
                      placeholderTextColor="#94A3B8"
                      value={regName}
                      onChangeText={(t) => {
                        setRegName(t);
                        if (errorMessage) setErrorMessage('');
                      }}
                    />
                  </View>
                </View>

                {/* Telefon raqam */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth_phone_label')}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="call-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="+998 90 123 45 67"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      value={regPhone}
                      onChangeText={(txt) => handlePhoneChange(txt, true)}
                      maxLength={17}
                    />
                  </View>
                </View>

                {/* Parol va ko'zcha */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth_password_label')}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth_password_placeholder')}
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showRegPassword}
                      value={regPassword}
                      onChangeText={(t) => {
                        setRegPassword(t);
                        if (errorMessage) setErrorMessage('');
                      }}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowRegPassword((p) => !p)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showRegPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Parolni tasdiqlash va ko'zcha */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth_confirm_pass_label')}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showConfirmPassword}
                      value={regConfirmPassword}
                      onChangeText={(t) => {
                        setRegConfirmPassword(t);
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
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Akkaunt yaratish tugmasi */}
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>{t('auth_register_btn')}</Text>
                      <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>

                {/* Allaqachon akkaunt bormi? -> Kirish */}
                <View style={styles.switchAuthRow}>
                  <Text style={styles.switchText}>{t('auth_have_account')} </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setMode('login');
                      setErrorMessage('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.switchLink}>{t('auth_signin_link')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* AKKAUNT MUKAMMAL YARATILDI MODALI */}
        <Modal
          visible={isSuccessModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={handleSuccessDone}
        >
          <View style={styles.overlay}>
            <View style={styles.successCard}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark-done-circle" size={72} color="#16A34A" />
              </View>

              <Text style={styles.successTitle}>{t('auth_created_success_title')}</Text>
              <Text style={styles.successDesc}>{t('auth_created_success_desc')}</Text>

              <TouchableOpacity
                style={styles.successBtn}
                onPress={handleSuccessDone}
                activeOpacity={0.85}
              >
                <Text style={styles.successBtnText}>{t('auth_signin_link')} va Boshlash</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
  },
  logoDark: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  logoBlue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  headingSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
    flex: 1,
  },
  form: {
    gap: 16,
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
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
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
  primaryBtn: {
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  switchText: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  guestBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  successCircle: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  successDesc: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  successBtn: {
    backgroundColor: '#16A34A',
    width: '100%',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
