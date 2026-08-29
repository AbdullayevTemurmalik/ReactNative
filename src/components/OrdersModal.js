import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/formatters';

export const OrdersModal = ({ visible, onClose }) => {
  const { orders, language, t, addToCart, setActiveTab, showToast } = useApp();
  const isRu = language === 'ru';

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(isRu ? 'ru-RU' : 'uz-UZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  const handleReorder = (orderItems) => {
    if (!orderItems || orderItems.length === 0) return;
    orderItems.forEach((item) => {
      addToCart(item, item.quantity || 1);
    });
    showToast(
      isRu
        ? '🛒 Товары добавлены в корзину!'
        : "🛒 Mahsulotlar savatga qo'shildi!",
      'success'
    );
    if (onClose) onClose();
    setActiveTab('cart');
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
                    <Ionicons name="receipt-outline" size={20} color="#2563EB" />
                  </View>
                  <Text style={styles.headerTitle}>
                    {isRu ? 'Мои заказы' : 'Mening buyurtmalarim'}
                  </Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{orders.length}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Body */}
              {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="bag-handle-outline" size={48} color="#94A3B8" />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {isRu ? 'У вас пока нет заказов' : "Hozircha buyurtmalar yo'q"}
                  </Text>
                  <Text style={styles.emptySub}>
                    {isRu
                      ? 'Оформите свой первый заказ в каталоге товаров'
                      : "Katalogdan o'zingizga yoqqan tovarlarni tanlang va birinchi buyurtmangizni bering"}
                  </Text>
                  <TouchableOpacity
                    style={styles.shopNowBtn}
                    onPress={() => {
                      if (onClose) onClose();
                      setActiveTab('home');
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.shopNowBtnText}>
                      {isRu ? 'Перейти к покупкам' : "Xarid qilishni boshlash"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scroll}
                >
                  {orders.map((order, idx) => (
                    <View key={order.id || idx} style={styles.orderCard}>
                      {/* Card Header */}
                      <View style={styles.orderHeader}>
                        <View>
                          <Text style={styles.orderId}>#{order.id}</Text>
                          <Text style={styles.orderDate}>
                            {formatDate(order.date)}
                          </Text>
                        </View>

                        <View style={styles.statusBadge}>
                          <View style={styles.statusDot} />
                          <Text style={styles.statusText}>
                            {order.status || (isRu ? 'Принят' : 'Qabul qilindi')}
                          </Text>
                        </View>
                      </View>

                      {/* Items List */}
                      <View style={styles.itemsList}>
                        {order.items?.map((item, itemIdx) => (
                          <View key={item.id || itemIdx} style={styles.itemRow}>
                            <Image
                              source={{ uri: item.image }}
                              style={styles.itemImage}
                            />
                            <View style={styles.itemInfo}>
                              <Text style={styles.itemName} numberOfLines={1}>
                                {item.name}
                              </Text>
                              <Text style={styles.itemPriceQty}>
                                {item.quantity} x {formatPrice(item.price)}
                              </Text>
                            </View>
                            <Text style={styles.itemSubtotal}>
                              {formatPrice(item.price * item.quantity)}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Manzil (agar bor bo'lsa) */}
                      {order.customer?.address ? (
                        <View style={styles.addressRow}>
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color="#64748B"
                          />
                          <Text style={styles.addressText} numberOfLines={1}>
                            {order.customer.address}
                          </Text>
                        </View>
                      ) : null}

                      {/* Card Footer */}
                      <View style={styles.orderFooter}>
                        <View>
                          <Text style={styles.totalLabel}>
                            {isRu ? 'Итоговая сумма:' : 'Umumiy summa:'}
                          </Text>
                          <Text style={styles.totalPrice}>
                            {formatPrice(order.totalAmount)}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.reorderBtn}
                          onPress={() => handleReorder(order.items)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="repeat-outline" size={16} color="#2563EB" />
                          <Text style={styles.reorderBtnText}>
                            {isRu ? 'Повторить' : 'Qayta buyurtma'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
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
    maxHeight: '90%',
    minHeight: '55%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
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
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
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
    padding: 16,
    gap: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#059669',
  },
  itemsList: {
    paddingVertical: 10,
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemPriceQty: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 10,
    gap: 6,
  },
  addressText: {
    fontSize: 11.5,
    color: '#64748B',
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2563EB',
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  reorderBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 280,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  shopNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
