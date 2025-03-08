'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/store';

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure store is only created once
  const storeRef = useRef(store);
  const persistorRef = useRef(persistor);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current}>
        {children}
      </PersistGate>
    </Provider>
  );
} 