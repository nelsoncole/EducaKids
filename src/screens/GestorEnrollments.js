import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function GestorEnrollments({ navigation }) {
  const [enrollments, setEnrollments] = useState([]);
  const [allCreches, setAllCreches] = useState([]);
  const [activeCrecheIndex, setActiveCrecheIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewingEnrollment, setViewingEnrollment] = useState(null);
  const { logout } = useAuth();

  async function loadEnrollments(index = activeCrecheIndex) {
    try {
      const profile = await api.get('/users/profile');
      const creches = profile.data.data.creches || [];
      setAllCreches(creches);
      
      const creche = creches[index];
      
      if (creche) {
        const response = await api.get(`/matriculas/creche/${creche.id}`);
        setEnrollments(response.data.data);
      } else {
        setEnrollments([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar as matrículas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleSwitchCreche = (index) => {
    setActiveCrecheIndex(index);
    setLoading(true);
    loadEnrollments(index);
  };

  useFocusEffect(
    useCallback(() => {
      loadEnrollments();
    }, [])
  );

  async function handleUpdateStatus(id, status) {
    const action = status === 'aceite' ? 'Aceitar' : 'Rejeitar';
    Alert.alert(
      'Confirmar Ação',
      `Deseja realmente ${action.toLowerCase()} esta matrícula?`,
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim', 
          onPress: async () => {
            try {
              await api.put(`/matriculas/${id}/status`, { status });
              Alert.alert('Sucesso', `Matrícula ${status === 'aceite' ? 'aceite' : 'rejeitada'}.`);
              loadEnrollments();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao atualizar status.');
            }
          }
        }
      ]
    );
  }

  async function handleDelete(id) {
    Alert.alert(
      'Eliminar Registro',
      'Deseja realmente apagar esta matrícula do sistema? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/matriculas/${id}`);
              Alert.alert('Sucesso', 'Matrícula eliminada com sucesso.');
              loadEnrollments();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao eliminar matrícula.');
            }
          }
        }
      ]
    );
  }

  const renderEnrollment = ({ item }) => (
    <View className="bg-white p-6 rounded-[32px] mb-5 border border-gray-100 shadow-sm relative overflow-hidden">
      {/* Background Decorative Element */}
      <View className={`absolute -top-6 -right-6 w-24 h-24 ${getStatusBg(item.status)}/20 rounded-full`} />
      
      <View className="flex-row items-center mb-6">
        <View className="w-16 h-16 bg-gray-50 rounded-3xl items-center justify-center mr-4 border border-gray-100 overflow-hidden shadow-sm">
          {item.pai?.foto_perfil ? (
            <Image 
              source={{ uri: item.pai.foto_perfil }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={28} color="#D1D5DB" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-black text-xl tracking-tight" numberOfLines={1}>{item.crianca?.nome}</Text>
          <View className="flex-row items-center mt-1.5">
            <View className={`px-2.5 py-1 rounded-lg mr-2 ${getStatusBg(item.status)}`}>
              <Text className={`text-[10px] font-black uppercase tracking-tighter ${getStatusText(item.status)}`}>
                {item.status}
              </Text>
            </View>
            <Text className="text-gray-400 text-[10px] font-bold">
              {item.pai?.tipo === 'mae' ? 'Mãe' : 'Pai'}: {item.pai?.nome.split(' ')[0]}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center border-t border-gray-50 pt-5 mt-2">
        <View className="flex-row space-x-2">
          {/* Visualizar */}
          <TouchableOpacity 
            className="bg-blue-50 px-4 py-2.5 rounded-2xl flex-row items-center"
            onPress={() => setViewingEnrollment(item)}
          >
            <Ionicons name="eye" size={16} color="#2563EB" />
            <Text className="text-blue-600 font-black text-[11px] ml-2 uppercase">Ver</Text>
          </TouchableOpacity>

          {/* Gerir Status */}
          {item.status === 'pendente' && (
            <View className="flex-row space-x-2">
              <TouchableOpacity 
                className="bg-green-50 px-4 py-2.5 rounded-2xl flex-row items-center border border-green-100"
                onPress={() => handleUpdateStatus(item.id, 'aceite')}
              >
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text className="text-green-700 font-black text-[11px] ml-2 uppercase">Aceitar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-red-50 px-4 py-2.5 rounded-2xl flex-row items-center border border-red-100"
                onPress={() => handleUpdateStatus(item.id, 'rejeitado')}
              >
                <Ionicons name="close-circle" size={16} color="#DC2626" />
                <Text className="text-red-700 font-black text-[11px] ml-2 uppercase">Recusar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Eliminar (Apenas se não for pendente ou se quiser limpar lista) */}
        {item.status !== 'pendente' && (
          <TouchableOpacity 
            className="w-11 h-11 bg-red-50 rounded-2xl items-center justify-center border border-red-100/50"
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getStatusBg = (s) => {
    if (s === 'aceite') return 'bg-green-100';
    if (s === 'rejeitado') return 'bg-red-100';
    return 'bg-amber-100';
  };

  const getStatusText = (s) => {
    if (s === 'aceite') return 'text-green-600';
    if (s === 'rejeitado') return 'text-red-600';
    return 'text-amber-600';
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]">
      {/* Header Estilo Gestor */}
      <View className="bg-primary pt-12 pb-10 px-6 rounded-b-[40px] shadow-xl shadow-primary/20">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white/70 text-base font-medium">Gestão de Alunos</Text>
            <Text className="text-white text-3xl font-bold">Matrículas</Text>
          </View>
          <TouchableOpacity onPress={logout} className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Seletor de Creche se houver mais de uma */}
        {allCreches.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allCreches.map((c, idx) => (
              <TouchableOpacity 
                key={c.id}
                onPress={() => handleSwitchCreche(idx)}
                className={`mr-3 px-4 py-2 rounded-full border ${activeCrecheIndex === idx ? 'bg-white' : 'bg-white/20 border-transparent'}`}
              >
                <Text className={`font-bold text-xs ${activeCrecheIndex === idx ? 'text-primary' : 'text-white'}`}>
                  {c.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={enrollments}
          keyExtractor={item => String(item.id)}
          renderItem={renderEnrollment}
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadEnrollments();}} />}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Ionicons name="school-outline" size={60} color="#DDD" />
              <Text className="text-gray-400 mt-2">Nenhum pedido recebido.</Text>
            </View>
          }
        />
      )}

      {/* Modal de Detalhes da Matrícula */}
      <Modal visible={!!viewingEnrollment} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white rounded-[40px] p-8 max-h-[80%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="items-center mb-6">
                <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="person" size={40} color="#2563EB" />
                </View>
                <Text className="text-gray-800 text-2xl font-black text-center">{viewingEnrollment?.crianca?.nome}</Text>
                <View className={`mt-2 px-3 py-1 rounded-full ${getStatusBg(viewingEnrollment?.status)}`}>
                  <Text className={`text-[10px] font-black uppercase ${getStatusText(viewingEnrollment?.status)}`}>{viewingEnrollment?.status}</Text>
                </View>
              </View>

              <View className="space-y-4">
                <Text className="text-gray-800 font-bold text-lg mb-2">Dados da Criança</Text>
                
                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Data de Nascimento</Text>
                  <Text className="text-gray-800 font-bold">{new Date(viewingEnrollment?.crianca?.data_nascimento).toLocaleDateString()}</Text>
                </View>

                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Gênero</Text>
                  <Text className="text-gray-800 font-bold">{viewingEnrollment?.crianca?.genero || 'Não informado'}</Text>
                </View>

                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Alergias</Text>
                  <Text className={viewingEnrollment?.crianca?.alergias ? "text-red-500 font-bold" : "text-gray-800 font-bold"}>
                    {viewingEnrollment?.crianca?.alergias || 'Nenhuma alergia relatada'}
                  </Text>
                </View>

                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Observações</Text>
                  <Text className="text-gray-600 italic">
                    {viewingEnrollment?.crianca?.observacoes || 'Sem observações'}
                  </Text>
                </View>

                <Text className="text-gray-800 font-bold text-lg mt-4 mb-2">Dados do Responsável</Text>

                <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-3 overflow-hidden border border-gray-100">
                    {viewingEnrollment?.pai?.foto_perfil ? (
                      <Image 
                        source={{ uri: viewingEnrollment.pai.foto_perfil }} 
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="person" size={24} color="#CCC" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">
                      {viewingEnrollment?.pai?.tipo === 'mae' ? 'Nome da Mãe' : 'Nome do Pai'}
                    </Text>
                    <Text className="text-gray-800 font-bold">{viewingEnrollment?.pai?.nome}</Text>
                  </View>
                </View>

                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Telefone de Contato</Text>
                  <Text className="text-gray-800 font-bold">{viewingEnrollment?.pai?.telefone}</Text>
                </View>

                <View className="bg-gray-50 p-4 rounded-2xl">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Email</Text>
                  <Text className="text-gray-800 font-bold">{viewingEnrollment?.pai?.email}</Text>
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
