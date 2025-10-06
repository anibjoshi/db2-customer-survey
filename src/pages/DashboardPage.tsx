import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  TableCell,
  SkeletonText,
  DataTable,
  TableContainer
} from '@carbon/react';
import { Add, Launch, TrashCan, Checkmark, StopFilled, View, Download } from '@carbon/icons-react';
import { SurveySession, SurveySubmission, Problem, AggregatePoint } from '../types';
import { sessionManager } from '../storage/sessionManager';
import { api } from '../api/client';
import { ResponsesTable, ScatterPlot, Legend, ConfigEditor, AISummary, ChoiceResultsChart } from '../components';
import { calculateAverage } from '../utils';
import { DEFAULT_RATING } from '../constants';
import { SurveyConfig } from '../hooks/useSurveyConfig';
import { exportToCSV } from '../utils/csvExport';

interface DashboardPageProps {
  problems: Problem[];
  currentConfig: SurveyConfig | null;
  onLaunchSurvey: (sessionId: string) => void;
  onConfigUpdate: () => void;
  onReloadConfig?: () => void;
}

type MainTab = 'sessions' | 'results' | 'all' | 'config';
type SubTab = 'analysis' | 'table' | 'details';

// Reusable tab button styles
const getTabButtonStyle = (isActive: boolean, isDisabled = false) => ({
  padding: '0.75rem 1.5rem',
  backgroundColor: isActive ? '#0f62fe' : 'transparent',
  color: isActive ? 'white' : '#f4f4f4',
  border: 'none',
  borderBottom: isActive ? '2px solid #0f62fe' : 'none',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  fontSize: '0.875rem',
  fontWeight: '600',
  opacity: isDisabled ? 0.4 : 1
});

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  problems,
  onLaunchSurvey,
  onReloadConfig
}) => {
  const [sessions, setSessions] = useState<SurveySession[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDesc, setNewSessionDesc] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessionSubmissions, setSelectedSessionSubmissions] = useState<SurveySubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<SurveySubmission[]>([]);
  const [activeTab, setActiveTab] = useState<MainTab>('sessions');
  const [resultsSubTab, setResultsSubTab] = useState<SubTab>('analysis');
  const [allResultsSubTab, setAllResultsSubTab] = useState<SubTab>('analysis');
  const [loadingResults, setLoadingResults] = useState(false);

  const loadSessions = useCallback(async () => {
    const sessions = await sessionManager.getAllSessions();
    setSessions(sessions);
  }, []);

  const loadAllSubmissions = useCallback(async () => {
    const submissions = await api.getAllSubmissions();
    setAllSubmissions(submissions);
  }, []);

  useEffect(() => {
    loadSessions();
    loadAllSubmissions();
  }, [loadSessions, loadAllSubmissions]);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;
    await sessionManager.createSession(newSessionName.trim(), newSessionDesc.trim() || undefined);
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
      try {
        await sessionManager.endSession(sessionId);
        await loadSessions();
      } catch (err) {
        console.error('Error ending session:', err);
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session? The session data will be preserved but hidden.')) {
      try {
        await sessionManager.deleteSession(sessionId);
        await loadSessions();
        if (activeTab === 'all') {
          await loadAllSubmissions();
        }
      } catch (err) {
        console.error('Error deleting session:', err);
      }
    }
  };

  const handleViewSessionResults = useCallback(async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActiveTab('results');
    setLoadingResults(true);
    
    try {
      const submissions = await api.getSessionSubmissions(sessionId);
      setSelectedSessionSubmissions(submissions);
    } catch (error) {
      console.error('Error loading session results:', error);
    } finally {
      setLoadingResults(false);
    }
  }, []);

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  // Calculate aggregates for slider questions
  const calculateAggregates = useCallback((submissions: SurveySubmission[]): AggregatePoint[] => {
    const sliderProblems = problems.filter(p => p.questionType === 'slider' || !p.questionType);
    
    if (submissions.length === 0) {
      return sliderProblems.map(problem => ({
        id: problem.id,
        x: DEFAULT_RATING,
        y: DEFAULT_RATING,
        group: problem.group,
        title: problem.title,
      }));
    }

    return sliderProblems.map(problem => {
      const problemResponses = submissions.flatMap(submission =>
        submission.responses.filter(response => response.problemId === problem.id)
      );

      const frequencies = problemResponses.map(r => r.frequency).filter((f): f is number => f !== undefined);
      const severities = problemResponses.map(r => r.severity).filter((s): s is number => s !== undefined);

      return {
        id: problem.id,
        x: frequencies.length > 0 ? calculateAverage(frequencies) : DEFAULT_RATING,
        y: severities.length > 0 ? calculateAverage(severities) : DEFAULT_RATING,
        group: problem.group,
        title: problem.title,
      };
    });
  }, [problems]);

  const sessionAggregates = useMemo(
    () => calculateAggregates(selectedSessionSubmissions),
    [selectedSessionSubmissions, calculateAggregates]
  );

  const allAggregates = useMemo(
    () => calculateAggregates(allSubmissions),
    [allSubmissions, calculateAggregates]
  );

  // Render priority matrix table with sorting
  const renderPriorityTable = (aggregates: AggregatePoint[]) => (
    <div>
      <Heading style={{ marginBottom: '1.5rem' }}>
        Priority Matrix - Table View
      </Heading>
      <DataTable
        rows={aggregates.map((point, index) => ({
          id: String(index),
          question: point.title,
          section: point.group,
          frequency: point.x.toFixed(1),
          severity: point.y.toFixed(1),
          priorityScore: (point.x * point.y).toFixed(1)
        }))}
        headers={[
          { key: 'question', header: 'Question' },
          { key: 'section', header: 'Section' },
          { key: 'frequency', header: 'Frequency' },
          { key: 'severity', header: 'Severity' },
          { key: 'priorityScore', header: 'Priority Score' }
        ]}
        isSortable
      >
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer style={{ 
            backgroundColor: '#262626',
            border: '1px solid #393939',
            borderRadius: '4px'
          }}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key} isSortable>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );

  // Render sub-tabs for results sections
  const renderSubTabs = (
    currentSubTab: SubTab,
    setSubTab: (tab: SubTab) => void
  ) => (
    <div style={{ 
      borderBottom: '1px solid #393939',
      marginBottom: '2rem',
      display: 'flex',
      gap: '0'
    }}>
      <button onClick={() => setSubTab('analysis')} style={getTabButtonStyle(currentSubTab === 'analysis')}>
        Survey Analysis
      </button>
      <button onClick={() => setSubTab('table')} style={getTabButtonStyle(currentSubTab === 'table')}>
        Priority Table
      </button>
      <button onClick={() => setSubTab('details')} style={getTabButtonStyle(currentSubTab === 'details')}>
        Detailed Responses
      </button>
    </div>
  );

  // Render analysis content (priority matrix + charts)
  const renderAnalysis = (aggregates: AggregatePoint[], submissions: SurveySubmission[]) => (
    <>
      <div style={{ marginBottom: '3rem' }}>
        <Heading style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
          Priority Matrix
        </Heading>
        <div style={{ marginBottom: '1rem' }}>
          <Legend groups={Array.from(new Set(problems.filter(p => p.questionType === 'slider' || !p.questionType).map(p => p.group)))} />
        </div>
        <ScatterPlot data={aggregates} />
      </div>
      <ChoiceResultsChart problems={problems} submissions={submissions} />
    </>
  );

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

        {/* Main Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          borderBottom: '2px solid #393939',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => { setActiveTab('sessions'); loadSessions(); }}
            style={getTabButtonStyle(activeTab === 'sessions')}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!selectedSessionId}
            style={getTabButtonStyle(activeTab === 'results', !selectedSessionId)}
          >
            Session Results {selectedSession ? `- ${selectedSession.name}` : ''}
          </button>
          <button
            onClick={() => { setActiveTab('all'); loadAllSubmissions(); }}
            style={getTabButtonStyle(activeTab === 'all')}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveTab('config')}
            style={getTabButtonStyle(activeTab === 'config')}
          >
            Survey Questions
          </button>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div>
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
                  <Button onClick={handleCreateSession} kind="primary" disabled={!newSessionName.trim()}>
                    Create Session
                  </Button>
                  <Button onClick={() => { setShowCreateForm(false); setNewSessionName(''); setNewSessionDesc(''); }} kind="secondary">
                    Cancel
                  </Button>
                </div>
              </Tile>
            ) : (
              <div style={{ marginBottom: '2rem' }}>
                <Button onClick={() => setShowCreateForm(true)} kind="primary" renderIcon={Add}>
                  Create New Session
                </Button>
              </div>
            )}

            {sessions.length > 0 ? (
              <div style={{ backgroundColor: '#262626', border: '1px solid #393939', borderRadius: '4px', overflow: 'hidden' }}>
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
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#24a148' }}>
                              <Checkmark size={16} /> Active
                            </span>
                          ) : (
                            <span style={{ opacity: 0.5 }}>Ended</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {session.isActive && (
                              <>
                                <Button size="sm" kind="primary" renderIcon={Launch} onClick={() => handleLaunchSession(session.id)}>
                                  Launch
                                </Button>
                                <Button size="sm" kind="tertiary" renderIcon={StopFilled} onClick={() => handleEndSession(session.id)}>
                                  End
                                </Button>
                              </>
                            )}
                            <Button size="sm" kind="ghost" renderIcon={View} onClick={() => handleViewSessionResults(session.id)}>
                              View
                            </Button>
                            <Button size="sm" kind="ghost" renderIcon={TrashCan} onClick={() => handleDeleteSession(session.id)} hasIconOnly iconDescription="Delete" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Tile style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ opacity: 0.7 }}>No sessions created yet. Create your first session to get started.</p>
              </Tile>
            )}
          </div>
        )}

        {/* Session Results Tab */}
        {activeTab === 'results' && selectedSession && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <Heading style={{ marginBottom: '0.5rem' }}>{selectedSession.name}</Heading>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>{selectedSession.description || 'No description provided'}</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.5rem' }}>
                Created: {new Date(selectedSession.createdAt).toLocaleDateString()} • 
                {selectedSessionSubmissions.length} {selectedSessionSubmissions.length === 1 ? 'response' : 'responses'} •
                Status: {selectedSession.isActive ? 'Active' : 'Ended'}
              </p>
            </div>

            {loadingResults ? (
              <Tile style={{ padding: '2rem' }}><SkeletonText paragraph lineCount={5} /></Tile>
            ) : selectedSessionSubmissions.length > 0 ? (
              <>
                <AISummary submissions={selectedSessionSubmissions} sessionId={selectedSessionId || undefined} />
                {renderSubTabs(resultsSubTab, setResultsSubTab)}
                
                {resultsSubTab === 'analysis' && renderAnalysis(sessionAggregates, selectedSessionSubmissions)}
                {resultsSubTab === 'table' && renderPriorityTable(sessionAggregates)}
                {resultsSubTab === 'details' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <Heading style={{ marginBottom: 0 }}>Detailed Responses</Heading>
                      <Button onClick={() => exportToCSV(selectedSessionSubmissions)} disabled={selectedSessionSubmissions.length === 0} kind="primary" renderIcon={Download}>
                        Download CSV
                      </Button>
                    </div>
                    <ResponsesTable submissions={selectedSessionSubmissions} problems={problems} />
                  </div>
                )}
              </>
            ) : (
              <Tile style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ opacity: 0.7 }}>No responses yet for this session.</p>
              </Tile>
            )}
          </div>
        )}

        {/* All Results Tab */}
        {activeTab === 'all' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <Heading style={{ marginBottom: '0.5rem' }}>All Survey Results</Heading>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                Aggregated data from all sessions ({allSubmissions.length} total {allSubmissions.length === 1 ? 'response' : 'responses'})
              </p>
            </div>

            {allSubmissions.length > 0 ? (
              <>
                <AISummary submissions={allSubmissions} />
                {renderSubTabs(allResultsSubTab, setAllResultsSubTab)}
                
                {allResultsSubTab === 'analysis' && renderAnalysis(allAggregates, allSubmissions)}
                {allResultsSubTab === 'table' && renderPriorityTable(allAggregates)}
                {allResultsSubTab === 'details' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <Heading style={{ marginBottom: 0 }}>All Responses</Heading>
                      <Button onClick={() => exportToCSV(allSubmissions)} disabled={allSubmissions.length === 0} kind="primary" renderIcon={Download}>
                        Download CSV
                      </Button>
                    </div>
                    <ResponsesTable submissions={allSubmissions} problems={problems} />
                  </div>
                )}
              </>
            ) : (
              <Tile style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ opacity: 0.7 }}>No responses yet across all sessions.</p>
              </Tile>
            )}
          </div>
        )}

        {/* Survey Config Tab */}
        {activeTab === 'config' && <ConfigEditor />}
      </div>
    </div>
  );
};
