import React from 'react';
import { ProblemGroup } from '../types';
import { GROUP_COLORS } from '../constants';

interface LegendProps {
  groups: ProblemGroup[];
}

export const Legend: React.FC<LegendProps> = ({ groups }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      alignItems: 'center', 
      gap: '1rem',
      fontSize: '0.875rem'
    }}>
      {groups.map(group => (
        <div key={group} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem' 
        }}>
          <div 
            style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: GROUP_COLORS[group] 
            }}
          />
          <span style={{ 
            fontWeight: '500' 
          }}>
            {group}
          </span>
        </div>
      ))}
    </div>
  );
};
