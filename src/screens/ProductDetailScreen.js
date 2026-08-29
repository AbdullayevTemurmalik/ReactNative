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
  Dimensions,
  Animated,
  PanResponder,
  Platform,
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
  const [activeProduct, setActiveProduct] = useState(null);

  const isRu = language === 'ru';
  const displayProduct = selectedProduct || activeProduct;

  const favorite = displayProduct ? isFavorite(displayProduct.id) : false;
  const discount = displayProduct
    ? getDiscountPercent(displayProduct.oldPrice, displayProduct.price)
    : 0;
  const savings =
    displayProduct && displayProduct.oldPrice
      ? displayProduct.oldPrice - displayProduct.price
      : 0;

  // Swipe-down pan gesture & slide-in animation
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (selectedProduct) {
      setActiveProduct(selectedProduct);
      setQuantity(1);
      isClosingRef.current = false;
      panY.setValue(SCREEN_HEIGHT);
      Animated.spring(panY, {
        toValue: 0,
        bounciness: 0,
        speed: 20,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedProduct]);

  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setSelectedProduct(null);
      setActiveProduct(null);
      panY.setValue(SCREEN_HEIGHT);
      setQuantity(1);
      isClosingRef.current = false;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dy > 10 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 70 || gestureState.vy > 0.4) {
          handleClose();
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
    if (!displayProduct) return;
    try {
      await Share.share({
        message: `${displayProduct.name} - ${formatPrice(
          displayProduct.price
        )} SmartBozor!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = () => {
    if (!displayProduct) return;
    addToCart(displayProduct, quantity);
    handleClose();
  };

  if (!selectedProduct && !activeProduct) return null;

  return (
    <Modal
      visible={!!selectedProduct || !!activeProduct}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Orqa qorong'u fon (bosilganda yopiladi, ScrollView ga xalaqit bermaydi) */}
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Modal kartochkasi */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: panY }],
            },
          ]}
        >
          {/* Tutqich va yuqori navigatsiya paneli (Faqat tepasi gesture ushlaydi) */}
          <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
            <View style={styles.handle} />

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
                {displayProduct.name}
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
                  onPress={() => toggleFavorite(displayProduct.id)}
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

          {/* 100% toza, hech qachon qotmaydigan Native ScrollView */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
            bounces={Platform.OS === 'ios'}
          >
            {/* Mahsulot Rasmi */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: displayProduct.image }}
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

            {/* Mahsulot ma'lumotlari */}
            <View style={styles.body}>
              {/* Kategoriya va mavjudlik */}
              <View style={styles.categoryRatingRow}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>
                    {t(displayProduct.categoryKey || 'cat_all')}
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
              <Text style={styles.title}>{displayProduct.name}</Text>

              {/* Reyting qatori */}
              <View style={styles.ratingSection}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingScore}>
                  {displayProduct.rating}
                </Text>
                <Text style={styles.ratingCount}>
                  ({displayProduct.reviewsCount} {t('reviews_count')})
                </Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.soldText}>
                  120+ {t('sold_count')}
                </Text>
              </View>

              {/* Narx qatori */}
              <View style={styles.priceCard}>
                <View>
                  {displayProduct.oldPrice && (
                    <Text style={styles.oldPrice}>
                      {formatPrice(displayProduct.oldPrice)}
                    </Text>
                  )}
                  <Text style={styles.price}>
                    {formatPrice(displayProduct.price)}
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
                {isRu && displayProduct.description_ru
                  ? displayProduct.description_ru
                  : displayProduct.description}
              </Text>

              {/* Xususiyatlari */}
              {displayProduct.specs && displayProduct.specs.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>
                    {t('specs_title')}
                  </Text>
                  <View style={styles.specsTable}>
                    {displayProduct.specs.map((item, idx) => (
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
              <Text style={styles.addCartText}>
                {t('add_to_cart_btn')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    paddingBottom: 30,
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
    bottom: 12,
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
