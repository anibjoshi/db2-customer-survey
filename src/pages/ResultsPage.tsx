import React from 'react';
import { 
  Button, 
  Section, 
  Heading, 
  InlineNotification
} from '@carbon/react';
import { Download, DataBase } from '@carbon/icons-react';
import { AggregatePoint, Problem, ProblemGroup, SurveySubmission } from '../types';
import { ScatterPlot, Legend, ResponsesTable } from '../components';

interface ResultsPageProps {
  aggregates: AggregatePoint[];
  problems: Problem[];
  submissions: SurveySubmission[];
  submissionCount: number;
  onExport: () => void;
  onExportDatabase?: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  aggregates,
  problems,
  submissions,
  submissionCount,
  onExport,
  onExportDatabase
}) => {
  return (
    <div style={{ marginTop: '-1rem' }}>
      <Section level={3} style={{ marginBottom: '4rem', paddingTop: 0 }}>
        <div style={{ marginBottom: '3rem' }}>
          <Heading style={{ marginBottom: '0.5rem' }}>
            Results
          </Heading>
          <p style={{ 
            fontSize: '0.875rem',
            opacity: 0.9,
            marginBottom: '2rem'
          }}>
            Average severity and frequency across {submissionCount} {submissionCount === 1 ? 'response' : 'responses'}
          </p>
          <Legend groups={Array.from(new Set(problems.map(p => p.group as ProblemGroup)))} />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <ScatterPlot data={aggregates} />
        </div>

        <InlineNotification
          kind="info"
          lowContrast
          hideCloseButton
          title="Pro Tip"
          subtitle="Problems in the upper-right quadrant (Critical Priority) should be addressed first. Share this survey with more team members to get better insights."
          style={{ maxWidth: '100%' }}
        />
      </Section>

      {/* Submissions Table */}
      <Section level={3} style={{ marginBottom: '4rem' }}>
        <Heading style={{ marginBottom: '1.5rem' }}>
          Survey Responses ({submissionCount})
        </Heading>

        {submissions.length > 0 ? (
          <ResponsesTable submissions={submissions} problems={problems} />
        ) : (
          <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>
            No submissions yet. Share the survey link to collect responses.
          </p>
        )}
      </Section>

      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        justifyContent: 'center',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        flexWrap: 'wrap'
      }}>
        <Button
          onClick={onExport}
          disabled={submissionCount === 0}
          kind="primary"
          renderIcon={Download}
          size="lg"
        >
          Export CSV
        </Button>
        {onExportDatabase && (
          <Button
            onClick={onExportDatabase}
            disabled={submissionCount === 0}
            kind="secondary"
            renderIcon={DataBase}
            size="lg"
          >
            Export Database
          </Button>
        )}
      </div>
    </div>
  );
};

