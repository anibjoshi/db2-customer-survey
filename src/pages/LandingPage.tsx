import React from 'react';
import { Heading } from '@carbon/react';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ 
      maxWidth: '700px', 
      margin: '8rem auto',
      padding: '0 2rem',
      textAlign: 'center'
    }}>
      <img 
        src="/image.png" 
        alt="IBM Db2 Survey" 
        style={{ 
          maxWidth: '500px',
          width: '100%',
          height: 'auto',
          marginBottom: '3rem'
        }} 
      />
      <Heading style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>
        IBM Db2 Customer Survey
      </Heading>
      <p style={{ 
        fontSize: '1.25rem', 
        lineHeight: '1.6',
        opacity: 0.9
      }}>
        Help us understand which database problems impact you most. Your feedback will guide our product roadmap.
      </p>
    </div>
  );
};

