import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { StyledComponent } from 'nativewind';

export default function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Aviso', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro de Login', result.message);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}
        className="bg-white"
      >
        
        {/* Header Section */}
        <View className="items-center mb-16">
          <View className="relative">
            <View className="w-32 h-32 bg-primary/10 rounded-[40px] items-center justify-center mb-6 border-4 border-primary/5">
              <Ionicons name="school" size={60} color="#2E7D32" />
            </View>
            <View className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-2xl items-center justify-center shadow-lg">
              <Ionicons name="heart" size={20} color="#EF4444" />
            </View>
          </View>
          <Text className="text-5xl font-black text-gray-900 tracking-tighter">EducaKids</Text>
          <View className="bg-primary/5 px-4 py-1.5 rounded-full mt-3">
            <Text className="text-primary font-black text-[10px] uppercase tracking-[3px]">Cuidando do Futuro</Text>
          </View>
        </View>
        
        {/* Form Section */}
        <View className="space-y-6">
          <View>
            <View className="flex-row items-center mb-2 ml-1">
              <Ionicons name="mail-outline" size={14} color="#6B7280" />
              <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">E-mail de Acesso</Text>
            </View>
            <TextInput
              className="bg-gray-50 h-16 rounded-[24px] px-6 border border-gray-100 text-gray-800 font-bold shadow-sm"
              placeholder="seu@email.com"
              placeholderTextColor="#BBB"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <View className="flex-row items-center mb-2 ml-1">
              <Ionicons name="lock-closed-outline" size={14} color="#6B7280" />
              <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Sua Senha</Text>
            </View>
            <TextInput
              className="bg-gray-50 h-16 rounded-[24px] px-6 border border-gray-100 text-gray-800 font-bold shadow-sm"
              placeholder="••••••••"
              placeholderTextColor="#BBB"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity className="items-end py-1">
            <Text className="text-primary font-bold">Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`h-16 rounded-[24px] justify-center items-center mt-6 shadow-xl shadow-primary/40 ${loading ? 'bg-primary/70' : 'bg-primary'}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View className="flex-row items-center">
                <Text className="text-white text-lg font-black mr-2">Entrar no App</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {/* Social Login Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="mx-4 text-gray-400">ou continue com</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          <TouchableOpacity 
            className="mt-2 py-4" 
            onPress={onSwitchToRegister}
          >
            <Text className="text-gray-600 text-center text-base">
              Não tem uma conta? <Text className="text-primary font-bold italic">Registe-se aqui</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
