import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function AdminCreches() {
  const [creches, setCreches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  async function loadCreches() {
    try {
      const response = await api.get('/admin/creches');
      setCreches(response.data.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as creches.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCreches();
  }, []);

  const renderCreche = ({ item }) => (
    <View className="bg-white rounded-[32px] mb-4 overflow-hidden border border-gray-100 shadow-sm">
      <View className="p-5">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 pr-2">
            <Text className="text-gray-800 text-xl font-black">{item.nome}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#2E7D32" />
              <Text className="text-gray-400 text-xs ml-1" numberOfLines={1}>{item.endereco}</Text>
            </View>
          </View>
          <View className="bg-green-50 px-3 py-1 rounded-full">
            <Text className="text-primary font-bold text-[10px]">{item.mensalidade} Kz</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-50">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="person" size={14} color="#666" />
            </View>
            <Text className="text-gray-500 text-xs font-medium">{item.gestor?.nome.split(' ')[0]}</Text>
          </View>
          
          <TouchableOpacity 
            className="flex-row items-center bg-primary px-4 py-2 rounded-2xl"
            onPress={() => navigation.navigate('CrecheDetails', { id: item.id })}
          >
            <Text className="text-white text-xs font-bold mr-1">Ver Detalhes</Text>
            <Ionicons name="arrow-forward" size={14} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]">
      <View className="px-6 pt-6 mb-4">
        <Text className="text-gray-800 text-2xl font-black">Creches</Text>
        <Text className="text-gray-400 font-medium">Gestão de instituições cadastradas</Text>
      </View>

      <FlatList
        data={creches}
        keyExtractor={item => String(item.id)}
        renderItem={renderCreche}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadCreches();}} />}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="business-outline" size={60} color="#DDD" />
            <Text className="text-gray-400 mt-2">Nenhuma creche encontrada.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
