import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48; // width minus horizontal padding
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const CrecheCard = ({ item, navigation }) => {
  const [activePhoto, setActivePhoto] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (item.fotos?.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (activePhoto + 1) % item.fotos.length;
        setActivePhoto(nextIndex);
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activePhoto, item.fotos]);

  return (
    <TouchableOpacity 
      className="bg-white rounded-[32px] mb-5 overflow-hidden border border-gray-100 shadow-sm"
      onPress={() => navigation.navigate('CrecheDetails', { id: item.id })}
    >
      <View className="h-56 bg-gray-200 relative">
        {!item.fotos || item.fotos.length === 0 ? (
          <View className="flex-1 items-center justify-center bg-gray-50">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="business" size={32} color="#DDD" />
            </View>
            <Text className="text-gray-300 font-bold mt-2 text-[10px] uppercase tracking-widest">Sem fotos</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={item.fotos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(foto) => String(foto.id)}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
                setActivePhoto(newIndex);
              }}
              renderItem={({ item: foto }) => (
                <Image 
                  source={{ uri: foto.imagem }} 
                  style={{ width: CARD_WIDTH, height: 224 }}
                  resizeMode="cover"
                />
              )}
            />
            {/* Gradiente Overlay para melhor leitura */}
            <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
            
            {/* Indicadores do Carrossel */}
            {item.fotos.length > 1 && (
              <View className="absolute bottom-4 w-full flex-row justify-center space-x-1.5">
                {item.fotos.map((_, i) => (
                  <View 
                    key={i}
                    className={`h-1.5 rounded-full ${i === activePhoto ? 'w-6 bg-white' : 'w-1.5 bg-white/60'}`}
                  />
                ))}
              </View>
            )}
          </>
        )}
        
        <View className="absolute top-4 right-4 bg-white/95 px-3 py-1.5 rounded-2xl flex-row items-center shadow-sm border border-gray-100">
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text className="text-gray-800 font-black text-xs ml-1">4.8</Text>
        </View>
      </View>

      <View className="p-6">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 pr-3">
            <Text className="text-gray-800 text-2xl font-black tracking-tight" numberOfLines={1}>{item.nome}</Text>
            <View className="flex-row items-center mt-1.5">
              <View className="w-6 h-6 bg-primary/10 rounded-full items-center justify-center mr-1.5">
                <Ionicons name="location" size={12} color="#2E7D32" />
              </View>
              <Text className="text-gray-400 text-xs font-medium" numberOfLines={1}>{item.endereco}</Text>
            </View>
          </View>
          <View className="bg-primary px-4 py-2 rounded-2xl shadow-sm shadow-primary/20">
            <Text className="text-white font-black text-sm">{item.mensalidade} Kz</Text>
          </View>
        </View>
        
        <View className="h-[1px] bg-gray-50 w-full mb-4" />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <View className="bg-blue-50 px-3 py-1.5 rounded-xl flex-row items-center">
              <Ionicons name="time-outline" size={12} color="#2563EB" />
              <Text className="text-blue-600 text-[10px] font-bold uppercase ml-1.5 tracking-tighter">{item.horario}</Text>
            </View>
            <View className="bg-amber-50 px-3 py-1.5 rounded-xl flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={12} color="#D97706" />
              <Text className="text-amber-600 text-[10px] font-bold uppercase ml-1.5 tracking-tighter">Verificada</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Text className="text-primary font-black text-xs mr-1">Explorar</Text>
            <Ionicons name="arrow-forward" size={14} color="#2E7D32" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ParentDashboard() {
  const { logout } = useAuth();
  const [creches, setCreches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todas');
  const navigation = useNavigation();

  const loadCreches = async (searchTerm = '', sort = '') => {
    try {
      let url = `/creches?search=${searchTerm}`;
      if (sort) {
        url += `&sort=${sort}`;
      }
      const response = await api.get(url);
      setCreches(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFilterPress = (filterName) => {
    setActiveFilter(filterName);

    let sortParam = '';
    switch (filterName) {
      case 'Mais baratas':
        sortParam = 'price_asc';
        break;
      case 'Mais caro':
        sortParam = 'price_desc';
        break;
      case 'Novas':
        sortParam = 'newest';
        break;
      case 'Todas':
      default:
        sortParam = '';
        break;
    }

    loadCreches(search, sortParam);
  };

  useEffect(() => {
    loadCreches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    let sortParam = '';
    switch (activeFilter) {
      case 'Mais baratas':
        sortParam = 'price_asc';
        break;
      case 'Mais caro':
        sortParam = 'price_desc';
        break;
      case 'Novas':
        sortParam = 'newest';
        break;
      default:
        sortParam = '';
        break;
    }
    loadCreches(search, sortParam);
  };

  const renderCreche = ({ item }) => (
    <CrecheCard item={item} navigation={navigation} />
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]">
      <View className="px-6 pt-10 pb-4 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Descubra</Text>
          <Text className="text-gray-800 text-3xl font-black">Melhores Creches</Text>
        </View>
        <TouchableOpacity onPress={() => logout()} className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center">
          <Ionicons name="log-out-outline" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <View className="px-6 pb-4">
        {/* Barra de Busca e Filtros */}
        <View className="flex-row items-center space-x-3 mt-4">
          <View className="flex-1 flex-row items-center bg-white border border-gray-100 rounded-[24px] px-5 h-16 shadow-sm">
            <Ionicons name="search-outline" size={22} color="#999" />
            <TextInput
              className="flex-1 ml-3 text-gray-700 font-bold"
              placeholder="Buscar por nome ou bairro..."
              placeholderTextColor="#BBB"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                let sortParam = '';
                switch (activeFilter) {
                  case 'Mais baratas':
                    sortParam = 'price_asc';
                    break;
                  case 'Mais caro':
                    sortParam = 'price_desc';
                    break;
                  case 'Novas':
                    sortParam = 'newest';
                    break;
                  default:
                    sortParam = '';
                    break;
                }
                loadCreches(text, sortParam);
              }}
            />
          </View>
          <TouchableOpacity className="w-16 h-16 bg-primary rounded-[24px] items-center justify-center shadow-lg shadow-primary/30">
            <Ionicons name="options-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Categorias Rápidas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-6 -mx-6 px-6 pb-2">
          {['Todas', 'Mais baratas', 'Mais caro', 'Novas'].map((cat, i) => (
            <TouchableOpacity
              key={i}
              className={`mr-3 px-6 py-3 rounded-2xl border ${activeFilter === cat ? 'bg-primary border-primary' : 'bg-white border-gray-100 shadow-sm'}`}
              onPress={() => handleFilterPress(cat)}
            >
              <View className="flex-row items-center">
                {cat === 'Todas' && <Ionicons name="star" size={12} color={activeFilter === cat ? "white" : "#666"} style={{ marginRight: 6 }} />}
                {cat === 'Mais baratas' && <Ionicons name="cash" size={12} color={activeFilter === cat ? "white" : "#666"} style={{ marginRight: 6 }} />}
                {cat === 'Mais caro' && <Ionicons name="diamond" size={12} color={activeFilter === cat ? "white" : "#666"} style={{ marginRight: 6 }} />}
                {cat === 'Novas' && <Ionicons name="school" size={12} color={activeFilter === cat ? "white" : "#666"} style={{ marginRight: 6 }} />}
                <Text className={`font-black text-xs ${activeFilter === cat ? 'text-white' : 'text-gray-500'}`}>{cat}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={creches}
          keyExtractor={item => String(item.id)}
          renderItem={renderCreche}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="search" size={40} color="#BBB" />
              </View>
              <Text className="text-gray-400 mt-2 font-medium">Nenhuma creche encontrada.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

