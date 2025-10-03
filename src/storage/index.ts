import { SurveySubmission } from '../types';
import { STORAGE_KEY } from '../constants';

export const storage = {
  load(): SurveySubmission[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load submissions:', error);
      return [];
    }
  },

  save(submissions: SurveySubmission[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    } catch (error) {
      console.error('Failed to save submissions:', error);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear submissions:', error);
    }
  },
};
