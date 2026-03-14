// src/data-access/stores/create-persisted-store.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

export const asyncStorageAdapter = createJSONStorage(() => AsyncStorage);
