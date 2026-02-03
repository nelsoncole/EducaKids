import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';

export default function MyCreche({ route, navigation }) {
  const isNew = route.params?.isNew;
  const passedId = route.params?.id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [crecheId, setCrecheId] = useState(passedId || null);
  
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [mensalidade, setMensalidade] = useState('');
  const [horario, setHorario] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotos, setFotos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);

  useEffect(() => {
    async function loadCrecheData() {
      if (isNew) {
        setInitialLoading(false);
        return;
      }

      try {
        let targetId = passedId;
        
        if (!targetId) {
          const response = await api.get('/users/profile');
          const crecheData = response.data.data.creches?.[0];
          if (crecheData) targetId = crecheData.id;
        }
        
        if (targetId) {
          const detailsRes = await api.get(`/creches/${targetId}`);
          const creche = detailsRes.data.data;

          setCrecheId(creche.id);
          setNome(creche.nome);
          setEndereco(creche.endereco);
          setMensalidade(String(creche.mensalidade));
          setHorario(creche.horario);
          setDescricao(creche.descricao);
          setFotos(creche.fotos || []);
          setAvaliacoes(creche.avaliacoes || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    }
    loadCrecheData();
  }, [isNew, passedId]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão Necessária', 'Precisamos de acesso à galeria para adicionar fotos.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.5,
      });

      if (!result.canceled) {
        handleUploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('ERRO GALERIA:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  const handleUploadPhoto = async (uri) => {
    if (!crecheId) {
      Alert.alert('Aviso', 'Salve os dados básicos da creche primeiro.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: type,
      });

      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 40000
      });

      if (uploadRes.data.success) {
        const imageUrl = uploadRes.data.data.url;
        const fotoRes = await api.post(`/creches/${crecheId}/fotos`, { imagem: imageUrl });
        
        if (fotoRes.data.success) {
          setFotos([...fotos, fotoRes.data.data]);
          Alert.alert('Sucesso', 'Foto adicionada!');
        }
      }
    } catch (error) {
      console.error('ERRO UPLOAD:', error);
      Alert.alert('Erro', 'Falha ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (fotoId) => {
    if (!fotoId) {
      // Caso a foto ainda não tenha ID (acabou de ser carregada sem refresh)
      Alert.alert('Aviso', 'Por favor, aguarde a foto terminar de processar ou atualize a página.');
      return;
    }

    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja remover esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.delete(`/creches/fotos/${fotoId}`);
              if (res.data.success) {
                setFotos(fotos.filter(f => f.id !== fotoId));
                Alert.alert('Sucesso', 'Foto removida!');
              }
            } catch (error) {
              console.error('ERRO REMOVER FOTO:', error);
              Alert.alert('Erro', 'Falha ao remover a foto.');
            }
          }
        }
      ]
    );
  };

  async function handleSave() {
    if (!nome || !endereco) {
      Alert.alert('Aviso', 'Nome e Endereço são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const data = {
        nome,
        endereco,
        mensalidade: parseFloat(mensalidade),
        horario,
        descricao
      };

      if (crecheId) {
        await api.put(`/creches/${crecheId}`, data);
        Alert.alert('Sucesso', 'Dados atualizados!');
      } else {
        const res = await api.post('/creches', data);
        setCrecheId(res.data.data.id);
        Alert.alert('Sucesso', 'Creche cadastrada! Agora já pode adicionar fotos.');
        if (isNew) {
          navigation.goBack();
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar dados.');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="bg-white px-6 pt-6 pb-4 flex-row items-center border-b border-gray-100">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={20} color="#333" />
            </TouchableOpacity>
            <Text className="text-gray-800 text-xl font-black">Minha Instituição</Text>
          </View>

          <View className="p-6 space-y-6">
            <View>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-800 text-lg font-bold">Fotos da Creche</Text>
                {uploading && <ActivityIndicator size="small" color="#2E7D32" />}
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                <TouchableOpacity 
                  onPress={pickImage}
                  disabled={uploading}
                  className="w-32 h-32 bg-gray-100 rounded-3xl items-center justify-center mr-3 border-2 border-dashed border-primary/30"
                >
                  <Ionicons name="add" size={32} color="#2E7D32" />
                  <Text className="text-[10px] text-primary font-bold mt-1 uppercase">Adicionar</Text>
                </TouchableOpacity>

                {fotos.map((item, index) => (
                  <View key={index} className="w-32 h-32 bg-gray-100 rounded-3xl mr-3 overflow-hidden shadow-sm relative">
                    <Image source={{ uri: item.imagem }} className="w-full h-full" />
                    <TouchableOpacity 
                      onPress={() => handleRemovePhoto(item.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 rounded-full items-center justify-center"
                    >
                      <Ionicons name="trash-outline" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {fotos.length === 0 && !uploading && (
                  <View className="w-32 h-32 bg-gray-50 rounded-3xl items-center justify-center mr-3 border border-gray-100">
                    <Ionicons name="images-outline" size={24} color="#CCC" />
                    <Text className="text-[9px] text-gray-400 mt-1">Nenhuma foto</Text>
                  </View>
                )}
              </ScrollView>
            </View>

            <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <View className="mb-4">
                <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">Nome da Creche</Text>
                <TextInput
                  className="bg-gray-50 h-14 rounded-2xl px-4 border border-gray-50 font-bold"
                  placeholder="Nome oficial"
                  value={nome}
                  onChangeText={setNome}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">Endereço</Text>
                <TextInput
                  className="bg-gray-50 h-14 rounded-2xl px-4 border border-gray-50"
                  placeholder="Localização completa"
                  value={endereco}
                  onChangeText={setEndereco}
                />
              </View>

              <View className="flex-row justify-between mb-4">
                <View className="w-[48%]">
                  <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">Mensalidade</Text>
                  <TextInput
                    className="bg-gray-50 h-14 rounded-2xl px-4 border border-gray-50 font-bold text-primary"
                    placeholder="Kz"
                    keyboardType="numeric"
                    value={mensalidade}
                    onChangeText={setMensalidade}
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">Horário</Text>
                  <TextInput
                    className="bg-gray-50 h-14 rounded-2xl px-4 border border-gray-50"
                    placeholder="7h - 18h"
                    value={horario}
                    onChangeText={setHorario}
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">Descrição</Text>
                <TextInput
                  className="bg-gray-50 rounded-2xl px-4 py-4 border border-gray-50 min-h-[100]"
                  placeholder="Fale sobre a sua creche..."
                  multiline
                  value={descricao}
                  onChangeText={setDescricao}
                />
              </View>

              <TouchableOpacity 
                className={`h-16 rounded-2xl justify-center items-center mt-4 shadow-lg shadow-primary/30 ${loading ? 'bg-primary/70' : 'bg-primary'}`}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">{crecheId ? 'Salvar Alterações' : 'Cadastrar Instituição'}</Text>}
              </TouchableOpacity>
            </View>

            <View className="mt-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-800 text-lg font-bold">Avaliações dos Pais</Text>
                <View className="bg-amber-100 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="star" size={12} color="#D97706" />
                  <Text className="text-amber-700 text-xs font-bold ml-1">
                    {avaliacoes.length > 0 ? (avaliacoes.reduce((acc, a) => acc + a.estrelas, 0) / avaliacoes.length).toFixed(1) : '0.0'}
                  </Text>
                </View>
              </View>

              {avaliacoes.length === 0 ? (
                <View className="bg-white p-8 rounded-3xl border border-gray-100 items-center">
                  <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-3">
                    <Ionicons name="chatbubbles-outline" size={32} color="#CCC" />
                  </View>
                  <Text className="text-gray-400 font-medium text-center">Ainda não recebeu nenhuma avaliação.</Text>
                </View>
              ) : (
                avaliacoes.map((item, index) => (
                  <View key={index} className="bg-white p-5 rounded-3xl mb-3 border border-gray-50 shadow-sm">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-800 font-bold">{item.usuario?.nome}</Text>
                      <View className="flex-row">
                        {[1,2,3,4,5].map(s => (
                          <Ionicons key={s} name={s <= item.estrelas ? "star" : "star-outline"} size={12} color="#F59E0B" />
                        ))}
                      </View>
                    </View>
                    <Text className="text-gray-500 text-sm italic">"{item.comentario}"</Text>
                    {item.verificado && (
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="checkmark-circle-outline" size={12} color="#3B82F6" />
                        <Text className="text-blue-500 text-[10px] font-bold ml-1 uppercase">Pai Verificado</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
