import React, { useState, useEffect } from 'react';
import { 
  Button, 
  TextInput, 
  TextArea,
  Tile, 
  Heading,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell
} from '@carbon/react';
import { Add, Launch, TrashCan, Checkmark, StopFilled, View } from '@carbon/icons-react';
import { SurveySession, SurveySubmission, Problem, AggregatePoint } from '../types';
import { sessionManager } from '../storage/sessionManager';
import { api } from '../api/client';
import { ResponsesTable, ScatterPlot, Legend, SurveyConfigEditor } from '../components';
import { calculateAverage } from '../utils';
import { DEFAULT_RATING } from '../constants';
import { SurveyConfig } from '../hooks/useSurveyConfig';

interface DashboardPageProps {
  problems: Problem[];
  currentConfig: SurveyConfig | null;
  onLaunchSurvey: (sessionId: string) => void;
  onConfigUpdate: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  problems,
  currentConfig,
  onLaunchSurvey,
  onConfigUpdate
}) => {
  const [sessions, setSessions] = useState<SurveySession[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDesc, setNewSessionDesc] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessionSubmissions, setSelectedSessionSubmissions] = useState<SurveySubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<SurveySubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'sessions' | 'results' | 'all' | 'config'>('sessions');

  const loadSessions = async () => {
    const sessions = await sessionManager.getAllSessions();
    setSessions(sessions);
  };

  const loadAllSubmissions = async () => {
    const submissions = await api.getAllSubmissions();
    setAllSubmissions(submissions);
  };

  useEffect(() => {
    loadSessions();
    loadAllSubmissions();
  }, []);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;

    await sessionManager.createSession(
      newSessionName.trim(),
      newSessionDesc.trim() || undefined
    );

    await loadSessions();
    setNewSessionName('');
    setNewSessionDesc('');
    setShowCreateForm(false);
  };

  const handleLaunchSession = (sessionId: string) => {
    sessionManager.setActiveSession(sessionId);
    onLaunchSurvey(sessionId);
  };

  const handleEndSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to end this session? The survey link will no longer work.')) {
      await sessionManager.endSession(sessionId);
      await loadSessions();
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session and all its responses? This cannot be undone.')) {
      await sessionManager.deleteSession(sessionId);
      await loadSessions();
      // Reload all submissions if we're on that tab
      if (activeTab === 'all') {
        await loadAllSubmissions();
      }
    }
  };

  const handleViewSessionResults = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActiveTab('results');
    
    // Load submissions for this session
    const submissions = await api.getSessionSubmissions(sessionId);
    setSelectedSessionSubmissions(submissions);
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  // Calculate aggregates for selected session
  const sessionAggregates: AggregatePoint[] = React.useMemo(() => {
    if (selectedSessionSubmissions.length === 0) {
      return problems.map(problem => ({
        id: problem.id,
        x: DEFAULT_RATING,
        y: DEFAULT_RATING,
        group: problem.group,
        title: problem.title,
      }));
    }

    return problems.map(problem => {
      const problemResponses = selectedSessionSubmissions.flatMap(submission =>
        submission.responses.filter(response => response.problemId === problem.id)
      );

      return {
        id: problem.id,
        x: calculateAverage(problemResponses.map(r => r.frequency)),
        y: calculateAverage(problemResponses.map(r => r.severity)),
        group: problem.group,
        title: problem.title,
      };
    });
  }, [selectedSessionSubmissions, problems]);

  // Calculate aggregates for all submissions
  const allAggregates: AggregatePoint[] = React.useMemo(() => {
    if (allSubmissions.length === 0) {
      return problems.map(problem => ({
        id: problem.id,
        x: DEFAULT_RATING,
        y: DEFAULT_RATING,
        group: problem.group,
        title: problem.title,
      }));
    }

    return problems.map(problem => {
      const problemResponses = allSubmissions.flatMap(submission =>
        submission.responses.filter(response => response.problemId === problem.id)
      );

      return {
        id: problem.id,
        x: calculateAverage(problemResponses.map(r => r.frequency)),
        y: calculateAverage(problemResponses.map(r => r.severity)),
        group: problem.group,
        title: problem.title,
      };
    });
  }, [allSubmissions, problems]);

  return (
    <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 48px)', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ padding: '0 2rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <Heading style={{ marginBottom: '1rem', fontSize: '2rem' }}>
            Survey Dashboard
          </Heading>
          <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.5' }}>
            Create and manage survey sessions, launch surveys, and view results.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          borderBottom: '2px solid #393939',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setActiveTab('sessions')}
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: activeTab === 'sessions' ? '#0f62fe' : 'transparent',
              color: activeTab === 'sessions' ? 'white' : '#f4f4f4',
              border: 'none',
              borderBottom: activeTab === 'sessions' ? '2px solid #0f62fe' : 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!selectedSessionId}
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: activeTab === 'results' ? '#0f62fe' : 'transparent',
              color: activeTab === 'results' ? 'white' : '#f4f4f4',
              border: 'none',
              borderBottom: activeTab === 'results' ? '2px solid #0f62fe' : 'none',
              cursor: selectedSessionId ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              fontWeight: '600',
              opacity: selectedSessionId ? 1 : 0.4
            }}
          >
            Session Results {selectedSession ? `- ${selectedSession.name}` : ''}
          </button>
          <button
            onClick={() => {
              setActiveTab('all');
              loadAllSubmissions();
            }}
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: activeTab === 'all' ? '#0f62fe' : 'transparent',
              color: activeTab === 'all' ? 'white' : '#f4f4f4',
              border: 'none',
              borderBottom: activeTab === 'all' ? '2px solid #0f62fe' : 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveTab('config')}
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: activeTab === 'config' ? '#0f62fe' : 'transparent',
              color: activeTab === 'config' ? 'white' : '#f4f4f4',
              border: 'none',
              borderBottom: activeTab === 'config' ? '2px solid #0f62fe' : 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Survey Config
          </button>
        </div>

        {/* Sessions Tab Content */}
        {activeTab === 'sessions' && (
          <div>
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
                            {session.isActive ? (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.25rem',
                                color: '#24a148'
                              }}>
                                <Checkmark size={16} /> Active
                              </span>
                            ) : (
                              <span style={{ opacity: 0.5 }}>Ended</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {session.isActive && (
                                <Button
                                  size="sm"
                                  kind="primary"
                                  renderIcon={Launch}
                                  onClick={() => handleLaunchSession(session.id)}
                                >
                                  Launch
                                </Button>
                              )}
                              {session.isActive && (
                                <Button
                                  size="sm"
                                  kind="tertiary"
                                  renderIcon={StopFilled}
                                  onClick={() => handleEndSession(session.id)}
                                >
                                  End
                                </Button>
                              )}
                              <Button
                                size="sm"
                                kind="ghost"
                                renderIcon={View}
                                onClick={() => handleViewSessionResults(session.id)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                kind="ghost"
                                renderIcon={TrashCan}
                                onClick={() => handleDeleteSession(session.id)}
                                hasIconOnly
                                iconDescription="Delete"
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
          </div>
        )}

        {/* Session Results Tab Content */}
        {activeTab === 'results' && (
          <div>
            {selectedSession && (
                <div>
                  <div style={{ marginBottom: '2rem' }}>
                    <Heading style={{ marginBottom: '0.5rem' }}>
                      {selectedSession.name}
                    </Heading>
                    <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                      {selectedSession.description || 'No description provided'}
                    </p>
                    <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.5rem' }}>
                      Created: {new Date(selectedSession.createdAt).toLocaleDateString()} • 
                      {selectedSessionSubmissions.length} {selectedSessionSubmissions.length === 1 ? 'response' : 'responses'} •
                      Status: {selectedSession.isActive ? 'Active' : 'Ended'}
                    </p>
                  </div>

                  {selectedSessionSubmissions.length > 0 ? (
                    <>
                      {/* Priority Matrix for this session */}
                      <div style={{ marginBottom: '3rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                          <Legend groups={Array.from(new Set(problems.map(p => p.group)))} />
                        </div>
                        <ScatterPlot data={sessionAggregates} />
                      </div>

                      {/* Detailed responses */}
                      <div style={{ marginTop: '3rem' }}>
                        <Heading style={{ marginBottom: '1.5rem' }}>
                          Detailed Responses
                        </Heading>
                        <ResponsesTable 
                          submissions={selectedSessionSubmissions} 
                          problems={problems} 
                        />
                      </div>
                    </>
                  ) : (
                    <Tile style={{ padding: '2rem', textAlign: 'center' }}>
                      <p style={{ opacity: 0.7 }}>
                        No responses yet for this session.
                      </p>
                    </Tile>
                  )}
                </div>
            )}
          </div>
        )}

        {/* All Results Tab Content */}
        {activeTab === 'all' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <Heading style={{ marginBottom: '0.5rem' }}>
                All Survey Results
              </Heading>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                Aggregated data from all sessions ({allSubmissions.length} total {allSubmissions.length === 1 ? 'response' : 'responses'})
              </p>
            </div>

            {allSubmissions.length > 0 ? (
              <>
                {/* Aggregated Priority Matrix */}
                <div style={{ marginBottom: '3rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <Legend groups={Array.from(new Set(problems.map(p => p.group)))} />
                  </div>
                  <ScatterPlot data={allAggregates} />
                </div>

                {/* All Responses Table */}
                <div style={{ marginTop: '3rem' }}>
                  <Heading style={{ marginBottom: '1.5rem' }}>
                    All Responses
                  </Heading>
                  <ResponsesTable 
                    submissions={allSubmissions} 
                    problems={problems} 
                  />
                </div>
              </>
            ) : (
              <Tile style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ opacity: 0.7 }}>
                  No responses yet across all sessions.
                </p>
              </Tile>
            )}
          </div>
        )}

        {/* Survey Config Tab Content */}
        {activeTab === 'config' && (
          <SurveyConfigEditor
            currentConfig={currentConfig}
            onConfigSaved={onConfigUpdate}
          />
        )}
      </div>
    </div>
  );
};

