import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Grid, 
  Column, 
  Button, 
  TextArea, 
  TextInput,
  Tile, 
  InlineNotification,
  Section,
  Heading,
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content,
  Theme
} from '@carbon/react';
import { 
  Download, 
  TrashCan, 
  Reset, 
  UserAvatar, 
  Notification,
  Dashboard,
  ChartScatter,
  Document
} from '@carbon/icons-react';
import { Response, SurveySubmission, AggregatePoint } from './types';
import { DEFAULT_RATING } from './constants';
import { calculateAverage, generateId, exportToCSV } from './utils';
import { storage } from './storage';
import { ProblemCard, ScatterPlot, Legend } from './components';
import { useSurveyConfig } from './hooks/useSurveyConfig';
import './App.css';

type SurveyStep = 'welcome' | 'section' | 'feedback' | 'results';

export default function App() {
  const { config, problems: PROBLEMS, groupColors: GROUP_COLORS, loading, error } = useSurveyConfig();
  
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState<SurveyStep>('welcome');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState<Response[]>([]);
  const [notes, setNotes] = useState('');
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize responses when problems are loaded
  useEffect(() => {
    if (PROBLEMS.length > 0 && responses.length === 0) {
      setResponses(
        PROBLEMS.map(problem => ({
          problemId: problem.id,
          frequency: DEFAULT_RATING,
          severity: DEFAULT_RATING,
        }))
      );
    }
  }, [PROBLEMS, responses.length]);

  useEffect(() => {
    setSubmissions(storage.load());
  }, []);

  const handleResponseUpdate = useCallback((problemId: number, updated: Response) => {
    setResponses(prev =>
      prev.map(response =>
        response.problemId === problemId ? updated : response
      )
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const submission: SurveySubmission = {
      id: generateId(),
      responses,
      notes: notes.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    const updated = [...submissions, submission];
    setSubmissions(updated);
    storage.save(updated);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [responses, notes, submissions]);

  const handleReset = useCallback(() => {
    setResponses(
      PROBLEMS.map(problem => ({
        problemId: problem.id,
        frequency: DEFAULT_RATING,
        severity: DEFAULT_RATING,
      }))
    );
    setNotes('');
    setName('');
    setEmail('');
  }, []);

  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all saved responses? This cannot be undone.')) {
      setSubmissions([]);
      storage.clear();
    }
  }, []);

  const handleExport = useCallback(() => {
    exportToCSV(submissions);
  }, [submissions]);

  const aggregates = useMemo<AggregatePoint[]>(() => {
    if (submissions.length === 0) {
      return PROBLEMS.map(problem => ({
        id: problem.id,
        x: DEFAULT_RATING,
        y: DEFAULT_RATING,
        group: problem.group,
        title: problem.title,
      }));
    }

    return PROBLEMS.map(problem => {
      const problemResponses = submissions.flatMap(submission =>
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
  }, [submissions]);

  const groupedProblems = useMemo(() => {
    const groups = new Map<string, typeof PROBLEMS>();
    PROBLEMS.forEach(problem => {
      const existing = groups.get(problem.group) || [];
      groups.set(problem.group, [...existing, problem]);
    });
    return groups;
  }, []);

  const sections = useMemo(() => Array.from(groupedProblems.entries()), [groupedProblems]);
  const totalSections = sections.length;
  const currentSection = sections[currentSectionIndex];

  // Show loading state
  if (loading) {
    return (
      <Theme theme="g90">
        <Header aria-label="Zora Survey">
          <HeaderName href="#" prefix="IBM">
            Zora Survey
          </HeaderName>
        </Header>
        <Content id="main-content">
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Heading>Loading survey...</Heading>
          </div>
        </Content>
      </Theme>
    );
  }

  // Show error state
  if (error) {
    return (
      <Theme theme="g90">
        <Header aria-label="Zora Survey">
          <HeaderName href="#" prefix="IBM">
            Zora Survey
          </HeaderName>
        </Header>
        <Content id="main-content">
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Heading>Error loading survey</Heading>
            <p style={{ marginTop: '1rem' }}>{error}</p>
          </div>
        </Content>
      </Theme>
    );
  }

  const handleStartSurvey = useCallback(() => {
    if (name.trim()) {
      setCurrentStep('section');
      setCurrentSectionIndex(0);
    }
  }, [name]);

  const handleNextSection = useCallback(() => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      setCurrentStep('feedback');
    }
  }, [currentSectionIndex, totalSections]);

  const handlePreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    } else {
      setCurrentStep('welcome');
    }
  }, [currentSectionIndex]);

  const handleSubmitSurvey = useCallback(() => {
    const submission: SurveySubmission = {
      id: generateId(),
      responses,
      notes: notes.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    const updated = [...submissions, submission];
    setSubmissions(updated);
    storage.save(updated);

    setCurrentStep('results');
  }, [responses, notes, submissions]);

  return (
    <Theme theme="g90">
      <Header aria-label="Zora Survey">
        <HeaderName href="#" prefix="IBM">
          Zora Survey
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Notifications" tooltipAlignment="end">
            <Notification size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="User Avatar" tooltipAlignment="end">
            <UserAvatar size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <SideNav
        aria-label="Side navigation"
        expanded={isSideNavExpanded}
        onSideNavBlur={() => {}}
        href="#main-content"
        isFixedNav
        isChildOfHeader={false}
      >
        <SideNavItems>
          {sections.map(([group], index) => (
            <SideNavLink
              key={group}
              renderIcon={Dashboard}
              isActive={currentStep === 'section' && currentSectionIndex === index}
              aria-current={currentStep === 'section' && currentSectionIndex === index ? 'page' : undefined}
            >
              {group}
            </SideNavLink>
          ))}
          <SideNavLink 
            renderIcon={Document}
            isActive={currentStep === 'feedback'}
            aria-current={currentStep === 'feedback' ? 'page' : undefined}
          >
            Additional Feedback
          </SideNavLink>
          <SideNavLink 
            renderIcon={ChartScatter}
            isActive={currentStep === 'results'}
            aria-current={currentStep === 'results' ? 'page' : undefined}
          >
            Results
          </SideNavLink>
        </SideNavItems>
      </SideNav>

      <Content id="main-content">
        <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 48px)' }}>
          <Grid>
            <Column lg={16} md={8} sm={4}>
              
              {/* WELCOME PAGE */}
              {currentStep === 'welcome' && (
                <div style={{ 
                  maxWidth: '600px', 
                  margin: '4rem auto', 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Heading style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>
                    {config?.title || 'Survey'}
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
                    minHeight: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      marginBottom: '2.5rem' 
                    }}>
                      <img 
                        src="/image.png" 
                        alt="Zora Survey" 
                        style={{ 
                          maxWidth: '500px', 
                          height: 'auto',
                          objectFit: 'contain'
                        }} 
                      />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <TextInput
                        id="name-input"
                        labelText="Full Name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <TextInput
                        id="email-input"
                        labelText="Email Address (Optional)"
                        placeholder="your.email@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                    onClick={handleStartSurvey}
                    kind="primary"
                    size="lg"
                    disabled={!name.trim()}
                    style={{ minWidth: '200px' }}
                  >
                    Start Survey
                  </Button>
                </div>
              )}

              {/* SECTION PAGE */}
              {currentStep === 'section' && currentSection && (
                <div>
                  {/* Progress indicator */}
                  <div style={{ marginBottom: '3rem' }}>
                    <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                      Section {currentSectionIndex + 1} of {totalSections}
                    </p>
                    <div style={{ 
                      width: '100%', 
                      height: '4px', 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${((currentSectionIndex + 1) / totalSections) * 100}%`,
                        height: '100%',
                        backgroundColor: '#0f62fe',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '3rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div 
                        style={{ 
                          width: '4px', 
                          height: '32px', 
                          backgroundColor: GROUP_COLORS[currentSection[0] as keyof typeof GROUP_COLORS],
                          borderRadius: '2px'
                        }}
                      />
                      <Heading style={{ margin: 0 }}>
                        {currentSection[0]}
                      </Heading>
                    </div>
                    <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.5' }}>
                      Rate each problem based on how frequently it occurs and how severe the impact is.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                    {currentSection[1].map(problem => {
                      const response = responses.find(r => r.problemId === problem.id)!;
                      return (
                        <ProblemCard
                          key={problem.id}
                          problem={problem}
                          response={response}
                          onUpdate={handleResponseUpdate}
                        />
                      );
                    })}
                  </div>

                  {/* Navigation buttons */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '2rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <Button
                      onClick={handlePreviousSection}
                      kind="secondary"
                      size="lg"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={handleNextSection}
                      kind="primary"
                      size="lg"
                    >
                      {currentSectionIndex < totalSections - 1 ? 'Next Section' : 'Continue'}
                    </Button>
                  </div>
                </div>
              )}

              {/* FEEDBACK PAGE */}
              {currentStep === 'feedback' && (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '3rem' }}>
                    <Heading style={{ marginBottom: '1rem' }}>
                      Additional Feedback
                    </Heading>
                    <p style={{ 
                      fontSize: '1rem',
                      marginBottom: '2rem',
                      opacity: 0.9,
                      lineHeight: '1.5'
                    }}>
                      Are there other major pain points we haven't captured? Share any additional context that might help us understand your needs better.
                    </p>
                    <TextArea
                      id="notes-textarea"
                      labelText="Your feedback (optional)"
                      placeholder="Share any missing problems, additional context, or specific scenarios..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '2rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <Button
                      onClick={() => {
                        setCurrentStep('section');
                        setCurrentSectionIndex(totalSections - 1);
                      }}
                      kind="secondary"
                      size="lg"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={handleSubmitSurvey}
                      kind="primary"
                      size="lg"
                    >
                      Submit Survey
                    </Button>
                  </div>
                </div>
              )}

              {/* RESULTS PAGE */}
              {currentStep === 'results' && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <Heading style={{ marginBottom: '1rem', fontSize: '2rem' }}>
                      Thank You!
                    </Heading>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                      Your response has been saved. Here's how all submissions stack up:
                    </p>
                  </div>

                  <Section level={3} style={{ marginBottom: '4rem' }}>
                    <div style={{ marginBottom: '3rem' }}>
                      <Heading style={{ marginBottom: '0.5rem' }}>
                        Priority Matrix
                      </Heading>
                      <p style={{ 
                        fontSize: '0.875rem',
                        opacity: 0.9,
                        marginBottom: '2rem'
                      }}>
                        Average severity and frequency across {submissions.length} {submissions.length === 1 ? 'response' : 'responses'}
                      </p>
                      <Legend groups={Array.from(new Set(PROBLEMS.map(p => p.group)))} />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                      <ScatterPlot data={aggregates} />
                    </div>

                    <InlineNotification
                      kind="info"
                      lowContrast
                      hideCloseButton
                      title="Pro Tip"
                      subtitle="Problems in the upper-right quadrant (Critical Priority) should be addressed first. Share this survey with more team members to get better insights."
                      style={{ maxWidth: '100%' }}
                    />
                  </Section>

                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem',
                    justifyContent: 'center',
                    paddingTop: '2rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <Button
                      onClick={() => {
                        setCurrentStep('welcome');
                        setCurrentSectionIndex(0);
                        setResponses(
                          PROBLEMS.map(problem => ({
                            problemId: problem.id,
                            frequency: DEFAULT_RATING,
                            severity: DEFAULT_RATING,
                          }))
                        );
                        setNotes('');
                        setName('');
                        setEmail('');
                      }}
                      kind="primary"
                      size="lg"
                    >
                      Take Another Survey
                    </Button>
                    <Button
                      onClick={handleExport}
                      disabled={submissions.length === 0}
                      kind="secondary"
                      renderIcon={Download}
                      size="lg"
                    >
                      Export Data (CSV)
                    </Button>
                    <Button
                      onClick={handleClearAll}
                      disabled={submissions.length === 0}
                      kind="danger--tertiary"
                      renderIcon={TrashCan}
                      size="lg"
                    >
                      Clear All Data
                    </Button>
                  </div>
                </div>
              )}

              {/* Footer */}
              {currentStep !== 'welcome' && (
                <footer style={{ 
                  marginTop: '6rem', 
                  paddingTop: '2rem', 
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    fontSize: '0.75rem',
                    margin: 0,
                    opacity: 0.6
                  }}>
                    Zora Survey Tool • Data stored locally in your browser • No server required
                  </p>
                </footer>
              )}
            </Column>
          </Grid>
        </div>
      </Content>
    </Theme>
  );
}
