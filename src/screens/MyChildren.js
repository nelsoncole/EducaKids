import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function MyChildren() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsRegistering] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [viewingChild, setViewingChild] = useState(null);
  
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  const [alergias, setAlergias] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const loadChildren = async () => {
    try {
      const response = await api.get('/criancas');
      setChildren(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const handleRegisterChild = async () => {
    if (!nome || !dataNascimento) {
      Alert.alert('Aviso', 'Preencha o nome e a data de nascimento.');
      return;
    }

    try {
      await api.post('/criancas', { 
        nome, 
        data_nascimento: dataNascimento,
        genero,
        alergias,
        observacoes 
      });
      Alert.alert('Sucesso', 'Criança cadastrada!');
      resetForm();
      loadChildren();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar.');
    }
  };

  const handleUpdateChild = async () => {
    if (!nome || !dataNascimento) {
      Alert.alert('Aviso', 'Nome e data de nascimento são obrigatórios.');
      return;
    }

    try {
      await api.put(`/criancas/${editingChild.id}`, { 
        nome, 
        data_nascimento: dataNascimento,
        genero,
        alergias,
        observacoes 
      });
      Alert.alert('Sucesso', 'Dados atualizados!');
      setEditingChild(null);
      resetForm();
      loadChildren();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar.');
    }
  };

  const handleDeleteChild = (id) => {
    Alert.alert(
      'Eliminar Registro',
      'Deseja realmente remover esta criança do sistema?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/criancas/${id}`);
              loadChildren();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover.');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setNome('');
    setDataNascimento('');
    setGenero('');
    setAlergias('');
    setObservacoes('');
    setIsRegistering(false);
  };

  const openEdit = (child) => {
    setEditingChild(child);
    setNome(child.nome);
    setDataNascimento(child.data_nascimento);
    setGenero(child.genero);
    setAlergias(child.alergias);
    setObservacoes(child.observacoes);
  };

  const renderChild = ({ item }) => (
    <View className="bg-white p-6 rounded-[32px] mb-5 border border-gray-100 shadow-sm relative overflow-hidden">
      {/* Background Decorative Element */}
      <View className="absolute -top-6 -right-6 w-24 h-24 bg-blue-50/50 rounded-full" />
      
      <View className="flex-row items-center mb-6">
        <View className="w-16 h-16 bg-blue-50 rounded-3xl items-center justify-center mr-4 border border-blue-100/50">
          <Ionicons name="happy" size={32} color="#2563EB" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-black text-xl tracking-tight">{item.nome}</Text>
          <View className="flex-row items-center mt-1.5">
            <View className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 mr-2">
              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-tighter">
                {item.genero || 'Gênero n/i'}
              </Text>
            </View>
            <Text className="text-gray-400 text-[10px] font-bold">
              {new Date(item.data_nascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </View>
      </View>

      {item.alergias && (
        <View className="bg-red-50 px-4 py-2 rounded-2xl mb-4 flex-row items-center border border-red-100/50">
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text className="text-red-600 text-[11px] font-black ml-2 uppercase tracking-tight">Alergias: {item.alergias}</Text>
        </View>
      )}

      <View className="flex-row justify-between items-center border-t border-gray-50 pt-5 mt-2">
        <View className="flex-row space-x-2">
          <TouchableOpacity 
            onPress={() => setViewingChild(item)}
            className="bg-blue-50 px-4 py-2.5 rounded-2xl flex-row items-center"
          >
            <Ionicons name="eye" size={16} color="#2563EB" />
            <Text className="text-blue-600 font-black text-[11px] ml-2 uppercase">Ver</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => openEdit(item)}
            className="bg-amber-50 px-4 py-2.5 rounded-2xl flex-row items-center"
          >
            <Ionicons name="pencil" size={16} color="#D97706" />
            <Text className="text-amber-600 font-black text-[11px] ml-2 uppercase">Editar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => handleDeleteChild(item.id)}
          className="w-11 h-11 bg-red-50 rounded-2xl items-center justify-center border border-red-100/50"
        >
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );

  if (isAdding || editingChild) return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView className="p-6">
          <View className="flex-row items-center mb-10">
            <TouchableOpacity onPress={() => { setIsRegistering(false); setEditingChild(null); resetForm(); }} className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mr-5">
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View>
              <Text className="text-gray-400 font-black uppercase text-[10px] tracking-[2px]">Gestão Infantil</Text>
              <Text className="text-gray-900 text-3xl font-black tracking-tighter">{editingChild ? 'Editar Dados' : 'Novo Cadastro'}</Text>
            </View>
          </View>

          <View className="space-y-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm mb-12">
            <View>
              <View className="flex-row items-center mb-2.5 ml-1">
                <Ionicons name="person-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Nome Completo</Text>
              </View>
              <TextInput
                className="bg-gray-50 h-16 rounded-[24px] px-6 border border-gray-100 font-bold text-gray-800"
                placeholder="Nome da criança"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <View>
              <View className="flex-row items-center mb-2.5 ml-1">
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Data de Nascimento</Text>
              </View>
              <TextInput
                className="bg-gray-50 h-16 rounded-[24px] px-6 border border-gray-100 font-bold text-gray-800"
                placeholder="AAAA-MM-DD"
                value={dataNascimento}
                onChangeText={setDataNascimento}
              />
              <Text className="text-gray-400 text-[10px] mt-2 ml-1 italic">Formato padrão: Ano-Mês-Dia (Ex: 2020-05-15)</Text>
            </View>

            <View>
              <View className="flex-row items-center mb-3 ml-1">
                <Ionicons name="transgender-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Gênero</Text>
              </View>
              <View className="flex-row bg-gray-50 p-2 rounded-[28px] border border-gray-100">
                {['Masculino', 'Feminino'].map((g) => (
                  <TouchableOpacity 
                    key={g}
                    onPress={() => setGenero(g)}
                    className={`flex-1 h-12 rounded-[22px] items-center justify-center ${genero === g ? 'bg-white shadow-sm shadow-black/5' : ''}`}
                  >
                    <Text className={`font-black text-[10px] uppercase tracking-tighter ${genero === g ? 'text-primary' : 'text-gray-400'}`}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <View className="flex-row items-center mb-2.5 ml-1">
                <Ionicons name="medkit-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Alergias Conhecidas</Text>
              </View>
              <TextInput
                className="bg-gray-50 h-16 rounded-[24px] px-6 border border-gray-100 font-bold text-gray-800"
                placeholder="Nenhuma ou cite-as"
                value={alergias}
                onChangeText={setAlergias}
              />
            </View>

            <View>
              <View className="flex-row items-center mb-2.5 ml-1">
                <Ionicons name="document-text-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 font-black uppercase text-[10px] ml-2 tracking-widest">Observações Extras</Text>
              </View>
              <TextInput
                className="bg-gray-50 rounded-[32px] px-6 py-5 border border-gray-100 font-bold text-gray-800 min-h-[120]"
                placeholder="Detalhes médicos ou cuidados especiais..."
                multiline
                textAlignVertical="top"
                value={observacoes}
                onChangeText={setObservacoes}
              />
            </View>

            <TouchableOpacity 
              className="bg-primary h-16 rounded-[24px] justify-center items-center mt-6 shadow-xl shadow-primary/30"
              onPress={editingChild ? handleUpdateChild : handleRegisterChild}
            >
              <View className="flex-row items-center">
                <Text className="text-white font-black text-lg mr-2 uppercase tracking-tight">{editingChild ? 'Salvar Dados' : 'Cadastrar Filho'}</Text>
                <Ionicons name="checkmark-circle" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FBFBFB]">
      <View className="px-6 pt-6 pb-4 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-800 text-2xl font-black">Meus Filhos</Text>
          <Text className="text-gray-400 font-medium">Gerencie o cadastro das crianças</Text>
        </View>
        <TouchableOpacity 
          className="bg-primary w-12 h-12 rounded-full items-center justify-center shadow-lg shadow-primary/20"
          onPress={() => setIsRegistering(true)}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={children}
        keyExtractor={item => String(item.id)}
        renderItem={renderChild}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="body-outline" size={40} color="#BBB" />
            </View>
            <Text className="text-gray-400 text-center font-medium">Você ainda não cadastrou nenhuma criança.</Text>
            <TouchableOpacity 
              className="mt-6 bg-primary/10 px-6 py-3 rounded-2xl"
              onPress={() => setIsRegistering(true)}
            >
              <Text className="text-primary font-bold">Cadastrar Agora</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal de Visualização */}
      <Modal visible={!!viewingChild} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white rounded-[40px] p-8">
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="happy-outline" size={40} color="#2563EB" />
              </View>
              <Text className="text-gray-800 text-2xl font-black text-center">{viewingChild?.nome}</Text>
            </View>

            <View className="space-y-4">
              <View className="bg-gray-50 p-4 rounded-2xl">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Data de Nascimento</Text>
                <Text className="text-gray-800 font-bold">{viewingChild?.data_nascimento}</Text>
              </View>

              <View className="bg-gray-50 p-4 rounded-2xl">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Gênero</Text>
                <Text className="text-gray-800 font-bold">{viewingChild?.genero || 'Não informado'}</Text>
              </View>

              <View className="bg-gray-50 p-4 rounded-2xl">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Alergias</Text>
                <Text className={viewingChild?.alergias ? "text-red-500 font-bold" : "text-gray-800 font-bold"}>
                  {viewingChild?.alergias || 'Nenhuma alergia relatada'}
                </Text>
              </View>

              <View className="bg-gray-50 p-4 rounded-2xl">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Observações Médicas</Text>
                <Text className="text-gray-600 italic">
                  {viewingChild?.observacoes || 'Sem observações adicionais'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              className="bg-primary h-14 rounded-2xl justify-center items-center mt-8"
              onPress={() => setViewingChild(null)}
            >
              <Text className="text-white font-bold text-lg">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

