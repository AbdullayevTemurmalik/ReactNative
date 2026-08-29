import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const Toast = () => {
  const { toast, hideToast } = useApp();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => hideToast());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [toast.visible, hideToast, opacity, translateY]);

  if (!toast.visible) return null;

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return '#0F172A';
      case 'error':
        return '#EF4444';
      default:
        return '#1E293B';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: getBgColor(), opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      <Ionicons
        name={toast.type === 'success' ? 'checkmark-circle' : 'information-circle'}
        size={18}
        color={toast.type === 'error' ? '#FFFFFF' : '#38BDF8'}
        style={styles.icon}
      />
      <Text style={styles.text} numberOfLines={2}>
        {toast.message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 48,
    alignSelf: 'center',
    maxWidth: '90%',
    zIndex: 99999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
});
