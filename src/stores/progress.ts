import AsyncStorage from '@react-native-async-storage/async-storage';

import { createProgressStore } from '@/domain/progress-store';

export const progressStore = createProgressStore(AsyncStorage);
