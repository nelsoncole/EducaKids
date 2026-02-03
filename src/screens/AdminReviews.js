import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
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

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadReviews() {
    try {
      const response = await api.get('/admin/avaliacoes');
      setReviews(response.data.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar as avaliações.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function handleDeleteReview(id) {
    Alert.alert(
      'Apagar Avaliação',
      'Tem certeza que deseja remover este comentário permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Apagar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/avaliacoes/${id}`);
              Alert.alert('Sucesso', 'Avaliação removida.');
              loadReviews();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao remover.');
            }
          }
        }
      ]
    );
  }

  const renderReview = ({ item }) => (
    <View className="bg-white p-6 rounded-[32px] mb-5 border border-gray-100 shadow-sm relative overflow-hidden">
      {/* Indicador Lateral Decorativo */}
      <View className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.recomenda ? 'bg-green-500' : 'bg-red-500'}`} />
      
      <View className="flex-row justify-between items-start mb-5">
        <View className="flex-row items-center flex-1 pr-4">
          <View className="w-14 h-14 bg-gray-50 rounded-2xl items-center justify-center mr-4 border border-gray-100 overflow-hidden">
            {item.usuario?.foto_perfil ? (
              <Image 
                source={{ uri: item.usuario.foto_perfil }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={24} color="#D1D5DB" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-black text-lg tracking-tight" numberOfLines={1}>{item.usuario?.nome}</Text>
            <View className="flex-row items-center mt-0.5">
              <Ionicons name="business" size={12} color="#2E7D32" />
              <Text className="text-primary font-bold text-[10px] uppercase ml-1" numberOfLines={1}>{item.creche?.nome}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center"
          onPress={() => handleDeleteReview(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <View className="bg-gray-50/50 p-4 rounded-2xl mb-4 border border-gray-50">
        <View className="flex-row items-center mb-2">
          <View className="flex-row mr-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons 
                key={star}
                name="star" 
                size={14} 
                color={star <= item.estrelas ? "#F59E0B" : "#E5E7EB"} 
              />
            ))}
          </View>
          {item.verificado && (
            <View className="bg-blue-100 px-2.5 py-0.5 rounded-full flex-row items-center">
              <Ionicons name="checkmark-circle" size={10} color="#2563EB" />
              <Text className="text-blue-700 text-[8px] font-black uppercase ml-1">Pai Verificado</Text>
            </View>
          )}
        </View>
        <Text className="text-gray-600 italic leading-6 text-sm">"{item.comentario || 'Sem comentário.'}"</Text>
      </View>
      
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-gray-400 text-[10px] font-bold">
          Publicado em {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <View className={`px-3 py-1.5 rounded-xl flex-row items-center ${item.recomenda ? 'bg-green-50' : 'bg-red-50'}`}>
          <Ionicons 
            name={item.recomenda ? "thumbs-up" : "thumbs-down"} 
            size={12} 
            color={item.recomenda ? "#16A34A" : "#DC2626"} 
          />
          <Text className={`text-[9px] font-black uppercase ml-1.5 ${item.recomenda ? 'text-green-700' : 'text-red-700'}`}>
            {item.recomenda ? "Recomenda" : "Não Recomenda"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]">
      <View className="px-6 pt-10 pb-6 bg-white border-b border-gray-100">
        <Text className="text-gray-900 text-4xl font-black tracking-tighter">Avaliações</Text>
        <View className="bg-amber-50 self-start px-4 py-1.5 rounded-full mt-2">
          <Text className="text-amber-700 font-black text-[10px] uppercase tracking-widest">{reviews.length} Comentários</Text>
        </View>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={item => String(item.id)}
        renderItem={renderReview}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadReviews();}} />}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="chatbubbles-outline" size={40} color="#BBB" />
            </View>
            <Text className="text-gray-400 font-bold">Nenhuma avaliação encontrada.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

