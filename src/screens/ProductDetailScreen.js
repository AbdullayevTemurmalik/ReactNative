import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Share,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { formatPrice, getDiscountPercent } from '../utils/formatters';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ProductDetailScreen = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    toggleFavorite,
    isFavorite,
    t,
    language,
  } = useApp();
  const [quantity, setQuantity] = useState(1);

  const isRu = language === 'ru';
  const favorite = selectedProduct ? isFavorite(selectedProduct.id) : false;
  const discount = selectedProduct
    ? getDiscountPercent(selectedProduct.oldPrice, selectedProduct.price)
    : 0;
  const savings =
    selectedProduct && selectedProduct.oldPrice
      ? selectedProduct.oldPrice - selectedProduct.price
      : 0;

  // Swipe-down pan gesture
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedProduct) {
      panY.setValue(0);
      setQuantity(1);
    }
  }, [selectedProduct]);

  const handleClose = () => {
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setSelectedProduct(null);
      panY.setValue(0);
      setQuantity(1);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.6) {
          Animated.timing(panY, {
            toValue: SCREEN_HEIGHT,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            setSelectedProduct(null);
            panY.setValue(0);
            setQuantity(1);
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleShare = async () => {
    if (!selectedProduct) return;
    try {
      await Share.share({
        message: `${selectedProduct.name} - ${formatPrice(
          selectedProduct.price
        )} SmartBozor!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, quantity);
    handleClose();
  };

  if (!selectedProduct) return null;

  return (
    <Modal
      visible={!!selectedProduct}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sheet,
                {
                  transform: [{ translateY: panY }],
                },
              ]}
            >
              {/* Tutqich va tepadan tortib yopish maydoni (Gesture Area) */}
              <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
                <View style={styles.handle} />

                {/* Yuqori navigatsiya paneli */}
                <View style={styles.topNav}>
                  <TouchableOpacity
                    style={styles.navBtn}
                    onPress={handleClose}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="chevron-down" size={24} color="#0F172A" />
                  </TouchableOpacity>

                  <Text style={styles.navTitle} numberOfLines={1}>
                    {selectedProduct.name}
                  </Text>

                  <View style={styles.navActions}>
                    <TouchableOpacity
                      style={styles.navBtn}
                      onPress={handleShare}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="share-social-outline"
                        size={20}
                        color="#0F172A"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.navBtn}
                      onPress={() => toggleFavorite(selectedProduct.id)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={favorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={favorite ? '#EF4444' : '#0F172A'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Asosiy ma'lumotlar scroll */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
              >
                {/* Rasm */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: selectedProduct.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {discount > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        -{discount}% {t('discount')}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.body}>
                  {/* Kategoriya va mavjudlik */}
                  <View style={styles.categoryRatingRow}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryText}>
                        {t(selectedProduct.categoryKey || 'cat_all')}
                      </Text>
                    </View>
                    <View style={styles.stockBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#16A34A"
                      />
                      <Text style={styles.stockText}>{t('in_stock')}</Text>
                    </View>
                  </View>

                  {/* Mahsulot nomi */}
                  <Text style={styles.title}>{selectedProduct.name}</Text>

                  {/* Reyting qatori */}
                  <View style={styles.ratingSection}>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text style={styles.ratingScore}>
                      {selectedProduct.rating}
                    </Text>
                    <Text style={styles.ratingCount}>
                      ({selectedProduct.reviewsCount} {t('reviews_count')})
                    </Text>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.soldText}>
                      120+ {t('sold_count')}
                    </Text>
                  </View>

                  {/* Narx qatori */}
                  <View style={styles.priceCard}>
                    <View>
                      {selectedProduct.oldPrice && (
                        <Text style={styles.oldPrice}>
                          {formatPrice(selectedProduct.oldPrice)}
                        </Text>
                      )}
                      <Text style={styles.price}>
                        {formatPrice(selectedProduct.price)}
                      </Text>
                    </View>
                    {savings > 0 && (
                      <View style={styles.savingsBox}>
                        <Text style={styles.savingsLabel}>{t('savings')}</Text>
                        <Text style={styles.savingsValue}>
                          {formatPrice(savings)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Tavsif */}
                  <Text style={styles.sectionHeader}>
                    {t('about_product')}
                  </Text>
                  <Text style={styles.description}>
                    {isRu && selectedProduct.description_ru
                      ? selectedProduct.description_ru
                      : selectedProduct.description}
                  </Text>

                  {/* Xususiyatlari */}
                  {selectedProduct.specs && selectedProduct.specs.length > 0 && (
                    <>
                      <Text style={styles.sectionHeader}>
                        {t('specs_title')}
                      </Text>
                      <View style={styles.specsTable}>
                        {selectedProduct.specs.map((item, idx) => (
                          <View
                            key={idx}
                            style={[
                              styles.specRow,
                              idx % 2 === 1 && styles.specRowAlt,
                            ]}
                          >
                            <Text style={styles.specLabel}>
                              {isRu && item.label_ru
                                ? item.label_ru
                                : item.label}
                            </Text>
                            <Text style={styles.specValue}>{item.value}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                  {/* Kafolat va yetkazib berish xizmati */}
                  <View style={styles.guaranteeCard}>
                    <View style={styles.guaranteeItem}>
                      <Ionicons
                        name="shield-checkmark"
                        size={22}
                        color="#2563EB"
                      />
                      <View style={styles.guaranteeTextContainer}>
                        <Text style={styles.guaranteeTitle}>
                          {t('guarantee_title')}
                        </Text>
                        <Text style={styles.guaranteeSub}>
                          {t('guarantee_sub')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.guaranteeItem}>
                      <Ionicons name="cube" size={22} color="#16A34A" />
                      <View style={styles.guaranteeTextContainer}>
                        <Text style={styles.guaranteeTitle}>
                          {t('delivery_title')}
                        </Text>
                        <Text style={styles.guaranteeSub}>
                          {t('delivery_sub')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Pastki savatga qo'shish paneli */}
              <View style={styles.bottomBar}>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={18} color="#0F172A" />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setQuantity((q) => q + 1)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={18} color="#0F172A" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.addCartBtn}
                  onPress={handleAddToCart}
                  activeOpacity={0.85}
                >
                  <Ionicons name="cart" size={18} color="#FFFFFF" />
                  <Text style={styles.addCartText}>{t('add_to_cart_btn')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
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
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: SCREEN_HEIGHT * 0.9,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  dragHandleArea: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scroll: {
    paddingBottom: 24,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  body: {
    padding: 18,
  },
  categoryRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stockText: {
    color: '#15803D',
    fontSize: 11.5,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    lineHeight: 26,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  ratingScore: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 2,
  },
  ratingCount: {
    fontSize: 12.5,
    color: '#64748B',
  },
  dotSeparator: {
    color: '#CBD5E1',
    marginHorizontal: 4,
  },
  soldText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  oldPrice: {
    fontSize: 13,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563EB',
  },
  savingsBox: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'flex-end',
  },
  savingsLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  savingsValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#166534',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 10,
  },
  description: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 14,
  },
  specsTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  specRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  specLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '700',
  },
  guaranteeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  guaranteeTextContainer: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  guaranteeSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 12,
  },
  addCartBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addCartText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
