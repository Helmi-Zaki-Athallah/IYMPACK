import { useContext } from 'react';
import { DataContext } from '../context/DataContextValue.js';

export function useData() {
  const context = useContext(DataContext);
  return context || null;
}
