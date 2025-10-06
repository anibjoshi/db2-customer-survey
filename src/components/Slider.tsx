import React from 'react';
import { Slider as CarbonSlider, NumberInput } from '@carbon/react';
import { MIN_RATING, MAX_RATING } from '../constants';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hideLabels?: boolean;
}

export const Slider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  onChange, 
  min = MIN_RATING, 
  max = MAX_RATING,
  step = 1,
  hideLabels = false
}) => {
  return (
    <div className="custom-slider-wrapper">
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
        step={step}
        value={value}
        onChange={({ value: newValue }) => onChange(newValue)}
        formatLabel={(value) => `${value}`}
      />
    </div>
  );
};
