import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageUser = await AsyncStorage.getItem('@EducaKids:user');
      const storageToken = await AsyncStorage.getItem('@EducaKids:token');

      if (storageUser && storageToken) {
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data.data;

      setUser(userData);

      await AsyncStorage.setItem('@EducaKids:token', token);
      await AsyncStorage.setItem('@EducaKids:user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('DETALHE DO ERRO:', error);
      
      let message = 'Erro ao realizar login';
      
      if (!error.response) {
        // Se não houver resposta do servidor (erro de rede no app)
        message = 'Não foi possível conectar ao servidor. Verifique o IP e a rede.';
      } else if (error.response.data && error.response.data.message) {
        // Se o backend respondeu com erro (ex: senha errada)
        message = error.response.data.message;
      }

      return {
        success: false,
        message: message,
      };
    }
  }

  async function logout() {
    await AsyncStorage.clear();
    setUser(null);
  }

  async function updateUser(userData) {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    await AsyncStorage.setItem('@EducaKids:user', JSON.stringify(updatedUser));
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
