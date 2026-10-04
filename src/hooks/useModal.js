import { useContext } from 'react';
import { ModalContext } from '../context/ModalContextValue.js';

export function useModal() {
  return useContext(ModalContext);
}
