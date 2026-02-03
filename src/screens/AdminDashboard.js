import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  async function loadStats() {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const StatCard = ({ title, value, color, icon, detail }) => (
    <View className="bg-white w-[47%] p-6 rounded-[45px] mb-5 border border-gray-100 shadow-sm relative overflow-hidden">
      <View className={`absolute -top-4 -right-4 w-16 h-16 ${color.replace('text-', 'bg-')}/5 rounded-full`} />
      <View className={`w-14 h-14 rounded-[22px] items-center justify-center mb-4 ${color.replace('text-', 'bg-')}/10 shadow-sm`}>
        <Ionicons name={icon} size={28} color={color.includes('blue') ? '#2563EB' : color.includes('rose') ? '#E11D48' : color.includes('purple') ? '#9333EA' : '#D97706'} />
      </View>
      <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[2px]">{title}</Text>
      <Text className={`text-4xl font-black mt-1 tracking-tighter ${color}`}>{value}</Text>
      {detail && (
        <View className="bg-gray-50 self-start px-3 py-1 rounded-xl mt-4 border border-gray-100">
          <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest leading-3">{detail}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="bg-primary pt-14 pb-16 px-6 rounded-b-[50px] shadow-2xl shadow-primary/40">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white/60 text-xs font-black uppercase tracking-[3px]">Gestão Global</Text>
              <Text className="text-white text-4xl font-black tracking-tighter text-shadow-sm">Painel Admin</Text>
            </View>
            <TouchableOpacity onPress={logout} className="w-14 h-14 bg-white/20 rounded-[22px] items-center justify-center border border-white/10">
              <Ionicons name="log-out-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 -mt-10">
          <View className="flex-row flex-wrap justify-between">
            <StatCard 
              title="Usuários" 
              value={stats?.usuarios?.total || 0} 
              color="text-blue-600" 
              icon="people"
              detail={`${stats?.usuarios?.pais || 0} pais • ${stats?.usuarios?.gestores || 0} gestores`}
            />
            <StatCard 
              title="Creches" 
              value={stats?.creches || 0} 
              color="text-rose-600" 
              icon="business"
              detail="Instituições verificadas"
            />
            <StatCard 
              title="Matrículas" 
              value={stats?.matriculas?.total || 0} 
              color="text-purple-600" 
              icon="school"
              detail={`${stats?.matriculas?.pendentes || 0} aguardando análise`}
            />
            <StatCard 
              title="Avaliações" 
              value={stats?.avaliacoes?.total || 0} 
              color="text-amber-600" 
              icon="star"
              detail={`${stats?.avaliacoes?.verificadas || 0} relatos de pais`}
            />
          </View>
        </View>

        <View className="px-6 mt-10 mb-10">
          <Text className="text-gray-900 text-2xl font-black tracking-tighter mb-6">Controle do Sistema</Text>
          
          <TouchableOpacity 
            className="bg-white p-8 rounded-[45px] flex-row items-center mb-5 border border-gray-100 shadow-2xl shadow-black/5 relative overflow-hidden"
            onPress={() => navigation.navigate('Users')}
          >
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50/50 rounded-full" />
            
            <View className="w-18 h-18 bg-blue-600 rounded-[30px] items-center justify-center mr-5 shadow-lg shadow-blue-200">
              <Ionicons name="people" size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-black text-2xl tracking-tighter">Utilizadores</Text>
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-[2px] mt-1">Gerir Contas</Text>
            </View>
            <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
              <Ionicons name="chevron-forward" size={24} color="#2563EB" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-white p-8 rounded-[45px] flex-row items-center border border-gray-100 shadow-2xl shadow-black/5 relative overflow-hidden"
            onPress={() => navigation.navigate('ModerarReviews')}
          >
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-amber-50/50 rounded-full" />

            <View className="w-18 h-18 bg-amber-500 rounded-[30px] items-center justify-center mr-5 shadow-lg shadow-amber-200">
              <Ionicons name="chatbubbles" size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-black text-2xl tracking-tighter">Avaliações</Text>
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-[2px] mt-1">Moderar Relatos</Text>
            </View>
            <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
              <Ionicons name="chevron-forward" size={24} color="#D97706" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
