import React from 'react';
import { Tile, Checkbox, RadioButton, RadioButtonGroup } from '@carbon/react';
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
  const questionType = problem.questionType || 'slider';

  const renderQuestionInput = () => {
    switch (questionType) {
      case 'single-choice':
        return (
          <RadioButtonGroup
            name={`question-${problem.id}`}
            valueSelected={response.textResponse || ''}
            onChange={(value) => onUpdate({ ...response, textResponse: String(value) })}
            orientation="vertical"
          >
            {problem.options?.map((option, index) => (
              <RadioButton
                key={index}
                labelText={option}
                value={option}
                id={`${problem.id}-option-${index}`}
              />
            ))}
          </RadioButtonGroup>
        );

      case 'multiple-choice':
        const selectedOptions = response.textResponse ? response.textResponse.split('|||') : [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {problem.options?.map((option, index) => (
              <Checkbox
                key={index}
                labelText={option}
                id={`${problem.id}-option-${index}`}
                checked={selectedOptions.includes(option)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  let newSelected = [...selectedOptions];
                  if (e.target.checked) {
                    newSelected.push(option);
                  } else {
                    newSelected = newSelected.filter(o => o !== option);
                  }
                  onUpdate({ ...response, textResponse: newSelected.join('|||') });
                }}
              />
            ))}
          </div>
        );

      case 'slider-labeled':
        return (
          <div>
            <Slider
              label={problem.options?.[Math.round((response.frequency || 3) - 1)] || ''}
              value={response.frequency || 3}
              onChange={frequency => onUpdate({ ...response, frequency, severity: 0 })}
              min={1}
              max={problem.options?.length || 5}
              step={1}
            />
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', opacity: 0.7 }}>
              {problem.options?.map((label, idx) => (
                <div key={idx} style={{ marginBottom: '0.25rem' }}>
                  <strong>{idx + 1}:</strong> {label}
                </div>
              ))}
            </div>
          </div>
        );

      case 'slider':
      default:
        return (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '2rem' 
          }}>
            <Slider
              label="Frequency"
              value={response.frequency || 3}
              onChange={frequency => onUpdate({ ...response, frequency })}
            />
            <Slider
              label="Severity"
              value={response.severity || 3}
              onChange={severity => onUpdate({ ...response, severity })}
            />
          </div>
        );
    }
  };

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
      
      {renderQuestionInput()}
    </Tile>
  );
};
