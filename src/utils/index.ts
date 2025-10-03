export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export { exportToCSV, exportSingleSubmissionToCSV } from './csvExport';
