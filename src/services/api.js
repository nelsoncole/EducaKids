import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Corrigido: Usando o novo IP detectado pelo ipconfig
const API_URL = 'http://192.168.237.81:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@EducaKids:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
