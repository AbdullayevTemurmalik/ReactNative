import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { NotificationsModal } from './NotificationsModal';

export const Header = ({ title, showBack = false, onBack }) => {
  const { cartUniqueCount, favorites, unreadNotifsCount, setActiveTab, t, language } = useApp();
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  return (
    <>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          ) : (
            <View>
              <View style={styles.logoRow}>
                <Text style={styles.logoDark}>Smart</Text>
                <Text style={styles.logoBlue}>Bozor</Text>
                <View style={styles.liveTag}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>{language.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.tagline}>{t('store_tagline')}</Text>
            </View>
          )}
        </View>

        <View style={styles.rightSection}>
          {/* Bildirishnomalar qo'ng'iroqchasi */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsNotifsOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={21} color="#0F172A" />
            {unreadNotifsCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.badgeText}>{unreadNotifsCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Sevimlilar */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setActiveTab('favorites')}
            activeOpacity={0.7}
          >
            <Ionicons name="heart-outline" size={21} color="#0F172A" />
            {favorites.length > 0 && (
              <View style={styles.favBadge}>
                <Text style={styles.badgeText}>{favorites.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Savat */}
          <TouchableOpacity
            style={[styles.iconBtn, styles.cartBtn]}
            onPress={() => setActiveTab('cart')}
            activeOpacity={0.7}
          >
            <Ionicons name="bag-handle-outline" size={21} color="#FFFFFF" />
            {cartUniqueCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartUniqueCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <NotificationsModal visible={isNotifsOpen} onClose={() => setIsNotifsOpen(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leftSection: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoDark: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  logoBlue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: -0.5,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  tagline: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  backBtn: {
    padding: 6,
    marginLeft: -6,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cartBtn: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  notifBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#F59E0B',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  favBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cartBadgeText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '900',
  },
});
