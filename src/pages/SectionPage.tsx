import React from 'react';
import { Button, Heading } from '@carbon/react';
import { Problem, Response } from '../types';
import { ProblemCard } from '../components';

interface SectionPageProps {
  sectionName: string;
  sectionColor: string;
  problems: Problem[];
  responses: Response[];
  currentSectionIndex: number;
  totalSections: number;
  onResponseUpdate: (problemId: number, updated: Response) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const SectionPage: React.FC<SectionPageProps> = ({
  sectionName,
  sectionColor,
  problems,
  responses,
  currentSectionIndex,
  totalSections,
  onResponseUpdate,
  onPrevious,
  onNext
}) => {
  return (
    <div>
      {/* Progress indicator */}
      <div style={{ marginBottom: '3rem' }}>
        <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '0.5rem' }}>
          Section {currentSectionIndex + 1} of {totalSections}
        </p>
        <div style={{ 
          width: '100%', 
          height: '4px', 
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${((currentSectionIndex + 1) / totalSections) * 100}%`,
            height: '100%',
            backgroundColor: '#0f62fe',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div 
            style={{ 
              width: '4px', 
              height: '32px', 
              backgroundColor: sectionColor,
              borderRadius: '2px'
            }}
          />
          <Heading style={{ margin: 0 }}>
            {sectionName}
          </Heading>
        </div>
        <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.5' }}>
          Rate each problem based on how frequently it occurs and how severe the impact is.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        {problems.map(problem => {
          const response = responses.find(r => r.problemId === problem.id)!;
          return (
            <ProblemCard
              key={problem.id}
              problem={problem}
              response={response}
              onUpdate={(updated) => onResponseUpdate(problem.id, updated)}
            />
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Button
          onClick={onPrevious}
          kind="secondary"
          size="lg"
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          kind="primary"
          size="lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

