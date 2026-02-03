import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  RefreshControl, 
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

import { useNavigation } from '@react-navigation/native';

export default function EnrollmentStatus() {
  const navigation = useNavigation();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewingEnrollment, setViewingEnrollment] = useState(null);

  const loadEnrollments = async () => {
    try {
      const response = await api.get('/matriculas');
      setEnrollments(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Eliminar Matrícula',
      'Deseja realmente eliminar esta matrícula? Esta ação não pode ser desfeita.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/matriculas/${id}`);
              Alert.alert('Sucesso', 'Matrícula cancelada com sucesso.');
              loadEnrollments();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar a matrícula.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'aceite': return { color: '#16A34A', bg: '#DCFCE7', text: 'ACEITE', icon: 'checkmark-circle' };
      case 'rejeitado': return { color: '#DC2626', bg: '#FEE2E2', text: 'REJEITADO', icon: 'close-circle' };
      default: return { color: '#D97706', bg: '#FEF3C7', text: 'PENDENTE', icon: 'time' };
    }
  };

  const renderItem = ({ item }) => {
    const status = getStatusInfo(item.status);
    return (
    <View className="bg-white p-6 rounded-[40px] mb-5 border border-gray-100 shadow-sm relative overflow-hidden">
      {/* Indicador de Status Lateral */}
      <View style={{ backgroundColor: status.color }} className="absolute left-0 top-0 bottom-0 w-2" />
      
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-1 pr-4">
          <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[2px] mb-1">Instituição</Text>
          <Text className="text-gray-900 font-black text-xl tracking-tighter" numberOfLines={1}>{item.creche?.nome}</Text>
        </View>
        <View style={{ backgroundColor: status.bg }} className="px-4 py-2 rounded-2xl flex-row items-center border border-gray-100/50">
          <Ionicons name={status.icon} size={14} color={status.color} />
          <Text style={{ color: status.color }} className="text-[10px] font-black ml-1.5 uppercase tracking-tighter">{status.text}</Text>
        </View>
      </View>

      <View className="bg-gray-50 p-5 rounded-[28px] mb-6 flex-row items-center border border-gray-100/50">
        <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4 border border-gray-100 shadow-sm">
          <Ionicons name="happy" size={24} color="#2E7D32" />
        </View>
        <View>
          <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Criança Inscrita</Text>
          <Text className="text-gray-800 font-black text-base">{item.crianca?.nome}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center border-t border-gray-50 pt-5 mt-2">
        <View className="flex-row space-x-2">
          <TouchableOpacity 
            onPress={() => setViewingEnrollment(item)}
            className="bg-blue-50 px-5 py-3 rounded-2xl flex-row items-center border border-blue-100/50"
          >
            <Ionicons name="eye" size={18} color="#2563EB" />
            <Text className="text-blue-600 font-black text-[11px] ml-2 uppercase">Detalhes</Text>
          </TouchableOpacity>

          {item.status === 'aceite' && (
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              className="bg-red-50 px-5 py-3 rounded-2xl flex-row items-center border border-red-100/50"
            >
              <Ionicons name="trash" size={18} color="#DC2626" />
              <Text className="text-red-600 font-black text-[11px] ml-2 uppercase">Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>

        {(item.status === 'pendente' || item.status === 'rejeitado') && (
          <TouchableOpacity 
            onPress={() => handleDelete(item.id)}
            className="w-12 h-12 bg-red-50 rounded-2xl items-center justify-center border border-red-100/50"
          >
            <Ionicons name="trash-outline" size={22} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>
    </View>
    );
  };

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]">
      <View className="px-6 pt-6 mb-4">
        <Text className="text-gray-800 text-2xl font-black">Minhas Matrículas</Text>
        <Text className="text-gray-400 font-medium">Acompanhe os pedidos de vaga</Text>
      </View>

      <FlatList
        data={enrollments}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadEnrollments();}} />}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="document-text-outline" size={60} color="#DDD" />
            <Text className="text-gray-400 mt-2 text-center">Você ainda não fez nenhum pedido de matrícula.</Text>
          </View>
        }
      />

      {/* Modal de Detalhes da Matrícula */}
      <Modal visible={!!viewingEnrollment} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white rounded-[40px] p-8 max-h-[80%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="items-center mb-6">
                <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="school-outline" size={40} color="#2563EB" />
                </View>
                <Text className="text-gray-800 text-2xl font-black text-center">{viewingEnrollment?.creche?.nome}</Text>
                <View style={{ backgroundColor: getStatusInfo(viewingEnrollment?.status).bg }} className="mt-2 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name={getStatusInfo(viewingEnrollment?.status).icon} size={12} color={getStatusInfo(viewingEnrollment?.status).color} />
                  <Text style={{ color: getStatusInfo(viewingEnrollment?.status).color }} className="text-[10px] font-black ml-1 uppercase">{getStatusInfo(viewingEnrollment?.status).text}</Text>
                </View>
              </View>

              <View className="space-y-4">
                <Text className="text-gray-800 font-bold text-lg mb-2">Detalhes da Solicitação</Text>
                
                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Criança</Text>
                  <Text className="text-gray-800 font-bold">{viewingEnrollment?.crianca?.nome}</Text>
                </View>

                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Data do Pedido</Text>
                  <Text className="text-gray-800 font-bold">{new Date(viewingEnrollment?.created_at).toLocaleDateString()}</Text>
                </View>

                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Endereço da Creche</Text>
                  <Text className="text-gray-800 font-bold">{viewingEnrollment?.creche?.endereco}</Text>
                </View>

                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Contato do Gestor</Text>
                  <Text className="text-gray-800 font-bold">{viewingEnrollment?.creche?.gestor?.telefone || 'Aguardando'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                className="bg-primary h-14 rounded-2xl justify-center items-center mt-8"
                onPress={() => setViewingEnrollment(null)}
              >
                <Text className="text-white font-bold text-lg">Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

