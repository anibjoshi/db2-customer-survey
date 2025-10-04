import React, { useState, useEffect } from 'react';
import { 
  Button, 
  TextInput, 
  TextArea,
  Tile, 
  Heading,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell
} from '@carbon/react';
import { Add, Launch, TrashCan, Checkmark } from '@carbon/icons-react';
import { SurveySession } from '../types';
import { sessionManager } from '../storage/sessionManager';

interface SessionLauncherPageProps {
  onLaunchSurvey: (sessionId: string) => void;
  onViewResults: (sessionId?: string) => void;
}

export const SessionLauncherPage: React.FC<SessionLauncherPageProps> = ({
  onLaunchSurvey,
  onViewResults
}) => {
  const [sessions, setSessions] = useState<SurveySession[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDesc, setNewSessionDesc] = useState('');

  useEffect(() => {
    const loadSessions = async () => {
      const sessions = await sessionManager.getAllSessions();
      setSessions(sessions);
    };
    loadSessions();
  }, []);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;

    await sessionManager.createSession(
      newSessionName.trim(),
      newSessionDesc.trim() || undefined
    );

    const sessions = await sessionManager.getAllSessions();
    setSessions(sessions);
    setNewSessionName('');
    setNewSessionDesc('');
    setShowCreateForm(false);
  };

  const handleLaunchSession = (sessionId: string) => {
    sessionManager.setActiveSession(sessionId);
    onLaunchSurvey(sessionId);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session? This will not delete the responses.')) {
      await sessionManager.deleteSession(sessionId);
      const sessions = await sessionManager.getAllSessions();
      setSessions(sessions);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '4rem auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <Heading style={{ marginBottom: '1rem', fontSize: '2rem' }}>
          Survey Session Manager
        </Heading>
        <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.5' }}>
          Create and manage survey sessions to organize responses by event, date, or cohort.
        </p>
      </div>

      {/* Create Session Form */}
      {showCreateForm ? (
        <Tile style={{ marginBottom: '2rem', padding: '2rem' }}>
          <Heading style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            Create New Session
          </Heading>
          <div style={{ marginBottom: '1rem' }}>
            <TextInput
              id="session-name"
              labelText="Session Name"
              placeholder="e.g., Q4 2024 Customer Workshop"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <TextArea
              id="session-desc"
              labelText="Description (Optional)"
              placeholder="Add context about this survey session..."
              value={newSessionDesc}
              onChange={(e) => setNewSessionDesc(e.target.value)}
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              onClick={handleCreateSession}
              kind="primary"
              disabled={!newSessionName.trim()}
            >
              Create Session
            </Button>
            <Button
              onClick={() => {
                setShowCreateForm(false);
                setNewSessionName('');
                setNewSessionDesc('');
              }}
              kind="secondary"
            >
              Cancel
            </Button>
          </div>
        </Tile>
      ) : (
        <div style={{ marginBottom: '2rem' }}>
          <Button
            onClick={() => setShowCreateForm(true)}
            kind="primary"
            renderIcon={Add}
          >
            Create New Session
          </Button>
        </div>
      )}

      {/* Sessions Table */}
      <Heading style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
        Active Sessions
      </Heading>

      {sessions.length > 0 ? (
        <div style={{ 
          backgroundColor: '#262626',
          border: '1px solid #393939',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Session Name</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Created</TableHeader>
                <TableHeader>Responses</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell style={{ fontWeight: '600' }}>{session.name}</TableCell>
                  <TableCell>{session.description || '-'}</TableCell>
                  <TableCell>{new Date(session.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{session.responseCount}</TableCell>
                  <TableCell>
                    {session.isActive && (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        color: '#24a148'
                      }}>
                        <Checkmark size={16} /> Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        size="sm"
                        kind="primary"
                        renderIcon={Launch}
                        onClick={() => handleLaunchSession(session.id)}
                      >
                        Launch
                      </Button>
                      <Button
                        size="sm"
                        kind="ghost"
                        renderIcon={TrashCan}
                        onClick={() => handleDeleteSession(session.id)}
                        hasIconOnly
                        iconDescription="Delete session"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Tile style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
            No sessions created yet. Create your first session to get started.
          </p>
        </Tile>
      )}

      <div style={{ 
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <Button
          onClick={() => onViewResults()}
          kind="tertiary"
        >
          View All Results
        </Button>
      </div>
    </div>
  );
};

