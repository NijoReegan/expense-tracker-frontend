import { useContext } from 'react';
import { AppDataContext } from './appDataContext';

export function useAppData() {
  return useContext(AppDataContext);
}