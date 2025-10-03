import { SurveySubmission } from '../types';

export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const exportToCSV = (submissions: SurveySubmission[]): void => {
  const headers = ['Submission ID', 'Timestamp', 'Problem ID', 'Frequency', 'Severity', 'Notes'];
  const rows: string[][] = [headers];

  submissions.forEach(submission => {
    submission.responses.forEach(response => {
      rows.push([
        submission.id,
        submission.timestamp,
        response.problemId.toString(),
        response.frequency.toString(),
        response.severity.toString(),
        `"${(submission.notes || '').replace(/"/g, '""')}"`,
      ]);
    });
  });

  const csvContent = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `zora-survey-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
