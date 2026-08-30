import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { CartScreen } from './src/screens/CartScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';

// Components
import { BottomNavBar } from './src/components/BottomNavBar';
import { Toast } from './src/components/Toast';
import { AuthModal } from './src/components/AuthModal';
import { AIChatModal } from './src/components/AIChatModal';

function MainNavigator() {
  const insets = useSafeAreaInsets();
  const {
    isInitializing,
    activeTab,
    isAuthModalVisible,
    setIsAuthModalVisible,
    isAiChatVisible,
    setIsAiChatVisible,
  } = useApp();

  if (isInitializing) {
    return <SplashScreen />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'favorites':
        return <FavoritesScreen />;
      case 'cart':
        return <CartScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'home':
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 28 : 0) },
      ]}
      edges={['left', 'right']}
    >
      <StatusBar style="dark" />
      <Toast />
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>
      <ProductDetailScreen />
      <BottomNavBar />

      {/* AUTH (LOGIN & REGISTER & GUEST) MODAL */}
      <AuthModal
        visible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
      />

      {/* SMARTBOZOR AI YORDAMCHI (GEMINI AI) MODAL */}
      <AIChatModal
        visible={isAiChatVisible}
        onClose={() => setIsAiChatVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <MainNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
