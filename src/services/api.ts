// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API = axios.create({
  baseURL: 'https://79d1-2401-4900-cac1-c79b-b9bf-2b18-33f1-8c41.ngrok-free.app/api',
});

API.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
