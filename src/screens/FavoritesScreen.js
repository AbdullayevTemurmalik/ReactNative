import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { formatPrice, getDiscountPercent } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';

export const FavoritesScreen = () => {
  const {
    favoriteProducts,
    moveFromFavoritesToCart,
    removeFromFavorites,
    setSelectedProduct,
    setActiveTab,
    t,
    language,
  } = useApp();

  const [itemToRemove, setItemToRemove] = useState(null);

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      removeFromFavorites(itemToRemove.id);
      setItemToRemove(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('fav_title')}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{favoriteProducts.length} {t('items_count')}</Text>
        </View>
      </View>

      {favoriteProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={60} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>{t('fav_empty_title')}</Text>
          <Text style={styles.emptySubtitle}>{t('fav_empty_sub')}</Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.85}
          >
            <Text style={styles.exploreBtnText}>{t('view_products')}</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.list}>
            {favoriteProducts.map((product) => {
              const discount = getDiscountPercent(product.oldPrice, product.price);
              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.card}
                  onPress={() => setSelectedProduct(product)}
                  activeOpacity={0.9}
                >
                  <View style={styles.imageBox}>
                    <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
                    {discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{discount}%</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.infoBox}>
                    <View style={styles.categoryRow}>
                      <Text style={styles.category}>{t(product.categoryKey || 'cat_all')}</Text>
                      <TouchableOpacity
                        onPress={() => setItemToRemove(product)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="heart" size={22} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.title} numberOfLines={2}>
                      {product.name}
                    </Text>

                    <View style={styles.priceRow}>
                      <Text style={styles.price}>{formatPrice(product.price)}</Text>
                      {product.oldPrice && (
                        <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.moveToCartBtn}
                      onPress={() => moveFromFavoritesToCart(product)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="bag-add-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.moveToCartText}>{t('move_to_cart')}</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* SEVIMLILARDAN O'CHIRISHNI TASDIQLASH MODALI */}
      <ConfirmModal
        visible={!!itemToRemove}
        title={language === 'ru' ? 'Удаление из избранного' : 'Sevimlilardan o\'chirish'}
        message={
          itemToRemove
            ? language === 'ru'
              ? `Вы действительно хотите удалить "${itemToRemove.name}" из избранного?`
              : `Rostdan ham "${itemToRemove.name}" mahsulotini sevimlilar ro'yxatidan o'chirmoqchimisiz?`
            : ''
        }
        confirmText={t('confirm_delete_btn')}
        cancelText={t('cancel_btn')}
        onConfirm={handleConfirmRemove}
        onCancel={() => setItemToRemove(null)}
        icon="heart-dislike-outline"
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  badge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
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
  exploreBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  list: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  infoBox: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
    lineHeight: 17,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  oldPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  moveToCartBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  moveToCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
