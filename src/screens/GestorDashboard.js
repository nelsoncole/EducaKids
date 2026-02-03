import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity, 
  Image,
  Modal,
  Dimensions
} from 'react-native';
const { height } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function GestorDashboard() {
  const [data, setData] = useState(null);
  const [allCreches, setAllCreches] = useState([]);
  const [activeCrecheIndex, setActiveCrecheIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const loadData = async (index = activeCrecheIndex) => {
    try {
      const response = await api.get('/users/profile');
      const creches = response.data.data.creches || [];
      setAllCreches(creches);
      
      const creche = creches[index];
      
      let stats = { pendentes: 0, aceites: 0, total: 0 };
      let recentEnrollments = [];
      
      if (creche) {
        const matRes = await api.get(`/matriculas/creche/${creche.id}`);
        const matriculas = matRes.data.data;
        stats = {
          pendentes: matriculas.filter(m => m.status === 'pendente').length,
          aceites: matriculas.filter(m => m.status === 'aceite').length,
          total: matriculas.length
        };
        recentEnrollments = matriculas.filter(m => m.status === 'pendente').slice(0, 3);
      }

      setData({ creche, stats, recentEnrollments });
    } catch (error) {
      console.error('Erro ao carregar dados do gestor:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSwitchCreche = (index) => {
    setActiveCrecheIndex(index);
    setShowSwitcher(false);
    setLoading(true);
    loadData(index);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  if (loading && !refreshing) return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadData();}} />}
      >
        {/* Header Profissional */}
        <View className="bg-primary pt-14 pb-16 px-6 rounded-b-[50px] shadow-2xl shadow-primary/40 relative">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-white/60 text-xs font-black uppercase tracking-[3px]">Área do Gestor</Text>
              <Text className="text-white text-4xl font-black tracking-tighter">Olá, {user?.nome.split(' ')[0]}</Text>
            </View>
            <TouchableOpacity onPress={logout} className="w-14 h-14 bg-white/20 rounded-[22px] items-center justify-center border border-white/10">
              <Ionicons name="log-out-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Botão de Troca de Creche (se houver mais de uma) */}
          {allCreches.length > 1 ? (
            <TouchableOpacity 
              onPress={() => setShowSwitcher(true)}
              className="bg-white/15 p-4 rounded-[28px] border border-white/10 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center mr-3">
                  <Ionicons name="business" size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white/60 text-[9px] font-black uppercase tracking-widest">Instituição Selecionada</Text>
                  <Text className="text-white font-bold text-base" numberOfLines={1}>{data?.creche?.nome}</Text>
                </View>
              </View>
              <View className="bg-white/20 px-3 py-1.5 rounded-xl flex-row items-center">
                <Text className="text-white font-black text-[10px] uppercase mr-1">Trocar</Text>
                <Ionicons name="chevron-down" size={14} color="white" />
              </View>
            </TouchableOpacity>
          ) : allCreches.length === 1 ? (
            <View className="bg-white/10 p-4 rounded-[28px] flex-row items-center">
              <Ionicons name="business" size={20} color="white" style={{ opacity: 0.6 }} />
              <Text className="text-white/80 font-bold ml-3 text-base">{allCreches[0].nome}</Text>
            </View>
          ) : null}
        </View>

        {/* Status Cards */}
        <View className="px-6 -mt-8">
          <View className="bg-white p-8 rounded-[45px] shadow-2xl shadow-black/5 border border-gray-50">
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-gray-900 text-2xl font-black tracking-tighter">Estatísticas</Text>
                <Text className="text-gray-400 text-xs font-medium">Dados da instituição ativa</Text>
              </View>
              <TouchableOpacity 
                onPress={() => navigation.navigate('MinhaCreche', { id: data?.creche?.id })}
                className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center"
              >
                <Ionicons name="settings-outline" size={22} color="#2E7D32" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between">
              <View className="items-center flex-1 border-r border-gray-100">
                <Text className="text-amber-600 text-3xl font-black">{data?.stats?.pendentes || 0}</Text>
                <Text className="text-gray-400 text-[10px] font-black uppercase mt-1">Pendentes</Text>
              </View>
              <View className="items-center flex-1 border-r border-gray-100">
                <Text className="text-green-600 text-3xl font-black">{data?.stats?.aceites || 0}</Text>
                <Text className="text-gray-400 text-[10px] font-black uppercase mt-1">Alunos</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-blue-600 text-3xl font-black">{data?.stats?.total || 0}</Text>
                <Text className="text-gray-400 text-[10px] font-black uppercase mt-1">Total</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ações Principais */}
        <View className="px-6 mt-10">
          <Text className="text-gray-900 text-2xl font-black tracking-tighter mb-6">Gestão</Text>
          
          <View className="flex-row justify-between flex-wrap">
            <TouchableOpacity 
              className="bg-white w-[48%] p-6 rounded-[40px] border border-gray-100 shadow-sm mb-4"
              onPress={() => navigation.navigate('Matriculas')}
            >
              <View className="w-14 h-14 bg-amber-50 rounded-3xl items-center justify-center mb-4">
                <Ionicons name="school" size={28} color="#D97706" />
              </View>
              <Text className="text-gray-900 font-black text-lg leading-tight">Pedidos de Matrícula</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white w-[48%] p-6 rounded-[40px] border border-gray-100 shadow-sm mb-4"
              onPress={() => navigation.navigate('MinhaCreche', { id: data?.creche?.id })}
            >
              <View className="w-14 h-14 bg-green-50 rounded-3xl items-center justify-center mb-4">
                <Ionicons name="images" size={28} color="#2E7D32" />
              </View>
              <Text className="text-gray-900 font-black text-lg leading-tight">Galeria & Fotos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white w-[48%] p-6 rounded-[40px] border border-gray-100 shadow-sm mb-4"
              onPress={() => navigation.navigate('Profile')}
            >
              <View className="w-14 h-14 bg-blue-50 rounded-3xl items-center justify-center mb-4">
                <Ionicons name="person" size={28} color="#2563EB" />
              </View>
              <Text className="text-gray-900 font-black text-lg leading-tight">Meu Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-primary w-[48%] p-6 rounded-[40px] shadow-lg shadow-primary/30 mb-4"
              onPress={() => navigation.navigate('MinhaCreche', { isNew: true })}
            >
              <View className="w-14 h-14 bg-white/20 rounded-3xl items-center justify-center mb-4">
                <Ionicons name="add" size={32} color="white" />
              </View>
              <Text className="text-white font-black text-lg leading-tight">Nova Creche</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Novos Pedidos (Resumo) */}
        {data?.recentEnrollments?.length > 0 && (
          <View className="px-6 mt-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-gray-900 text-2xl font-black tracking-tighter">Pedidos Recentes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Matriculas')}>
                <Text className="text-primary font-bold text-sm">Ver todos</Text>
              </TouchableOpacity>
            </View>
            
            {data.recentEnrollments.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                className="bg-white p-5 rounded-[32px] mb-4 flex-row items-center border border-gray-50 shadow-sm"
                onPress={() => navigation.navigate('Matriculas')}
              >
                <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mr-4 border border-gray-100 overflow-hidden">
                  {item.pai?.foto_perfil ? (
                    <Image source={{ uri: item.pai.foto_perfil }} className="w-full h-full" />
                  ) : (
                    <Ionicons name="person" size={20} color="#D1D5DB" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-black text-base">{item.crianca?.nome}</Text>
                  <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CCC" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Seletor de Creche */}
      <Modal 
        visible={showSwitcher} 
        transparent 
        animationType="slide"
        onRequestClose={() => setShowSwitcher(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <TouchableOpacity 
            activeOpacity={1} 
            className="flex-1" 
            onPress={() => setShowSwitcher(false)} 
          />
          <View className="bg-white rounded-t-[50px] p-8 max-h-[70%] shadow-2xl">
            <View className="w-12 h-1.5 bg-gray-100 rounded-full self-center mb-8" />
            
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-gray-900 text-3xl font-black tracking-tighter">Suas Creches</Text>
                <Text className="text-gray-400 font-medium">Selecione para gerenciar</Text>
              </View>
              <TouchableOpacity 
                onPress={() => { setShowSwitcher(false); navigation.navigate('MinhaCreche', { isNew: true }); }}
                className="w-14 h-14 bg-primary/10 rounded-3xl items-center justify-center"
              >
                <Ionicons name="add" size={28} color="#2E7D32" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {allCreches.map((c, idx) => (
                <TouchableOpacity 
                  key={c.id}
                  onPress={() => handleSwitchCreche(idx)}
                  className={`p-6 rounded-[35px] mb-4 flex-row items-center border ${activeCrecheIndex === idx ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 border-gray-100'}`}
                >
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${activeCrecheIndex === idx ? 'bg-primary' : 'bg-white border border-gray-100'}`}>
                    <Ionicons name="business" size={24} color={activeCrecheIndex === idx ? 'white' : '#CCC'} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-black text-xl tracking-tight ${activeCrecheIndex === idx ? 'text-primary' : 'text-gray-800'}`}>{c.nome}</Text>
                    <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>{c.endereco}</Text>
                  </View>
                  {activeCrecheIndex === idx && (
                    <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              onPress={() => setShowSwitcher(false)}
              className="bg-gray-100 h-16 rounded-[24px] items-center justify-center mt-6"
            >
              <Text className="text-gray-500 font-black uppercase text-xs tracking-widest">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
