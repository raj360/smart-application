import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import usersReducer from './slices/usersSlice';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';


const createNoopStorage = () => ({
    getItem() { return Promise.resolve(null); },
    setItem(key: string, value: unknown) { return Promise.resolve(value); },
    removeItem() { return Promise.resolve(); }
  });

// Import storage dynamically to avoid SSR issues
const storage = typeof window !== 'undefined' 
  ? createWebStorage('local') 
  : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['users']
};

const persistedReducer = persistReducer(persistConfig, usersReducer);

export const store = configureStore({
  reducer: {
    users: persistedReducer,
  },
  middleware: getDefaultMiddleware => 
    getDefaultMiddleware({ 
      serializableCheck: { 
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/FLUSH', 'persist/PURGE', 'persist/REGISTER'] 
      } 
    })
  
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 