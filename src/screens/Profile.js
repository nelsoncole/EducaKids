import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [foto, setFoto] = useState(user?.foto_perfil || '');

  async function handleUpdateProfile() {
    if (!nome || !email) {
      Alert.alert('Aviso', 'Nome e E-mail são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/users/profile', {
        nome,
        email,
        telefone,
        foto_perfil: foto
      });

      // Atualizar o contexto do usuário com os novos dados
      updateUser({
        nome,
        email,
        telefone,
        foto_perfil: foto
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  }

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos de acesso à galeria para mudar a foto.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('ERRO GALERIA:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = `profile_${user.id}.${fileType}`;

      formData.append('image', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: fileName,
        type: `image/${fileType}`,
      });

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      if (response.data.success) {
        const imageUrl = response.data.data.url;
        console.log('URL da foto recebida:', imageUrl);

        // Pequeno delay para garantir que o arquivo foi salvo
        setTimeout(() => {
          setFoto(imageUrl);
          Alert.alert('Sucesso', 'Foto carregada! Clique em "Salvar Alterações" para confirmar.');
        }, 500);
      }
    } catch (error) {
      console.error('ERRO UPLOAD:', error);
      Alert.alert('Erro', 'Falha ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-primary pt-14 pb-12 px-6 rounded-b-[45px] shadow-2xl shadow-primary/40">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            {navigation.canGoBack() && (
              <TouchableOpacity onPress={() => navigation.goBack()} className="mr-5 w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}
            <View>
              <Text className="text-white/60 text-xs font-black uppercase tracking-[2px]">Configurações</Text>
              <Text className="text-white text-4xl font-black tracking-tight">Meu Perfil</Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout} className="w-14 h-14 bg-white/20 rounded-[22px] items-center justify-center">
            <Ionicons name="log-out-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="items-center mt-10 mb-12">
          <TouchableOpacity onPress={pickImage} disabled={uploading} className="relative">
            <View className="w-40 h-40 bg-gray-50 rounded-[48px] items-center justify-center border-4 border-white shadow-2xl shadow-black/10 overflow-hidden">
              {uploading ? (
                <ActivityIndicator color="#2E7D32" size="large" />
              ) : foto ? (
                <Image source={{ uri: foto }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="items-center">
                  <Ionicons name="person" size={70} color="#E5E7EB" />
                </View>
              )}
            </View>
            {!uploading && (
              <View className="absolute -bottom-2 -right-2 bg-primary w-14 h-14 rounded-3xl items-center justify-center border-4 border-white shadow-lg shadow-primary/30">
                <Ionicons name="camera" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>
          <View className="items-center mt-6">
            <Text className="text-gray-900 text-3xl font-black tracking-tight">{user?.nome}</Text>
            <View className="bg-primary/5 px-4 py-1.5 rounded-full mt-2">
              <Text className="text-primary font-black uppercase text-[10px] tracking-widest">
                {user?.tipo === 'mae' ? 'Mãe' : user?.tipo === 'pai' ? 'Pai / Encarregado' : user?.tipo}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 space-y-6">
          <View className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <View className="mb-6">
              <View className="flex-row items-center mb-2.5 ml-1">
                <Ionicons name="person-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Nome Completo</Text>
              </View>
              <TextInput
                className="bg-gray-50 h-16 rounded-[24px] px-6 border border-gray-100 font-bold text-gray-800"
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome"
              />
            </View>

            <View className="mb-6">
              <View className="flex-row items-center mb-2.5 ml-1">
                <Ionicons name="mail-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">E-mail</Text>
              </View>
              <TextInput
                className="bg-gray-50 h-16 rounded-[24px] px-6 border border-gray-100 font-bold text-gray-800"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="seu@email.com"
              />
            </View>

            <View className="mb-8">
              <View className="flex-row items-center mb-2.5 ml-1">
                <Ionicons name="call-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Telefone</Text>
              </View>
              <TextInput
                className="bg-gray-50 h-16 rounded-[24px] px-6 border border-gray-100 font-bold text-gray-800"
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
                placeholder="+244 ..."
              />
            </View>

            <TouchableOpacity 
              className={`h-16 rounded-[24px] justify-center items-center shadow-xl shadow-primary/30 ${loading || uploading ? 'bg-primary/70' : 'bg-primary'}`}
              onPress={handleUpdateProfile}
              disabled={loading || uploading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white font-black text-lg mr-2">Salvar Perfil</Text>
                  <Ionicons name="save-outline" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Opções Extras */}
          <View className="bg-red-50 p-6 rounded-[32px] border border-red-100 mb-10">
            <TouchableOpacity onPress={logout} className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-red-100 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="power" size={20} color="#EF4444" />
                </View>
                <Text className="text-red-600 font-black">Sair da Conta</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
