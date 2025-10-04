import React from 'react';
import { Button, TextInput, Tile, InlineNotification, Heading } from '@carbon/react';

interface WelcomePageProps {
  config: {
    title: string;
    description: string;
  } | null;
  name: string;
  email: string;
  totalSections: number;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onStartSurvey: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  config,
  name,
  email,
  totalSections,
  onNameChange,
  onEmailChange,
  onStartSurvey
}) => {
  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '4rem auto', 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Heading style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>
        Db2 Survey
      </Heading>
      <p style={{ 
        fontSize: '1.125rem', 
        lineHeight: '1.6',
        marginBottom: '3rem',
        opacity: 0.9
      }}>
        {config?.description || 'Please complete this survey.'}
      </p>
      
      <Tile style={{ 
        padding: '3rem 2.5rem', 
        textAlign: 'left', 
        marginBottom: '2rem', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="name-input"
            labelText="Full Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
        </div>
        <div>
          <TextInput
            id="email-input"
            labelText="Email Address (Optional)"
            placeholder="your.email@company.com"
            value={email}
            onChange={(e) => {
              const emailValue = e.target.value.trim().toLowerCase();
              onEmailChange(emailValue);
            }}
            type="email"
          />
        </div>
      </Tile>

      <InlineNotification
        kind="info"
        lowContrast
        hideCloseButton
        title="What to expect"
        subtitle={`You'll rate ${totalSections} categories of problems on frequency and severity scales (1-10)`}
        style={{ marginBottom: '2rem', textAlign: 'left', width: '100%' }}
      />

      <Button
        onClick={onStartSurvey}
        kind="primary"
        size="lg"
        disabled={!name.trim()}
        style={{ minWidth: '200px' }}
      >
        Start Survey
      </Button>
    </div>
  );
};

