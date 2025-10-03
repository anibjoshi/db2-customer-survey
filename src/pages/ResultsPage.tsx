import React from 'react';
import { Button, Section, Heading, InlineNotification } from '@carbon/react';
import { Download, TrashCan } from '@carbon/icons-react';
import { AggregatePoint, Problem, ProblemGroup } from '../types';
import { ScatterPlot, Legend } from '../components';

interface ResultsPageProps {
  aggregates: AggregatePoint[];
  problems: Problem[];
  submissionCount: number;
  onTakeAnother: () => void;
  onExport: () => void;
  onClearAll: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  aggregates,
  problems,
  submissionCount,
  onTakeAnother,
  onExport,
  onClearAll
}) => {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <Heading style={{ marginBottom: '1rem', fontSize: '2rem' }}>
          Thank You!
        </Heading>
        <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
          Your response has been saved. Here's how all submissions stack up:
        </p>
      </div>

      <Section level={3} style={{ marginBottom: '4rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <Heading style={{ marginBottom: '0.5rem' }}>
            Priority Matrix
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

      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        justifyContent: 'center',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Button
          onClick={onTakeAnother}
          kind="primary"
          size="lg"
        >
          Take Another Survey
        </Button>
        <Button
          onClick={onExport}
          disabled={submissionCount === 0}
          kind="secondary"
          renderIcon={Download}
          size="lg"
        >
          Export Data (CSV)
        </Button>
        <Button
          onClick={onClearAll}
          disabled={submissionCount === 0}
          kind="danger--tertiary"
          renderIcon={TrashCan}
          size="lg"
        >
          Clear All Data
        </Button>
      </div>
    </div>
  );
};

