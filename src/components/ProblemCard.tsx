import React from 'react';
import { Tile, Grid, Column } from '@carbon/react';
import { Problem, Response } from '../types';
import { GROUP_COLORS } from '../constants';
import { Slider } from './Slider';

interface ProblemCardProps {
  problem: Problem;
  response: Response;
  onUpdate: (response: Response) => void;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, response, onUpdate }) => {
  const groupColor = GROUP_COLORS[problem.group];

  return (
    <Tile style={{ padding: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div 
          style={{ 
            width: '4px', 
            height: '20px', 
            backgroundColor: groupColor,
            borderRadius: '2px',
            flexShrink: 0,
            marginTop: '0.25rem'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '0.75rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            opacity: 0.7,
            letterSpacing: '0.32px'
          }}>
            Problem #{problem.id}
          </div>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            margin: 0,
            lineHeight: '1.5'
          }}>
            {problem.title}
          </h3>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem' 
      }}>
        <Slider
          label="Frequency"
          value={response.frequency}
          onChange={frequency => onUpdate({ ...response, frequency })}
        />
        <Slider
          label="Severity"
          value={response.severity}
          onChange={severity => onUpdate({ ...response, severity })}
        />
      </div>
    </Tile>
  );
};
