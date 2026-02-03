import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadUsers() {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de usuários.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  async function handleDeleteUser(id, nome) {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja eliminar o usuário ${nome}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/users/${id}`);
              Alert.alert('Sucesso', 'Usuário eliminado com sucesso.');
              loadUsers();
            } catch (error) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao eliminar usuário.');
            }
          }
        }
      ]
    );
  }

  const renderUser = ({ item }) => (
    <View className="bg-white p-6 rounded-[32px] mb-5 border border-gray-100 shadow-sm">
      <View className="flex-row items-center mb-5">
        <View className="w-16 h-16 bg-primary/10 rounded-3xl items-center justify-center mr-4 border border-primary/5 overflow-hidden">
          {item.foto_perfil ? (
            <Image 
              source={{ uri: item.foto_perfil }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-primary font-black text-2xl">{item.nome.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-black text-xl tracking-tight" numberOfLines={1}>{item.nome}</Text>
          <Text className="text-gray-400 text-xs font-medium mb-2">{item.email}</Text>
          <View className={`px-3 py-1 rounded-full self-start ${getBadgeBg(item.tipo)}`}>
            <Text className={`text-[10px] font-black uppercase tracking-widest ${getBadgeText(item.tipo)}`}>
              {item.tipo}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          className="w-12 h-12 bg-red-50 rounded-2xl items-center justify-center border border-red-100/50"
          onPress={() => handleDeleteUser(item.id, item.nome)}
        >
          <Ionicons name="trash-outline" size={22} color="#DC2626" />
        </TouchableOpacity>
      </View>
      
      <View className="flex-row items-center justify-between border-t border-gray-50 pt-4">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center mr-2">
            <Ionicons name="call" size={14} color="#6B7280" />
          </View>
          <Text className="text-gray-500 font-bold text-xs">{item.telefone || 'N/I'}</Text>
        </View>
        <Text className="text-gray-400 text-[10px] font-medium italic">
          Entrou em {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const getBadgeBg = (tipo) => {
    switch(tipo) {
      case 'admin': return 'bg-purple-100';
      case 'gestor': return 'bg-amber-100';
      default: return 'bg-green-100';
    }
  };

  const getBadgeText = (tipo) => {
    switch(tipo) {
      case 'admin': return 'text-purple-700';
      case 'gestor': return 'text-amber-700';
      default: return 'text-green-700';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]">
      <View className="px-6 pt-10 pb-6 bg-white border-b border-gray-100">
        <Text className="text-gray-900 text-4xl font-black tracking-tighter">Utilizadores</Text>
        <View className="bg-primary/5 self-start px-4 py-1.5 rounded-full mt-2">
          <Text className="text-primary font-black text-[10px] uppercase tracking-widest">{users.length} Registados</Text>
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={item => String(item.id)}
        renderItem={renderUser}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="people-outline" size={40} color="#BBB" />
            </View>
            <Text className="text-gray-400 font-bold">Nenhum utilizador encontrado.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

