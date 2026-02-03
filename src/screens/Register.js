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
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function Register({ onSwitchToLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipo, setTipo] = useState('pai'); // 'pai', 'mae' ou 'gestor'
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nome || !email || !password || !telefone) {
      Alert.alert('Aviso', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        nome,
        email,
        password,
        telefone,
        tipo
      });

      if (response.data.success) {
        Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para entrar.', [
          { text: 'OK', onPress: onSwitchToLogin }
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
          <View className="mb-12">
            <TouchableOpacity 
              onPress={onSwitchToLogin}
              className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mb-6"
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text className="text-5xl font-black text-gray-900 tracking-tighter">Criar Conta</Text>
            <View className="bg-primary/5 self-start px-4 py-1.5 rounded-full mt-3">
              <Text className="text-primary font-black text-[10px] uppercase tracking-[3px]">Junte-se a nós</Text>
            </View>
          </View>
          
          <View className="space-y-6">
            <View>
              <View className="flex-row items-center mb-2 ml-1">
                <Ionicons name="person-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Nome Completo</Text>
              </View>
              <TextInput
                className="bg-gray-50 h-16 rounded-[24px] px-6 border border-gray-100 text-gray-800 font-bold shadow-sm"
                placeholder="Ex: Maria Silva"
                placeholderTextColor="#BBB"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <View className="flex-row items-center mb-2 ml-1">
                  <Ionicons name="mail-outline" size={14} color="#6B7280" />
                  <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">E-mail</Text>
                </View>
                <TextInput
                  className="bg-gray-50 h-16 rounded-[24px] px-6 border border-gray-100 text-gray-800 font-bold shadow-sm"
                  placeholder="seu@email"
                  placeholderTextColor="#BBB"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
              <View className="w-[48%]">
                <View className="flex-row items-center mb-2 ml-1">
                  <Ionicons name="call-outline" size={14} color="#6B7280" />
                  <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Telefone</Text>
                </View>
                <TextInput
                  className="bg-gray-50 h-16 rounded-[24px] px-6 border border-gray-100 text-gray-800 font-bold shadow-sm"
                  placeholder="9XX..."
                  placeholderTextColor="#BBB"
                  value={telefone}
                  onChangeText={setTelefone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View>
              <View className="flex-row items-center mb-2 ml-1">
                <Ionicons name="lock-closed-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Escolha uma Senha</Text>
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

            <View>
              <View className="flex-row items-center mb-3 ml-1">
                <Ionicons name="people-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Tipo de Perfil</Text>
              </View>
              <View className="flex-row justify-between bg-gray-50 p-2 rounded-[28px] border border-gray-100">
                {['pai', 'mae', 'gestor'].map((t) => (
                  <TouchableOpacity 
                    key={t}
                    onPress={() => setTipo(t)}
                    className={`flex-1 h-12 rounded-[22px] items-center justify-center ${tipo === t ? 'bg-white shadow-sm shadow-black/10' : ''}`}
                  >
                    <Text className={`font-black text-[10px] uppercase tracking-tighter ${tipo === t ? 'text-primary' : 'text-gray-400'}`}>
                      {t === 'gestor' ? 'Gestor' : t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              className={`h-16 rounded-[24px] justify-center items-center mt-4 shadow-xl shadow-primary/40 ${loading ? 'bg-primary/70' : 'bg-primary'}`}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white font-black text-lg mr-2 uppercase">Criar Minha Conta</Text>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              className="mt-6 items-center"
              onPress={onSwitchToLogin}
            >
              <Text className="text-gray-400 font-bold">
                Já tem uma conta? <Text className="text-primary">Faça login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

