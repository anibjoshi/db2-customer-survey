import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content,
  Theme,
  Heading
} from '@carbon/react';
import { 
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
import { useSurveyConfig } from './hooks/useSurveyConfig';
import { WelcomePage, SectionPage, FeedbackPage, ResultsPage } from './pages';
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
  }, [submissions, PROBLEMS]);

  const groupedProblems = useMemo(() => {
    const groups = new Map<string, typeof PROBLEMS>();
    PROBLEMS.forEach(problem => {
      const existing = groups.get(problem.group) || [];
      groups.set(problem.group, [...existing, problem]);
    });
    return groups;
  }, [PROBLEMS]);

  const sections = useMemo(() => Array.from(groupedProblems.entries()), [groupedProblems]);
  const totalSections = sections.length;
  const currentSection = sections[currentSectionIndex];

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
        <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 48px)', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ padding: '0 2rem' }}>
              
              {/* WELCOME PAGE */}
              {currentStep === 'welcome' && (
                <WelcomePage
                  config={config}
                  name={name}
                  email={email}
                  totalSections={totalSections}
                  onNameChange={setName}
                  onEmailChange={setEmail}
                  onStartSurvey={handleStartSurvey}
                />
              )}

              {/* SECTION PAGE */}
              {currentStep === 'section' && currentSection && (
                <SectionPage
                  sectionName={currentSection[0]}
                  sectionColor={GROUP_COLORS[currentSection[0] as keyof typeof GROUP_COLORS]}
                  problems={currentSection[1]}
                  responses={responses}
                  currentSectionIndex={currentSectionIndex}
                  totalSections={totalSections}
                  onResponseUpdate={handleResponseUpdate}
                  onPrevious={handlePreviousSection}
                  onNext={handleNextSection}
                />
              )}

              {/* FEEDBACK PAGE */}
              {currentStep === 'feedback' && (
                <FeedbackPage
                  notes={notes}
                  totalSections={totalSections}
                  onNotesChange={setNotes}
                  onPrevious={() => {
                    setCurrentStep('section');
                    setCurrentSectionIndex(totalSections - 1);
                  }}
                  onSubmit={handleSubmitSurvey}
                />
              )}

              {/* RESULTS PAGE */}
              {currentStep === 'results' && (
                <ResultsPage
                  aggregates={aggregates}
                  problems={PROBLEMS}
                  submissionCount={submissions.length}
                  onTakeAnother={() => {
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
                  onExport={handleExport}
                  onClearAll={handleClearAll}
                />
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
          </div>
        </div>
      </Content>
    </Theme>
  );
}
