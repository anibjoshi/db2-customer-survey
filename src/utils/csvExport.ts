import { SurveySubmission } from '../types';

export const exportToCSV = (submissions: SurveySubmission[]): void => {
  const headers = ['Submission ID', 'Timestamp', 'Problem ID', 'Frequency', 'Severity', 'Text Response', 'Notes'];
  const rows: string[][] = [headers];

  submissions.forEach(submission => {
    submission.responses.forEach(response => {
      rows.push([
        submission.id,
        submission.timestamp,
        response.problemId.toString(),
        response.frequency?.toString() || '',
        response.severity?.toString() || '',
        response.textResponse ? `"${response.textResponse.replace(/"/g, '""')}"` : '',
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

export const exportSingleSubmissionToCSV = (submission: SurveySubmission, respondentName: string, respondentEmail: string): void => {
  const headers = ['Submission ID', 'Timestamp', 'Respondent Name', 'Respondent Email', 'Problem ID', 'Frequency', 'Severity', 'Text Response', 'Notes'];
  const rows: string[][] = [headers];

  submission.responses.forEach(response => {
    rows.push([
      submission.id,
      submission.timestamp,
      `"${respondentName.replace(/"/g, '""')}"`,
      `"${respondentEmail.replace(/"/g, '""')}"`,
      response.problemId.toString(),
      response.frequency?.toString() || '',
      response.severity?.toString() || '',
      response.textResponse ? `"${response.textResponse.replace(/"/g, '""')}"` : '',
      `"${(submission.notes || '').replace(/"/g, '""')}"`,
    ]);
  });

  const csvContent = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `zora-survey-response-${respondentName.replace(/\s+/g, '-')}-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

