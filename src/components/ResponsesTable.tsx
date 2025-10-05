import React, { useState, useMemo } from 'react';
import { 
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandRow,
  TableExpandedRow,
  TableExpandHeader,
  Heading
} from '@carbon/react';
import { SurveySubmission, Problem } from '../types';

interface ResponsesTableProps {
  submissions: SurveySubmission[];
  problems: Problem[];
}

export const ResponsesTable: React.FC<ResponsesTableProps> = ({ submissions, problems }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Calculate aggregates (no longer used, but kept for backward compatibility)
  const aggregates = useMemo(() => {
    if (submissions.length === 0) return null;

    const totalResponses = submissions.length;
    const avgFrequency = submissions.reduce((sum, sub) => {
      const validResponses = sub.responses.filter(r => r.frequency !== undefined);
      if (validResponses.length === 0) return sum;
      const avg = validResponses.reduce((s, r) => s + (r.frequency || 0), 0) / validResponses.length;
      return sum + avg;
    }, 0) / totalResponses;

    const avgSeverity = submissions.reduce((sum, sub) => {
      const validResponses = sub.responses.filter(r => r.severity !== undefined);
      if (validResponses.length === 0) return sum;
      const avg = validResponses.reduce((s, r) => s + (r.severity || 0), 0) / validResponses.length;
      return sum + avg;
    }, 0) / totalResponses;

    const withNotes = submissions.filter(s => s.notes).length;

    return {
      totalResponses,
      avgFrequency: avgFrequency.toFixed(1),
      avgSeverity: avgSeverity.toFixed(1),
      withNotesPercent: ((withNotes / totalResponses) * 100).toFixed(0)
    };
  }, [submissions]);

  return (
    <div>
      {/* Detailed Table */}
      <div style={{ 
        backgroundColor: '#262626',
        border: '1px solid #393939',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableExpandHeader />
              <TableHeader>#</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Notes</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission, index) => {
              const isExpanded = expandedRows.has(submission.id);

              return (
                <React.Fragment key={submission.id}>
                  <TableExpandRow
                    isExpanded={isExpanded}
                    onExpand={() => toggleRow(submission.id)}
                    aria-label="Expand row"
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{submission.respondentName || 'Anonymous'}</TableCell>
                    <TableCell>{submission.respondentEmail || '-'}</TableCell>
                    <TableCell>{new Date(submission.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{submission.notes ? '✓' : '-'}</TableCell>
                  </TableExpandRow>
                  {isExpanded && (
                    <TableExpandedRow colSpan={6}>
                      <div style={{ padding: '1.5rem', backgroundColor: '#1c1c1c' }}>
                        <Heading style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                          Question-by-Question Breakdown
                        </Heading>
                        <div style={{ marginBottom: '1rem' }}>
                          <Table size="sm">
                            <TableHead>
                              <TableRow>
                                <TableHeader>Question #</TableHeader>
                                <TableHeader>Question</TableHeader>
                                <TableHeader>Response</TableHeader>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {submission.responses.map((response, idx) => {
                                const problem = problems.find(p => p.id === response.problemId);
                                
                                // Format response based on question type
                                let responseText = '';
                                if (response.textResponse) {
                                  // Single/multiple choice questions
                                  // Replace ||| separator with comma for display
                                  responseText = response.textResponse.replace(/\|\|\|/g, ', ');
                                } else if (problem?.questionType === 'slider-labeled') {
                                  // Slider-labeled uses frequency field to store position (1-5)
                                  const sliderLabels = [
                                    'Entirely CLI / Automated',
                                    'Mostly CLI',
                                    'Balanced',
                                    'Mostly GUI',
                                    'Entirely GUI'
                                  ];
                                  const position = response.frequency || 3;
                                  responseText = sliderLabels[position - 1] || `Position ${position}`;
                                } else if (response.frequency !== undefined && response.severity !== undefined) {
                                  // Regular slider questions
                                  responseText = `Freq: ${response.frequency}, Sev: ${response.severity}`;
                                } else {
                                  responseText = '-';
                                }
                                
                                return (
                                  <TableRow key={`${submission.id}-${response.problemId}-${idx}`}>
                                    <TableCell>{response.problemId}</TableCell>
                                    <TableCell>{problem?.title || 'Unknown'}</TableCell>
                                    <TableCell>{responseText}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                        {submission.notes && (
                          <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                              Additional Feedback:
                            </div>
                            <div style={{ 
                              padding: '0.75rem',
                              backgroundColor: '#262626',
                              borderRadius: '4px',
                              fontSize: '0.875rem'
                            }}>
                              {submission.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableExpandedRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

