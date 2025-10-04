import React, { useState } from 'react';
import { 
  Button, 
  TextInput, 
  TextArea,
  Tile,
  Heading,
  InlineNotification
} from '@carbon/react';
import { Save, Reset, Download } from '@carbon/icons-react';
import { SurveyConfig } from '../hooks/useSurveyConfig';
import { configManager } from '../storage/configManager';

interface SurveyConfigEditorProps {
  currentConfig: SurveyConfig | null;
  onConfigSaved: () => void;
}

export const SurveyConfigEditor: React.FC<SurveyConfigEditorProps> = ({
  currentConfig,
  onConfigSaved
}) => {
  const [configJson, setConfigJson] = useState(() => 
    JSON.stringify(currentConfig, null, 2)
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSave = () => {
    try {
      const parsed = JSON.parse(configJson);
      
      // Basic validation
      if (!parsed.title || !parsed.description || !parsed.sections || !Array.isArray(parsed.sections)) {
        throw new Error('Invalid config structure. Must have title, description, and sections array.');
      }

      configManager.saveConfig(parsed);
      setSaveSuccess(true);
      setError('');
      
      setTimeout(() => {
        setSaveSuccess(false);
        onConfigSaved();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to revert to the default configuration? This will reload the app.')) {
      configManager.clearConfig();
      window.location.reload();
    }
  };

  const handleExport = () => {
    try {
      const parsed = JSON.parse(configJson);
      configManager.exportConfig(parsed);
    } catch (err) {
      setError('Cannot export invalid JSON');
    }
  };

  const isCustomConfig = configManager.hasCustomConfig();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Heading style={{ marginBottom: '0.5rem' }}>
          Survey Configuration
        </Heading>
        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
          Edit the survey structure, questions, and sections. Changes take effect immediately.
        </p>
      </div>

      {isCustomConfig && (
        <InlineNotification
          kind="info"
          lowContrast
          hideCloseButton
          title="Custom Configuration Active"
          subtitle="You are using a customized survey configuration. Click 'Revert to Default' to restore the original."
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {saveSuccess && (
        <InlineNotification
          kind="success"
          lowContrast
          hideCloseButton
          title="Configuration Saved"
          subtitle="Survey configuration has been updated successfully. Refresh to see changes."
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {error && (
        <InlineNotification
          kind="error"
          lowContrast
          onClose={() => setError('')}
          title="Error"
          subtitle={error}
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      <Tile style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            Configuration JSON
          </label>
          <TextArea
            id="config-json"
            labelText=""
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            rows={20}
            style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid #393939'
        }}>
          <Button
            onClick={handleSave}
            kind="primary"
            renderIcon={Save}
          >
            Save Configuration
          </Button>
          <Button
            onClick={handleExport}
            kind="secondary"
            renderIcon={Download}
          >
            Export JSON
          </Button>
          {isCustomConfig && (
            <Button
              onClick={handleReset}
              kind="danger--tertiary"
              renderIcon={Reset}
            >
              Revert to Default
            </Button>
          )}
        </div>
      </Tile>

      <Tile style={{ padding: '1.5rem', backgroundColor: '#1c1c1c' }}>
        <Heading style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
          Configuration Format
        </Heading>
        <pre style={{ 
          fontSize: '0.75rem', 
          opacity: 0.8,
          lineHeight: '1.5',
          overflow: 'auto'
        }}>
{`{
  "title": "Survey Title",
  "description": "Survey description",
  "sections": [
    {
      "id": "unique-id",
      "name": "Section Name",
      "problems": [
        {
          "id": 1,
          "title": "Question text"
        }
      ]
    }
  ]
}`}
        </pre>
      </Tile>
    </div>
  );
};

