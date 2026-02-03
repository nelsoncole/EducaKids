import React from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  return (
    <View className="flex-1 bg-[#2E7D32] justify-center items-center">
      <StatusBar style="light" backgroundColor="#2E7D32" />
      
      <View className="items-center">
        {/* Ícone/Logo Branco */}
        <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-6 border-4 border-white/30">
          <Ionicons name="school" size={70} color="#FFFFFF" />
        </View>
        
        {/* Nome do App */}
        <Text className="text-4xl font-bold text-white tracking-widest mb-2">
          EducaKids
        </Text>
        <Text className="text-white/80 text-lg font-medium italic mb-12">
          Cuidando do futuro hoje
        </Text>

        {/* Indicador de Carregamento */}
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>

      {/* Rodapé opcional */}
      <View className="absolute bottom-12">
        <Text className="text-white/60 text-sm font-light uppercase tracking-tighter">
          Gestão Inteligente de Creches
        </Text>
      </View>
    </View>
  );
}

