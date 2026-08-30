import React, { memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice, getDiscountPercent } from '../utils/formatters';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

export const ProductCard = memo(({ product }) => {
  const { setSelectedProduct, addToCart, toggleFavorite, isFavorite, t, language } = useApp();
  const favorite = isFavorite(product.id);
  const discount = getDiscountPercent(product.oldPrice, product.price);

  const handleHeartPress = () => {
    toggleFavorite(product.id);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedProduct(product)}
        activeOpacity={0.88}
      >
        {/* Rasm va qatlamlar */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Chegirma burchagi */}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}

          {/* Sevimlilar (Like) tugmasi */}
          <TouchableOpacity
            style={styles.favButton}
            onPress={handleHeartPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={18}
              color={favorite ? '#EF4444' : '#64748B'}
            />
          </TouchableOpacity>
        </View>

        {/* Ma'lumot qismi */}
        <View style={styles.infoContainer}>
          <Text style={styles.category}>{t(product.categoryKey || 'cat_all')}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {product.name}
          </Text>

          {/* Reyting */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.reviews}>({product.reviewsCount})</Text>
          </View>

          {/* Narxlar */}
          <View style={styles.priceSection}>
            {product.oldPrice && (
              <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>
            )}
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>

          {/* Savatga qo'shish tugmasi */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => addToCart(product)}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={15} color="#FFFFFF" />
            <Text style={styles.cartButtonText}>{t('add_to_cart')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 145,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoContainer: {
    padding: 12,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    height: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  rating: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 3,
  },
  reviews: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 2,
  },
  priceSection: {
    marginBottom: 10,
  },
  oldPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginBottom: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  cartButton: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
