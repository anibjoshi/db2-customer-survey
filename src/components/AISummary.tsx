import React, { useState } from 'react';
import { Button, Tile, Heading, SkeletonText } from '@carbon/react';
import { Ai } from '@carbon/icons-react';
import { SurveySubmission } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api');

interface AISummaryProps {
  submissions: SurveySubmission[];
  sessionId?: string;
}

interface AISummaryData {
  summary: string;
  topProblems: Array<{
    id: string;
    title: string;
    section: string;
    avgFrequency: string;
    avgSeverity: string;
    score: string;
  }>;
  metadata: {
    responseCount: number;
    generatedAt: string;
  };
}

export const AISummary: React.FC<AISummaryProps> = ({ submissions, sessionId }) => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<AISummaryData | null>(null);
  const [error, setError] = useState('');

  const generateSummary = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/ai-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, submissions })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const data = await response.json();
      setSummaryData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      {!summaryData ? (
        <Tile style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Ai size={48} style={{ opacity: 0.6 }} />
          </div>
          <Heading style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            AI Insights
          </Heading>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1.5rem' }}>
            Get a brief AI analysis of the key pain points and priorities.
          </p>
          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </p>
          )}
          <Button
            onClick={generateSummary}
            disabled={loading || submissions.length === 0}
            kind="primary"
            renderIcon={Ai}
          >
            {loading ? 'Generating...' : 'Generate AI Summary'}
          </Button>
          {submissions.length === 0 && (
            <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '1rem' }}>
              Need at least 1 response to generate summary
            </p>
          )}
        </Tile>
      ) : (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ai size={24} />
              <Heading style={{ fontSize: '1.25rem', margin: 0 }}>
                AI Analysis
              </Heading>
            </div>
            <Button
              size="sm"
              kind="tertiary"
              onClick={generateSummary}
              disabled={loading}
            >
              Regenerate
            </Button>
          </div>

          {loading ? (
            <Tile style={{ padding: '2rem' }}>
              <SkeletonText paragraph lineCount={8} />
            </Tile>
          ) : (
            <>
              <Tile style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  fontSize: '0.875rem'
                }}>
                  {summaryData.summary}
                </div>
              </Tile>

              <Tile style={{ padding: '1.5rem' }}>
                <Heading style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                  Top 5 Problems by Impact Score
                </Heading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {summaryData.topProblems.map((problem, index) => (
                    <div 
                      key={problem.id}
                      style={{ 
                        padding: '1rem',
                        backgroundColor: '#1c1c1c',
                        borderRadius: '4px',
                        borderLeft: `4px solid ${index === 0 ? '#ff6b6b' : index === 1 ? '#ffa500' : '#ffeb3b'}`
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                        #{index + 1} • {problem.section}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {problem.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                        Frequency: {problem.avgFrequency}/10 • Severity: {problem.avgSeverity}/10 • Score: {problem.score}
                      </div>
                    </div>
                  ))}
                </div>
              </Tile>

              <p style={{ 
                fontSize: '0.75rem', 
                opacity: 0.5, 
                marginTop: '1rem',
                textAlign: 'center'
              }}>
                Generated at {new Date(summaryData.metadata.generatedAt).toLocaleString()}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

