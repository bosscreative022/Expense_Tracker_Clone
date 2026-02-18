// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API = axios.create({
  baseURL: 'https://nepenthean-undeclared-gunnar.ngrok-free.dev/api',
});

API.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const createSplitGroup = (data: any) => {
  return API.post('/user/split', data);
};
export const getAllSplitGroups = (userId: string) => {
  return API.get(`/user/split/${userId}`);
};
export const getSplitGroupDetails = (groupName: string) => 
  API.get(`/user/split/${encodeURIComponent(groupName)}`);

export const updateSplitGroupName = (oldName: string, newGroupName: string) => 
  API.put(`/user/split/${encodeURIComponent(oldName)}`, { newGroupName });

// E. Add Member
export const addMemberToGroup = (groupName: string, memberData: { name: string, amount: number }) => 
  API.post(`/user/split/${encodeURIComponent(groupName)}/member`, memberData);

// F. Update Member Status (Settling)
export const updateMemberStatus = (groupName: string, memberId: string, status: 'settled' | 'pending') => 
  API.patch(`/user/split/${encodeURIComponent(groupName)}/member/${memberId}`, { status });

// G. Delete Split Group
export const deleteSplitGroup = (groupName: string) => 
  API.delete(`/user/split/${encodeURIComponent(groupName)}`);

// H. Get Paid Members
export const getPaidMembers = (groupName: string) =>
  API.get(`/user/split/paid-members?groupName=${encodeURIComponent(groupName)}`);
