import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const PromoBanner = () => {
  const { setSelectedCategoryKey, t } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.leftContent}>
          <View style={styles.badge}>
            <Ionicons name="flash" size={12} color="#854D0E" />
            <Text style={styles.badgeText}>{t('promo_badge')}</Text>
          </View>
          <Text style={styles.title}>{t('promo_title')}</Text>
          <Text style={styles.subtitle}>{t('promo_sub')}</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => setSelectedCategoryKey('cat_smartphones')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{t('promo_btn')}</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.rightContent}>
          <View style={styles.circleBg}>
            <Ionicons name="gift-outline" size={54} color="rgba(255,255,255,0.85)" />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  banner: {
    backgroundColor: '#1E40AF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  leftContent: {
    flex: 1,
    paddingRight: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#854D0E',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#BFDBFE',
    marginBottom: 12,
    lineHeight: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rightContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
