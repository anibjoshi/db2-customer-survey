import React from 'react';
import { Heading } from '@carbon/react';
import { Checkmark } from '@carbon/icons-react';

export const ThankYouPage: React.FC = () => {
  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '8rem auto', 
      textAlign: 'center' 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          backgroundColor: '#24a148',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Checkmark size={48} color="white" />
        </div>
      </div>

      <Heading style={{ marginBottom: '1rem', fontSize: '2rem' }}>
        Thank You for Taking the Survey!
      </Heading>
      
      <p style={{ 
        fontSize: '1.125rem', 
        lineHeight: '1.6',
        opacity: 0.9
      }}>
        Your feedback has been successfully saved and will help us prioritize improvements.
      </p>
    </div>
  );
};

