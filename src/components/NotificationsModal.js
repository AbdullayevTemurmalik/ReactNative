import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const NotificationsModal = ({ visible, onClose }) => {
  const { notifications, markNotificationsAsRead, language } = useApp();
  const isRu = language === 'ru';

  useEffect(() => {
    if (visible) {
      markNotificationsAsRead();
    }
  }, [visible, markNotificationsAsRead]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Tashqariga yoki yon tomonlarga bosganda yopiladi */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.bellBadge}>
                    <Ionicons name="notifications" size={16} color="#2563EB" />
                  </View>
                  <Text style={styles.headerTitle}>
                    {isRu ? 'Уведомления' : 'Bildirishnomalar'}
                  </Text>
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Kontent */}
              {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="notifications-off-outline" size={42} color="#94A3B8" />
                  <Text style={styles.emptyTitle}>
                    {isRu ? 'Нет уведомлений' : 'Yangi xabar yo\'q'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {isRu
                      ? 'Здесь будут появляться напоминания и акции'
                      : 'Bu yerda tovarlar va chegirmalar haqida eslatmalar chiqadi'}
                  </Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                  <View style={styles.list}>
                    {notifications.map((notif) => (
                      <View key={notif.id} style={styles.notifItem}>
                        <View style={styles.iconBg}>
                          <Ionicons name="sparkles" size={15} color="#2563EB" />
                        </View>
                        <View style={styles.info}>
                          <Text style={styles.title}>{isRu ? notif.title_ru : notif.title}</Text>
                          <Text style={styles.body}>{isRu ? notif.body_ru : notif.body}</Text>
                          <Text style={styles.time}>
                            {new Date(notif.time).toLocaleDateString(isRu ? 'ru-RU' : 'uz-UZ', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    width: '100%',
    maxWidth: 360,
    maxHeight: '75%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  scroll: {
    paddingVertical: 12,
  },
  list: {
    gap: 10,
  },
  notifItem: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  body: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 4,
  },
  time: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
