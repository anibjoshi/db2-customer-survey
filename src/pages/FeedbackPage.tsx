import React from 'react';
import { Button, TextArea, Heading } from '@carbon/react';

interface FeedbackPageProps {
  notes: string;
  totalSections: number;
  onNotesChange: (value: string) => void;
  onPrevious: () => void;
  onSubmit: () => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  notes,
  totalSections,
  onNotesChange,
  onPrevious,
  onSubmit
}) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <Heading style={{ marginBottom: '1rem' }}>
          Additional Feedback
        </Heading>
        <p style={{ 
          fontSize: '1rem',
          marginBottom: '2rem',
          opacity: 0.9,
          lineHeight: '1.5'
        }}>
          Are there other major pain points we haven't captured? Share any additional context that might help us understand your needs better.
        </p>
        <TextArea
          id="notes-textarea"
          labelText="Your feedback (optional)"
          placeholder="Share any missing problems, additional context, or specific scenarios..."
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          rows={6}
        />
      </div>

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
          onClick={onSubmit}
          kind="primary"
          size="lg"
        >
          Submit survey
        </Button>
      </div>
    </div>
  );
};

