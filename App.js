import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import AdminNavigator from './src/routes/AdminNavigator';
import GestorNavigator from './src/routes/GestorNavigator';
import ParentNavigator from './src/routes/ParentNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { NavigationContainer } from '@react-navigation/native';

function Root() {
  const { signed, user, logout, loading: authLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  React.useEffect(() => {
    // Garante que a splash apareça por pelo menos 6 segundos
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // Mostra a splash se o Auth ainda estiver carregando OU se ainda não passaram 6 segundos
  if (authLoading || !minTimeElapsed) {
    return <SplashScreen />;
  }

  // Se não estiver logado
  if (!signed) {
    if (isRegistering) {
      return <Register onSwitchToLogin={() => setIsRegistering(false)} />;
    }
    return <Login onSwitchToRegister={() => setIsRegistering(true)} />;
  }

  // Se for ADMIN
  if (user.tipo === 'admin') {
    return <AdminNavigator />;
  }

  // Se for GESTOR
  if (user.tipo === 'gestor') {
    return <GestorNavigator />;
  }

  // Se for PAI ou MÃE
  if (user.tipo === 'pai' || user.tipo === 'mae') {
    return <ParentNavigator />;
  }

  // Fallback para tipos desconhecidos
  return (
    <View className="flex-1 justify-center items-center bg-white px-8">
      <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
        <Ionicons name="warning-outline" size={40} color="#DC2626" />
      </View>
      <Text className="text-2xl font-bold text-red-600 text-center">Tipo de usuário inválido</Text>
      <TouchableOpacity 
        className="bg-red-50 p-5 rounded-2xl mt-8 w-full flex-row justify-center items-center" 
        onPress={logout}
      >
        <Text className="text-red-600 font-bold">Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
