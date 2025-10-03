import React from 'react';
import { Slider as CarbonSlider, NumberInput } from '@carbon/react';
import { MIN_RATING, MAX_RATING } from '../constants';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const Slider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  onChange, 
  min = MIN_RATING, 
  max = MAX_RATING 
}) => {
  return (
    <div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label style={{ 
          fontSize: '0.875rem', 
          fontWeight: '600',
          letterSpacing: '0.16px'
        }}>
          {label}
        </label>
      </div>
      <CarbonSlider
        labelText=""
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={({ value: newValue }) => onChange(newValue)}
        formatLabel={(value) => `${value}`}
      />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: '0.75rem',
        marginTop: '0.25rem',
        opacity: 0.7,
        maxWidth: 'calc(100% - 5rem)',
        paddingLeft: '0.25rem'
      }}>
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
};
