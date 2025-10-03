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

  // Calculate aggregates
  const aggregates = useMemo(() => {
    if (submissions.length === 0) return null;

    const totalResponses = submissions.length;
    const avgFrequency = submissions.reduce((sum, sub) => {
      const avg = sub.responses.reduce((s, r) => s + r.frequency, 0) / sub.responses.length;
      return sum + avg;
    }, 0) / totalResponses;

    const avgSeverity = submissions.reduce((sum, sub) => {
      const avg = sub.responses.reduce((s, r) => s + r.severity, 0) / sub.responses.length;
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
      {/* Aggregate Summary */}
      {aggregates && (
        <div style={{ 
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#262626',
          border: '1px solid #393939',
          borderRadius: '4px'
        }}>
          <Heading style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            Summary Statistics
          </Heading>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                Total Responses
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                {aggregates.totalResponses}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                Avg Frequency
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                {aggregates.avgFrequency}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                Avg Severity
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                {aggregates.avgSeverity}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                With Feedback
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                {aggregates.withNotesPercent}%
              </div>
            </div>
          </div>
        </div>
      )}

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
              <TableHeader>Avg Freq</TableHeader>
              <TableHeader>Avg Sev</TableHeader>
              <TableHeader>Notes</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission, index) => {
              const avgFreq = (submission.responses.reduce((sum, r) => sum + r.frequency, 0) / submission.responses.length).toFixed(1);
              const avgSev = (submission.responses.reduce((sum, r) => sum + r.severity, 0) / submission.responses.length).toFixed(1);
              const isExpanded = expandedRows.has(submission.id);

              return (
                <React.Fragment key={submission.id}>
                  <TableExpandRow
                    isExpanded={isExpanded}
                    onExpand={() => toggleRow(submission.id)}
                    ariaLabel="Expand row"
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{submission.respondentName || 'Anonymous'}</TableCell>
                    <TableCell>{submission.respondentEmail || '-'}</TableCell>
                    <TableCell>{new Date(submission.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{avgFreq}</TableCell>
                    <TableCell>{avgSev}</TableCell>
                    <TableCell>{submission.notes ? '✓' : '-'}</TableCell>
                  </TableExpandRow>
                  {isExpanded && (
                    <TableExpandedRow colSpan={8}>
                      <div style={{ padding: '1.5rem', backgroundColor: '#1c1c1c' }}>
                        <Heading style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                          Question-by-Question Breakdown
                        </Heading>
                        <div style={{ marginBottom: '1rem' }}>
                          <Table size="sm">
                            <TableHead>
                              <TableRow>
                                <TableHeader>Problem #</TableHeader>
                                <TableHeader>Question</TableHeader>
                                <TableHeader>Frequency</TableHeader>
                                <TableHeader>Severity</TableHeader>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {submission.responses.map(response => {
                                const problem = problems.find(p => p.id === response.problemId);
                                return (
                                  <TableRow key={response.problemId}>
                                    <TableCell>{response.problemId}</TableCell>
                                    <TableCell>{problem?.title || 'Unknown'}</TableCell>
                                    <TableCell>{response.frequency}</TableCell>
                                    <TableCell>{response.severity}</TableCell>
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

