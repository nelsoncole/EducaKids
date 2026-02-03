import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  Modal,
  TextInput,
  FlatList,
  Image,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function CrecheDetails({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [creche, setCreche] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modais
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Dados de Matrícula
  const [myChildren, setMyChildren] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  
  // Dados de Avaliação
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrossel
  const [activePhoto, setActivePhoto] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (creche?.fotos?.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (activePhoto + 1) % creche.fotos.length;
        setActivePhoto(nextIndex);
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activePhoto, creche?.fotos]);

  async function loadData() {
    try {
      const response = await api.get(`/creches/${id}`);
      setCreche(response.data.data);

      if (user.tipo === 'pai') {
        const childRes = await api.get('/criancas');
        setMyChildren(childRes.data.data);

        // Verificar se o pai tem matrícula aceite nesta creche
        const enrollRes = await api.get('/matriculas');
        const hasVerifiedEnrollment = enrollRes.data.data.some(
          m => String(m.creche_id) === String(id) && m.status === 'aceite'
        );
        setIsVerified(hasVerifiedEnrollment);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleEnroll(childId) {
    try {
      setIsSubmitting(true);
      await api.post('/matriculas', {
        creche_id: id,
        crianca_id: childId
      });
      Alert.alert('Sucesso', 'Pedido de matrícula enviado com sucesso! Aguarde a aprovação do gestor.');
      setShowEnrollModal(false);
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao solicitar matrícula.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitReview() {
    try {
      setIsSubmitting(true);
      await api.post('/avaliacoes', {
        creche_id: id,
        estrelas: rating,
        comentario: comment,
        recomenda: true
      });
      Alert.alert('Sucesso', 'Obrigado pela sua avaliação!');
      setShowReviewModal(false);
      setComment('');
      loadData(); // Recarregar para ver a nova avaliação
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao enviar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Imagem Header / Carrossel */}
        <View className="h-80 bg-gray-200 relative">
          <TouchableOpacity 
            className="absolute top-12 left-6 z-20 w-12 h-12 bg-white/90 rounded-2xl items-center justify-center shadow-sm"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          {!creche?.fotos || creche.fotos.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="business" size={100} color="#BBB" />
              <Text className="text-gray-400 font-bold mt-2">Sem fotos disponíveis</Text>
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={creche.fotos}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id)}
                onMomentumScrollEnd={(e) => {
                  const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                  setActivePhoto(newIndex);
                }}
                renderItem={({ item }) => (
                  <Image 
                    source={{ uri: item.imagem }} 
                    style={{ width, height: 320 }}
                    resizeMode="cover"
                  />
                )}
              />
              {/* Indicadores */}
              <View className="absolute bottom-16 w-full flex-row justify-center space-x-2 z-20">
                {creche.fotos.map((_, i) => (
                  <View 
                    key={i}
                    className={`h-2 rounded-full ${i === activePhoto ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* Content */}
        <View className="px-6 py-8 -mt-12 bg-white rounded-t-[45px] shadow-2xl z-30">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 pr-4">
              <Text className="text-gray-800 text-4xl font-black leading-tight tracking-tight">{creche?.nome}</Text>
              <View className="flex-row items-center mt-3">
                <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-2">
                  <Ionicons name="location" size={16} color="#2E7D32" />
                </View>
                <Text className="text-gray-500 font-bold text-sm">{creche?.endereco}</Text>
              </View>
            </View>
            <View className="bg-primary/5 px-5 py-4 rounded-[32px] border border-primary/10 items-center min-w-[100]">
              <Text className="text-primary font-black text-2xl">{creche?.mensalidade}</Text>
              <Text className="text-primary/60 text-[10px] uppercase font-black tracking-widest">Kz / Mês</Text>
            </View>
          </View>

          {/* Status Bar */}
          <View className="flex-row items-center mt-6 mb-8 bg-gray-50/50 p-4 rounded-[32px] border border-gray-100">
            <View className="flex-row items-center flex-1">
              <View className="bg-amber-100 w-10 h-10 rounded-2xl items-center justify-center">
                <Ionicons name="star" size={18} color="#D97706" />
              </View>
              <View className="ml-3">
                <Text className="text-gray-800 font-black text-base">4.8</Text>
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">Média Global</Text>
              </View>
            </View>
            <View className="w-[1px] h-8 bg-gray-200 mx-4" />
            <View className="flex-row items-center flex-1">
              <View className="bg-blue-100 w-10 h-10 rounded-2xl items-center justify-center">
                <Ionicons name="chatbubbles" size={18} color="#2563EB" />
              </View>
              <View className="ml-3">
                <Text className="text-gray-800 font-black text-base">{creche?.avaliacoes?.length || 0}</Text>
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">Avaliações</Text>
              </View>
            </View>
          </View>

          {/* Info Cards Row */}
          <View className="flex-row justify-between mb-10 space-x-4">
            <View className="bg-white p-5 rounded-[32px] flex-1 border border-gray-100 items-center shadow-sm">
              <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mb-3">
                <Ionicons name="time" size={24} color="#2E7D32" />
              </View>
              <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Horário</Text>
              <Text className="text-gray-800 font-black text-sm">{creche?.horario}</Text>
            </View>
            <View className="bg-white p-5 rounded-[32px] flex-1 border border-gray-100 items-center shadow-sm">
              <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-3">
                <Ionicons name="person" size={24} color="#2563EB" />
              </View>
              <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Gestor</Text>
              <Text className="text-gray-800 font-black text-sm">{creche?.gestor?.nome.split(' ')[0]}</Text>
            </View>
          </View>

          <View className="mb-10">
            <Text className="text-gray-800 text-xl font-black mb-3">Sobre a Instituição</Text>
            <Text className="text-gray-500 leading-7 text-base font-medium">
              {creche?.descricao || 'Esta creche ainda não disponibilizou uma descrição detalhada.'}
            </Text>
          </View>

          {/* Avaliações Section */}
          <View className="mb-6 flex-row justify-between items-center">
            <Text className="text-gray-800 text-xl font-black">Avaliações</Text>
            {user.tipo === 'pai' && isVerified && (
              <TouchableOpacity onPress={() => setShowReviewModal(true)} className="flex-row items-center">
                <Text className="text-primary font-bold text-sm">Avaliar</Text>
                <Ionicons name="arrow-forward" size={16} color="#2E7D32" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>

          {creche?.avaliacoes?.length === 0 ? (
            <View className="bg-gray-50 p-8 rounded-[32px] items-center border border-dashed border-gray-200">
              <Text className="text-gray-400 font-medium">Seja o primeiro a avaliar!</Text>
            </View>
          ) : (
            creche?.avaliacoes?.map((rev, index) => (
              <View key={index} className="bg-gray-50 p-6 rounded-[32px] mb-4 border border-gray-100">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3 overflow-hidden">
                      {rev.usuario?.foto_perfil ? (
                        <Image 
                          source={{ uri: rev.usuario.foto_perfil }} 
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-primary font-bold text-sm">{rev.usuario?.nome.charAt(0).toUpperCase()}</Text>
                      )}
                    </View>
                    <View>
                      <Text className="text-gray-800 font-bold">{rev.usuario?.nome}</Text>
                      {rev.verificado && (
                        <View className="flex-row items-center mt-0.5">
                          <Ionicons name="checkmark-circle" size={10} color="#3B82F6" />
                          <Text className="text-blue-600 text-[8px] font-black ml-1 uppercase">Pai Verificado</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View className="flex-row">
                    {[1,2,3,4,5].map(s => (
                      <Ionicons key={s} name={s <= rev.estrelas ? "star" : "star-outline"} size={12} color="#F59E0B" />
                    ))}
                  </View>
                </View>
                <Text className="text-gray-500 italic leading-6">"{rev.comentario}"</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Botões Fixos Inferiores (Apenas para Pais) */}
      {user.tipo === 'pai' && (
        <View className="absolute bottom-20 left-0 right-0 p-6 flex-row space-x-3">
          <TouchableOpacity 
            className="flex-1 bg-primary h-16 rounded-[24px] flex-row items-center justify-center shadow-xl shadow-primary/40"
            onPress={() => setShowEnrollModal(true)}
          >
            <Ionicons name="school" size={24} color="white" />
            <Text className="text-white font-black text-lg ml-2">Matricular</Text>
          </TouchableOpacity>

          {isVerified && (
            <TouchableOpacity 
              className="w-20 bg-amber-500 h-16 rounded-[24px] items-center justify-center shadow-xl shadow-amber-500/40"
              onPress={() => setShowReviewModal(true)}
            >
              <Ionicons name="star" size={28} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modal de Matrícula */}
      <Modal visible={showEnrollModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[45px] p-8 h-[60%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-gray-800 text-2xl font-black">Escolha o Filho</Text>
              <TouchableOpacity onPress={() => setShowEnrollModal(false)}>
                <Ionicons name="close-circle" size={32} color="#DDD" />
              </TouchableOpacity>
            </View>
            
            {myChildren.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-400 text-center mb-6">Você precisa cadastrar um filho primeiro.</Text>
                <TouchableOpacity 
                  className="bg-primary/10 px-6 py-3 rounded-2xl"
                  onPress={() => { setShowEnrollModal(false); navigation.navigate('Children'); }}
                >
                  <Text className="text-primary font-bold">Ir para Meus Filhos</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={myChildren}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    className="bg-gray-50 p-5 rounded-[24px] mb-3 flex-row items-center border border-gray-100"
                    onPress={() => handleEnroll(item.id)}
                  >
                    <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-4 border border-gray-100">
                      <Ionicons name="happy-outline" size={24} color="#2563EB" />
                    </View>
                    <Text className="flex-1 text-gray-800 font-bold text-lg">{item.nome}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Avaliação */}
      <Modal visible={showReviewModal} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white rounded-[40px] p-8">
            <Text className="text-gray-800 text-2xl font-black text-center mb-2">Avaliar Creche</Text>
            <Text className="text-gray-400 text-center mb-6 font-medium">Como foi sua experiência?</Text>
            
            <View className="flex-row justify-center space-x-2 mb-8">
              {[1,2,3,4,5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Ionicons name={s <= rating ? "star" : "star-outline"} size={40} color="#F59E0B" />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              className="bg-gray-50 rounded-3xl p-5 border border-gray-100 text-gray-700 min-h-[120] mb-6"
              placeholder="Escreva um breve comentário..."
              multiline
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="flex-1 bg-gray-100 h-14 rounded-2xl justify-center items-center"
                onPress={() => setShowReviewModal(false)}
              >
                <Text className="text-gray-500 font-bold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-2 bg-primary h-14 rounded-2xl justify-center items-center px-8 shadow-lg shadow-primary/30"
                onPress={handleSubmitReview}
                disabled={isSubmitting}
              >
                <Text className="text-white font-bold">Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
