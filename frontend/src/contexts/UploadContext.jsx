import React, { createContext, useContext } from 'react';
import { useUploadManager } from '../Hooks/useUploadManager';

export const UploadContext = createContext(null);

export function UploadProvider({ children }) {
  const uploadManager = useUploadManager();
  
  return (
    <UploadContext.Provider value={uploadManager}>
      {children}
    </UploadContext.Provider>
  );
}