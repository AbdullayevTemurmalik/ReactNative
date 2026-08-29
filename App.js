import './src/utils/polyfills';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';

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

function MainNavigator() {
  const {
    isInitializing,
    activeTab,
    currentUser,
    isAuthModalVisible,
    setIsAuthModalVisible,
    continueAsGuest,
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

  const isAuthOpen = !currentUser || isAuthModalVisible;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <Toast />
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>
      <ProductDetailScreen />
      <BottomNavBar />

      {/* AUTH (LOGIN & REGISTER & GUEST) MODAL */}
      <AuthModal
        visible={isAuthOpen}
        onClose={() => {
          if (!currentUser) {
            continueAsGuest();
          } else {
            setIsAuthModalVisible(false);
          }
        }}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </SafeAreaProvider>
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
