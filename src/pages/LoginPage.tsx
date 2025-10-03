import React, { useState } from 'react';
import { Button, TextInput, Tile, Heading, InlineNotification } from '@carbon/react';
import { Login } from '@carbon/icons-react';

interface LoginPageProps {
  onLogin: (password: string) => void;
  error?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '8rem auto', 
      textAlign: 'center' 
    }}>
      <Heading style={{ marginBottom: '1rem', fontSize: '2rem' }}>
        Results Dashboard
      </Heading>
      
      <p style={{ 
        fontSize: '1rem', 
        lineHeight: '1.6',
        marginBottom: '3rem',
        opacity: 0.9
      }}>
        Enter the password to view survey results and analytics.
      </p>

      <Tile style={{ 
        padding: '2.5rem', 
        textAlign: 'left',
        marginBottom: '2rem'
      }}>
        <form onSubmit={handleSubmit}>
          <TextInput
            id="password-input"
            type="password"
            labelText="Password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            style={{ marginBottom: '1.5rem' }}
          />
          
          {error && (
            <InlineNotification
              kind="error"
              lowContrast
              hideCloseButton
              title="Authentication failed"
              subtitle={error}
              style={{ marginBottom: '1.5rem' }}
            />
          )}

          <Button
            type="submit"
            kind="primary"
            size="lg"
            renderIcon={Login}
            disabled={!password.trim()}
            style={{ width: '100%' }}
          >
            Access Results
          </Button>
        </form>
      </Tile>

      <p style={{ 
        fontSize: '0.75rem',
        opacity: 0.6,
        marginTop: '2rem'
      }}>
        Contact your administrator if you need access.
      </p>
    </div>
  );
};

