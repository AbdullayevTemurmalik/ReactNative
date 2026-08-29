import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { formatPrice, formatPhoneNumber, isPhoneValid } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';

export const CartScreen = () => {
  const {
    cart,
    cartUniqueCount,
    cartTotalCount,
    cartTotalPrice,
    cartTotalDiscount,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    setActiveTab,
    showToast,
    t,
    language,
  } = useApp();

  const isRu = language === 'ru';

  // Promo kod holati
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Checkout modal holati
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+998 ');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('payme');
  
  // O'chirishni tasdiqlash modali holati
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Modal ichidagi xatoliklar va ogohlantirish banneri
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: false, phone: false, address: false });
  const errorAnim = useRef(new Animated.Value(0)).current;

  // Buyurtma yakunlangani holati
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const displayModalError = (message, errors = {}) => {
    setFormError(message);
    setFieldErrors(errors);

    Animated.sequence([
      Animated.timing(errorAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(errorAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(errorAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handlePhoneChange = (text) => {
    if (!text.startsWith('+998')) {
      setPhoneNumber('+998 ');
      return;
    }
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);

    if (fieldErrors.phone && isPhoneValid(formatted)) {
      setFieldErrors((prev) => ({ ...prev, phone: false }));
      if (formError.toLowerCase().includes('telefon') || formError.toLowerCase().includes('телефон')) setFormError('');
    }
  };

  const handleNameChange = (text) => {
    setCustomerName(text);
    if (fieldErrors.name && text.trim().length > 0) {
      setFieldErrors((prev) => ({ ...prev, name: false }));
      if (formError.toLowerCase().includes('ism') || formError.toLowerCase().includes('имя')) setFormError('');
    }
  };

  const handleAddressChange = (text) => {
    setAddress(text);
    if (fieldErrors.address && text.trim().length > 0) {
      setFieldErrors((prev) => ({ ...prev, address: false }));
      if (formError.toLowerCase().includes('manzil') || formError.toLowerCase().includes('адрес')) setFormError('');
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'SMART10' || code === 'CHEGIRMA10') {
      setAppliedPromo({ code, discountPercent: 10 });
      showToast(isRu ? '🎉 Промокод на скидку 10% применен!' : '🎉 10% qo\'shimcha promo-chegirma qo\'llandi!', 'success');
      setPromoCode('');
    } else if (code === 'PRO20' || code === 'YANGI20') {
      setAppliedPromo({ code, discountPercent: 20 });
      showToast(isRu ? '🎉 Промокод на скидку 20% применен!' : '🎉 20% maxsus promo-chegirma qo\'llandi!', 'success');
      setPromoCode('');
    } else {
      showToast(isRu ? '❌ Неверный промокод' : '❌ Noto\'g\'ri promo kod kiritildi', 'error');
    }
  };

  const promoDiscountAmount = appliedPromo
    ? Math.round((cartTotalPrice * appliedPromo.discountPercent) / 100)
    : 0;

  const finalTotalPrice = Math.max(0, cartTotalPrice - promoDiscountAmount);

  const handleConfirmOrder = () => {
    const errors = {
      name: !customerName.trim(),
      phone: !isPhoneValid(phoneNumber),
      address: !address.trim(),
    };

    if (errors.name || errors.phone || errors.address) {
      let msg = isRu
        ? 'Пожалуйста, заполните поля, выделенные красным цветом!'
        : 'Iltimos, qizil bilan belgilangan maydonlarni to\'g\'ri to\'ldiring!';
      if (errors.name) {
        msg = isRu ? '⚠️ Введите имя и фамилию' : '⚠️ Ism va familiyangizni kiriting';
      } else if (errors.phone) {
        msg = isRu
          ? '⚠️ Введите полный номер телефона (+998 90 123 45 67)'
          : '⚠️ Telefon raqamini to\'liq kiriting (+998 90 123 45 67)';
      } else if (errors.address) {
        msg = isRu ? '⚠️ Введите адрес доставки' : '⚠️ Yetkazib berish manzilini kiriting';
      }

      displayModalError(msg, errors);
      return;
    }

    const orderData = {
      customerName,
      phoneNumber,
      address,
      paymentMethod,
      promoCode: appliedPromo?.code || null,
      finalAmount: finalTotalPrice,
    };

    const newOrder = placeOrder(orderData);
    if (newOrder) {
      setLastOrder(newOrder);
      setIsCheckoutModalOpen(false);
      setIsOrderComplete(true);
      setAppliedPromo(null);
      setCustomerName('');
      setPhoneNumber('+998 ');
      setAddress('');
      setFormError('');
      setFieldErrors({ name: false, phone: false, address: false });
    }
  };

  const handleConfirmDeleteSingle = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('cart_title')}</Text>
        {cart.length > 0 && (
          <TouchableOpacity
            onPress={() => setIsClearAllModalOpen(true)}
            style={styles.clearBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.clearBtnText}>{t('clear_cart')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bag-handle-outline" size={60} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>{t('cart_empty_title')}</Text>
          <Text style={styles.emptySubtitle}>{t('cart_empty_sub')}</Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.85}
          >
            <Text style={styles.shopNowText}>{t('view_products')}</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Mahsulotlar ro'yxati */}
          <View style={styles.listContainer}>
            {cart.map((item) => {
              const isMinQty = item.quantity <= 1;
              return (
                <View key={item.id} style={styles.cartCard}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemCategory}>{t(item.categoryKey || 'cat_all')}</Text>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                      {item.quantity > 1 && (
                        <Text style={styles.unitPriceText}>({formatPrice(item.price)} × {item.quantity})</Text>
                      )}
                    </View>

                    {/* Miqdor tugmalari */}
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={[styles.qtyBtn, isMinQty && styles.qtyBtnDisabled]}
                        onPress={() => {
                          if (!isMinQty) {
                            updateCartQuantity(item.id, -1);
                          }
                        }}
                        activeOpacity={isMinQty ? 1 : 0.7}
                      >
                        <Ionicons
                          name="remove"
                          size={16}
                          color={isMinQty ? '#CBD5E1' : '#0F172A'}
                        />
                      </TouchableOpacity>

                      <Text style={styles.qtyValue}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateCartQuantity(item.id, 1)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={16} color="#0F172A" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => setItemToDelete(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Promo kod qutisi */}
          <View style={styles.promoSection}>
            <Text style={styles.sectionHeading}>{t('promocode_title')}</Text>
            <View style={styles.promoInputRow}>
              <TextInput
                style={styles.promoInput}
                placeholder={t('promocode_placeholder')}
                placeholderTextColor="#94A3B8"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.applyPromoBtn}
                onPress={handleApplyPromo}
                activeOpacity={0.8}
              >
                <Text style={styles.applyPromoText}>{t('promocode_apply')}</Text>
              </TouchableOpacity>
            </View>

            {appliedPromo && (
              <View style={styles.appliedPromoBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text style={styles.appliedPromoText}>
                  {isRu
                    ? `Промокод '${appliedPromo.code}' активен (-${appliedPromo.discountPercent}%)`
                    : `Promokod '${appliedPromo.code}' faol (-${appliedPromo.discountPercent}%)`}
                </Text>
                <TouchableOpacity onPress={() => setAppliedPromo(null)}>
                  <Ionicons name="close" size={16} color="#16A34A" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Narxlar xulosasi */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionHeading}>{t('order_summary')}</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('items_total')}</Text>
              <Text style={styles.summaryValue}>
                {cartUniqueCount} {t('items_count')} ({cartTotalCount} dona)
              </Text>
            </View>

            {cartTotalDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('discounts_total')}</Text>
                <Text style={styles.discountValue}>-{formatPrice(cartTotalDiscount)}</Text>
              </View>
            )}

            {appliedPromo && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('promo_discount')}</Text>
                <Text style={styles.discountValue}>-{formatPrice(promoDiscountAmount)}</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('free_delivery')}</Text>
              <Text style={styles.freeDeliveryValue}>{t('free_badge')}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{t('final_total')}</Text>
              <Text style={styles.totalValue}>{formatPrice(finalTotalPrice)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => {
                setFormError('');
                setFieldErrors({ name: false, phone: false, address: false });
                setIsCheckoutModalOpen(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutBtnText}>
                {t('checkout_btn')} ({formatPrice(finalTotalPrice)})
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* BITTA MAHSULOTNI O'CHIRISH MODALI */}
      <ConfirmModal
        visible={!!itemToDelete}
        title={isRu ? 'Удаление из корзины' : "Savatdan o'chirish"}
        message={
          itemToDelete
            ? isRu
              ? `Вы действительно хотите удалить "${itemToDelete.name}" из корзины?`
              : `"${itemToDelete.name}" mahsulotini savatdan o'chirmoqchimisiz?`
            : ''
        }
        confirmText={isRu ? 'Удалить' : "Ha, o'chirish"}
        cancelText={isRu ? 'Bekor qilish' : 'Bekor qilish'}
        onConfirm={handleConfirmDeleteSingle}
        onCancel={() => setItemToDelete(null)}
        icon="trash-outline"
        isDestructive={true}
      />

      {/* BARCHA SAVATNI TOZALASH MODALI */}
      <ConfirmModal
        visible={isClearAllModalOpen}
        title={isRu ? 'Очистить корзину' : 'Savatni tozalash'}
        message={
          isRu
            ? 'Вы действительно хотите удалить все товары из корзины?'
            : 'Haqiqatan ham savatdagi barcha mahsulotlarni tozalab tashlamoqchimisiz?'
        }
        confirmText={isRu ? 'Очистить корзину' : 'Savatni tozalash'}
        cancelText={isRu ? 'Отмена' : 'Bekor qilish'}
        onConfirm={() => {
          clearCart();
          setIsClearAllModalOpen(false);
        }}
        onCancel={() => setIsClearAllModalOpen(false)}
        icon="trash-bin-outline"
        isDestructive={true}
      />

      {/* CHECKOUT MODALI */}
      <Modal
        visible={isCheckoutModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCheckoutModalOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsCheckoutModalOpen(false)}
              >
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>{t('checkout_title')}</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.checkoutBody}>
              {/* MODAL ICHIDAGI OGOHLANTIRISH / XATOLIK BANNERI */}
              {formError ? (
                <Animated.View style={[styles.errorBanner, { transform: [{ scale: errorAnim }] }]}>
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text style={styles.errorBannerText}>{formError}</Text>
                </Animated.View>
              ) : null}

              <View style={styles.orderSummaryMini}>
                <Text style={styles.miniLabel}>{t('amount_to_pay')}</Text>
                <Text style={styles.miniValue}>{formatPrice(finalTotalPrice)}</Text>
              </View>

              {/* Form maydonlari */}
              <View style={styles.fieldHeaderRow}>
                <Text style={styles.inputLabel}>{t('name_label')}</Text>
                {fieldErrors.name && (
                  <Text style={styles.fieldErrorText}>
                    {isRu ? 'Обязательно для заполнения' : 'To\'ldirilishi shart'}
                  </Text>
                )}
              </View>
              <TextInput
                style={[styles.modalInput, fieldErrors.name && styles.inputErrorBorder]}
                placeholder={t('name_placeholder')}
                placeholderTextColor="#94A3B8"
                value={customerName}
                onChangeText={handleNameChange}
              />

              <View style={styles.phoneLabelRow}>
                <Text style={styles.inputLabel}>{t('phone_label')}</Text>
                {fieldErrors.phone ? (
                  <Text style={styles.fieldErrorText}>
                    {isRu ? 'Введите 9 цифр номера' : 'To\'liq 9 ta raqam kiriting'}
                  </Text>
                ) : (
                  <Text style={styles.phoneHint}>{t('phone_hint')}</Text>
                )}
              </View>
              <TextInput
                style={[
                  styles.modalInput,
                  fieldErrors.phone
                    ? styles.inputErrorBorder
                    : isPhoneValid(phoneNumber)
                    ? styles.inputValid
                    : null,
                ]}
                placeholder="+998 90 123 45 67"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                maxLength={17}
              />

              <View style={styles.fieldHeaderRow}>
                <Text style={styles.inputLabel}>{t('address_label')}</Text>
                {fieldErrors.address && (
                  <Text style={styles.fieldErrorText}>
                    {isRu ? 'Укажите адрес' : 'Manzilni kiriting'}
                  </Text>
                )}
              </View>
              <TextInput
                style={[
                  styles.modalInput,
                  styles.textArea,
                  fieldErrors.address && styles.inputErrorBorder,
                ]}
                placeholder={t('address_placeholder')}
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={address}
                onChangeText={handleAddressChange}
              />

              {/* To'lov usuli */}
              <Text style={styles.inputLabel}>{t('payment_method_title')}</Text>
              <View style={styles.paymentMethods}>
                {[
                  { id: 'payme', label: 'Payme', icon: 'card-outline' },
                  { id: 'click', label: 'Click', icon: 'phone-portrait-outline' },
                  { id: 'cash', label: t('pay_cash'), icon: 'cash-outline' },
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.paymentCard, isSelected && styles.paymentCardActive]}
                      onPress={() => setPaymentMethod(m.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={m.icon}
                        size={20}
                        color={isSelected ? '#2563EB' : '#64748B'}
                      />
                      <Text
                        style={[styles.paymentCardText, isSelected && styles.paymentCardTextActive]}
                      >
                        {m.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#2563EB" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.confirmOrderBtn}
                onPress={handleConfirmOrder}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmOrderText}>{t('confirm_order')}</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* BUYURTMA MUVAFFAQIYATLI MODALI */}
      <Modal
        visible={isOrderComplete}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOrderComplete(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.successCard}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark-done-circle" size={64} color="#16A34A" />
            </View>

            <Text style={styles.successTitle}>{t('order_success_title')}</Text>
            <Text style={styles.orderIdBadge}>
              ID: #{lastOrder ? lastOrder.id : 'ORD-12345'}
            </Text>

            <Text style={styles.successDesc}>{t('order_success_desc')}</Text>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setIsOrderComplete(false);
                setActiveTab('profile');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>{t('go_to_orders')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  shopNowBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  listContainer: {
    gap: 12,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  itemImage: {
    width: 75,
    height: 75,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemCategory: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  priceContainer: {
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2563EB',
  },
  unitPriceText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.45,
    backgroundColor: '#F8FAFC',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  deleteBtn: {
    padding: 8,
  },
  promoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    height: 44,
  },
  applyPromoBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyPromoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  appliedPromoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  appliedPromoText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 30,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  discountValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  freeDeliveryValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
  },
  checkoutBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 14,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  checkoutBody: {
    padding: 20,
  },
  errorBanner: {
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
  errorBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
    flex: 1,
  },
  orderSummaryMini: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  miniLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
  },
  miniValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E40AF',
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  fieldErrorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  phoneLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  phoneHint: {
    fontSize: 11,
    color: '#64748B',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  inputErrorBorder: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  inputValid: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethods: {
    gap: 8,
    marginTop: 6,
    marginBottom: 20,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  paymentCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  paymentCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  paymentCardTextActive: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  confirmOrderBtn: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmOrderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  successCircle: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  orderIdBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginVertical: 10,
  },
  successDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  doneBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
