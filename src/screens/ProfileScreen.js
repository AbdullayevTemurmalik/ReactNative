import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/formatters';

// Modallar
import { LanguageBottomSheet } from '../components/LanguageBottomSheet';
import { AddressesModal } from '../components/AddressesModal';
import { SecurityPrivacyModal } from '../components/SecurityPrivacyModal';
import { SupportModal } from '../components/SupportModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { EditProfileModal } from '../components/EditProfileModal';
import { OrdersModal } from '../components/OrdersModal';
import { AvatarPickerModal } from '../components/AvatarPickerModal';

export const ProfileScreen = () => {
  const {
    currentUser,
    setIsAuthModalVisible,
    logout,
    orders,
    favorites,
    unreadNotifsCount,
    setActiveTab,
    updateProfile,
    checkForUpdates,
    setIsAiChatVisible,
    t,
    language,
  } = useApp();

  const isRu = language === 'ru';
  const isGuest = !currentUser || currentUser.isGuest;

  const [isLangSheetOpen, setIsLangSheetOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile_title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* FOYDALANUVCHI / MEHMON KARTOCHKASI */}
        {isGuest ? (
          <View style={styles.guestBanner}>
            <View style={styles.guestAvatar}>
              <Ionicons name="person-outline" size={28} color="#2563EB" />
            </View>
            <View style={styles.guestInfo}>
              <Text style={styles.guestTitle}>
                {isRu ? 'Вы вошли как гость' : 'Siz mehmon rejimidasiz'}
              </Text>
              <Text style={styles.guestSub}>
                {isRu
                  ? 'Войдите в аккаунт для сохранения заказов и покупок'
                  : 'Xaridlaringizni saqlash uchun profilingizga kiring'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.loginCardBtn}
              onPress={() => setIsAuthModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.loginCardBtnText}>{t('auth_login_btn')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.userCard}>
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => setIsAvatarPickerOpen(true)}
              activeOpacity={0.8}
            >
              {currentUser?.avatar ? (
                currentUser.avatar.includes('/') || currentUser.avatar.startsWith('file:') || currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('data:') ? (
                  <Image
                    source={{ uri: currentUser.avatar }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <View style={styles.emojiAvatar}>
                    <Text style={styles.emojiAvatarText}>{currentUser.avatar}</Text>
                  </View>
                )
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {currentUser?.name
                      ? currentUser.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'TM'}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={11} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{currentUser?.name || 'Foydalanuvchi'}</Text>
              <Text style={styles.userPhone}>{currentUser?.phone || '+998 90 123 45 67'}</Text>
            </View>

            <View style={styles.userCardActions}>
              <TouchableOpacity
                style={styles.editIconBtn}
                onPress={() => setIsEditProfileOpen(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil-outline" size={19} color="#2563EB" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutIconBtn}
                onPress={() => setIsLogoutModalOpen(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Statistika kartochkasi (Faqat Buyurtmalar va Sevimlilar) */}
        <View style={styles.statsCard}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setIsOrdersOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.statIconRow}>
              <Ionicons name="receipt" size={18} color="#2563EB" />
              <Text style={styles.statValue}>
                {orders.length} {t('items_count')}
              </Text>
            </View>
            <Text style={styles.statLabel}>{t('my_orders_title')}</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setActiveTab('favorites')}
            activeOpacity={0.7}
          >
            <View style={styles.statIconRow}>
              <Ionicons name="heart" size={18} color="#EF4444" />
              <Text style={[styles.statValue, { color: '#EF4444' }]}>
                {favorites.length} {t('items_count')}
              </Text>
            </View>
            <Text style={styles.statLabel}>{t('nav_favorites')}</Text>
          </TouchableOpacity>
        </View>

        {/* MENING BUYURTMALARIM BO'LIMI */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('my_orders_title')}</Text>
            {orders.length > 0 && (
              <TouchableOpacity
                onPress={() => setIsOrdersOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>
                  {isRu ? 'Все заказы' : "Barchasi"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {orders.length === 0 ? (
            <TouchableOpacity
              style={styles.noOrdersCard}
              onPress={() => setIsOrdersOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="receipt-outline" size={36} color="#94A3B8" />
              <Text style={styles.noOrdersText}>{t('no_orders')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.ordersList}>
              {orders.slice(0, 3).map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => setIsOrdersOpen(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>#{order.id}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.date).toLocaleDateString(isRu ? 'ru-RU' : 'uz-UZ', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                  </View>

                  <View style={styles.orderItemsPreview}>
                    <Text style={styles.orderItemsCount}>
                      {order.items?.length || 0} {t('items_count')} ({order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0} dona)
                    </Text>
                    <Text style={styles.orderTotal}>{formatPrice(order.totalAmount)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* SOZLAMALAR VA MENYU */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{t('settings_title')}</Text>

          <View style={styles.menuCard}>
            {/* Buyurtmalarim menyusi */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setIsOrdersOpen(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#2563EB15' }]}>
                <Ionicons name="receipt-outline" size={20} color="#2563EB" />
              </View>
              <Text style={styles.menuItemLabel}>{t('my_orders_title')}</Text>
              {orders.length > 0 && (
                <View style={styles.menuOrdersBadge}>
                  <Text style={styles.menuOrdersBadgeText}>{orders.length}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
            {/* Manzillarim */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setIsAddressesOpen(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#2563EB15' }]}>
                <Ionicons name="location-outline" size={20} color="#2563EB" />
              </View>
              <Text style={styles.menuItemLabel}>{t('menu_addresses')}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Bildirishnomalar */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setIsNotifsOpen(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#F59E0B15' }]}>
                <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.menuItemLabel}>{t('menu_notifications')}</Text>
              {unreadNotifsCount > 0 && (
                <View style={styles.menuNotifBadge}>
                  <Text style={styles.menuNotifText}>{unreadNotifsCount}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Ilova tili */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setIsLangSheetOpen(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#10B98115' }]}>
                <Ionicons name="language-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.menuItemLabel}>{t('menu_language')}</Text>
              <View style={styles.langValueBadge}>
                <Text style={styles.langValueText}>
                  {language === 'ru' ? '🇷🇺 Русский' : "🇺🇿 O'zbekcha"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>

            {/* SmartBozor AI Yordamchi (Gemini AI) */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setIsAiChatVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#2563EB15' }]}>
                <Ionicons name="sparkles" size={20} color="#2563EB" />
              </View>
              <Text style={styles.menuItemLabel}>
                {isRu ? 'AI-Помощник SmartBozor' : 'SmartBozor AI Yordamchi'}
              </Text>
              <View style={[styles.otaBadge, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[styles.otaBadgeText, { color: '#2563EB' }]}>Gemini AI</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Qo'llab-quvvatlash (@TM_Backdev) */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setIsSupportOpen(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#2AABEE15' }]}>
                <Ionicons name="headset-outline" size={20} color="#2AABEE" />
              </View>
              <Text style={styles.menuItemLabel}>{t('menu_support')}</Text>
              <View style={styles.tgValueBadge}>
                <Text style={styles.tgValueText}>@TM_Backdev</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Xavfsizlik va maxfiylik */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setIsSecurityOpen(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#0F172A15' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#0F172A" />
              </View>
              <Text style={styles.menuItemLabel}>{t('menu_privacy')}</Text>
              <View style={styles.securityBadge}>
                <Text style={styles.securityBadgeText}>100%</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Yangilanishlarni tekshirish (OTA Updates) */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => checkForUpdates(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#2563EB15' }]}>
                <Ionicons name="cloud-download-outline" size={20} color="#2563EB" />
              </View>
              <Text style={styles.menuItemLabel}>
                {isRu ? 'Проверить обновления' : 'Yangilanishlarni tekshirish'}
              </Text>
              <View style={styles.otaBadge}>
                <Text style={styles.otaBadgeText}>OTA</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Versiya */}
        <Text style={styles.versionText}>SmartBozor Mobile v1.22.3 (Expo SDK 54)</Text>
      </ScrollView>

      {/* MODALLAR */}
      <LanguageBottomSheet visible={isLangSheetOpen} onClose={() => setIsLangSheetOpen(false)} />
      <AddressesModal visible={isAddressesOpen} onClose={() => setIsAddressesOpen(false)} />
      <SecurityPrivacyModal visible={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
      <SupportModal visible={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <NotificationsModal visible={isNotifsOpen} onClose={() => setIsNotifsOpen(false)} />
      <EditProfileModal visible={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <OrdersModal visible={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />
      <AvatarPickerModal
        visible={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        currentAvatar={currentUser?.avatar}
        onSelectAvatar={(url) =>
          updateProfile(currentUser?.name, null, currentUser?.phone, url)
        }
      />
      
      {/* CHIQISHNI TASDIQLASH */}
      <ConfirmModal
        visible={isLogoutModalOpen}
        title={t('auth_logout')}
        message={t('auth_logout_confirm')}
        confirmText={t('auth_logout')}
        cancelText={t('cancel_btn')}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        icon="log-out-outline"
        isDestructive={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  guestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestInfo: {
    marginLeft: 12,
    flex: 1,
  },
  guestTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E40AF',
  },
  guestSub: {
    fontSize: 11.5,
    color: '#3B82F6',
    marginTop: 2,
    lineHeight: 16,
  },
  loginCardBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loginCardBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  avatarBtn: {
    position: 'relative',
  },
  avatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  emojiAvatarText: {
    fontSize: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  vipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    gap: 2,
  },
  vipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#854D0E',
  },
  userPhone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  editPencilBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  userCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  menuOrdersBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  menuOrdersBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  ordersSection: {
    marginBottom: 20,
  },
  noOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noOrdersText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
  },
  ordersList: {
    gap: 10,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 10,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  orderItemsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemsCount: {
    fontSize: 13,
    color: '#64748B',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2563EB',
  },
  menuSection: {
    marginBottom: 20,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  menuNotifBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  menuNotifText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  langValueBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  langValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  tgValueBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  tgValueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  securityBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  securityBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  otaBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  otaBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#2563EB',
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
  },
});
