import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoryPills } from '../components/CategoryPills';
import { PromoBanner } from '../components/PromoBanner';
import { ProductCard } from '../components/ProductCard';

export const HomeScreen = () => {
  const {
    filteredProducts,
    selectedCategoryKey,
    searchQuery,
    setSearchQuery,
    setSelectedCategoryKey,
    showToast,
    t,
    language,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast(language === 'ru' ? '🔄 Товары обновлены' : '🔄 Mahsulotlar yangilandi', 'info');
    }, 1000);
  }, [showToast, language]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryKey('cat_all');
  };

  return (
    <View style={styles.container}>
      <Header />
      <SearchBar />
      <CategoryPills />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        {/* Banner (faqat qidiruv yo'q paytda ko'rinadi) */}
        {!searchQuery && selectedCategoryKey === 'cat_all' && <PromoBanner />}

        {/* Mahsulotlar bo'limi sarlavhasi */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t(selectedCategoryKey)}</Text>
            {searchQuery ? (
              <Text style={styles.searchResultHint}>
                "{searchQuery}" {t('search_results')}
              </Text>
            ) : null}
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {filteredProducts.length} {t('items_count')}
            </Text>
          </View>
        </View>

        {/* Mahsulotlar ro'yxati */}
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={56} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>
              {language === 'ru' ? 'Ничего не найдено' : 'Hech narsa topilmadi'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {language === 'ru'
                ? 'Попробуйте изменить поисковый запрос или сбросить фильтры'
                : 'Qidiruv so\'zini o\'zgartiring yoki filtrlarni tozalang'}
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>
                {language === 'ru' ? 'Сбросить фильтры' : 'Filtrlarni tozalash'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  searchResultHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#334155',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: 18,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
