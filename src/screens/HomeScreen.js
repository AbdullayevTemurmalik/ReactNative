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
    setIsAiChatVisible,
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
        {/* AI Yordamchi interaktiv banneri */}
        {!searchQuery && selectedCategoryKey === 'cat_all' && (
          <TouchableOpacity
            style={styles.aiBanner}
            onPress={() => setIsAiChatVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.aiBannerLeft}>
              <View style={styles.aiIconBadge}>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.aiBannerTextWrap}>
                <View style={styles.aiTitleRow}>
                  <Text style={styles.aiBannerTitle}>
                    {language === 'ru' ? 'AI-Помощник SmartBozor' : 'SmartBozor AI Yordamchi'}
                  </Text>
                  <View style={styles.geminiTag}>
                    <Text style={styles.geminiTagText}>Gemini AI</Text>
                  </View>
                </View>
                <Text style={styles.aiBannerSubtitle}>
                  {language === 'ru'
                    ? 'Помогу выбрать лучший товар и отвечу на любые вопросы'
                    : 'Eng yaxshi tovarlarni tanlashda va har qanday savolingizga yordam beraman'}
                </Text>
              </View>
            </View>
            <View style={styles.aiArrowBtn}>
              <Ionicons name="chevron-forward" size={18} color="#2563EB" />
            </View>
          </TouchableOpacity>
        )}

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

      {/* Floating AI Yordamchi FAB tugmasi */}
      <TouchableOpacity
        style={styles.floatingAiBtn}
        onPress={() => setIsAiChatVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles" size={18} color="#FFFFFF" />
        <Text style={styles.floatingAiText}>AI</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  aiBannerTextWrap: {
    flex: 1,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  geminiTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  geminiTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  aiBannerSubtitle: {
    fontSize: 11.5,
    color: '#3B82F6',
    marginTop: 2,
    fontWeight: '500',
  },
  aiArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
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
  floatingAiBtn: {
    position: 'absolute',
    bottom: 20,
    right: 18,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#60A5FA',
  },
  floatingAiText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
