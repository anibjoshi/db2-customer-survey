import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Response, SurveySubmission } from '../types';
import { DEFAULT_RATING } from '../constants';
import { generateId } from '../utils';
import { saveSubmission, initDatabase } from '../storage/database';
import { WelcomePage, SectionPage, FeedbackPage, ThankYouPage } from '../pages';
import { Problem } from '../types';

interface SurveyRouteProps {
  problems: Problem[];
  groupColors: Record<string, string>;
  config: any;
}

type SurveyStep = 'welcome' | 'section' | 'feedback' | 'thankyou';

export const SurveyRoute: React.FC<SurveyRouteProps> = ({ problems, groupColors, config }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SurveyStep>('welcome');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState<Response[]>([]);
  const [notes, setNotes] = useState('');

  // Initialize database and responses
  useEffect(() => {
    initDatabase().catch(err => console.error('Failed to initialize database:', err));
  }, []);

  useEffect(() => {
    if (problems.length > 0 && responses.length === 0) {
      setResponses(
        problems.map(problem => ({
          problemId: problem.id,
          frequency: DEFAULT_RATING,
          severity: DEFAULT_RATING,
        }))
      );
    }
  }, [problems, responses.length]);

  // Group problems by category
  const groupedProblems = problems.reduce((acc, problem) => {
    if (!acc[problem.group]) {
      acc[problem.group] = [];
    }
    acc[problem.group].push(problem);
    return acc;
  }, {} as Record<string, Problem[]>);

  const sections = Object.entries(groupedProblems);
  const totalSections = sections.length;
  const currentSection = sections[currentSectionIndex];

  const handleResponseUpdate = useCallback((problemId: number, updated: Response) => {
    setResponses(prev =>
      prev.map(response =>
        response.problemId === problemId ? updated : response
      )
    );
  }, []);

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

    // Save to SQLite database
    try {
      saveSubmission(submission, name, email);
      // Show thank you page
      setCurrentStep('thankyou');
    } catch (error) {
      console.error('Failed to save submission:', error);
      alert('Failed to save your response. Please try again.');
    }
  }, [responses, notes, name, email]);

  return (
    <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 48px)', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ padding: '0 2rem' }}>
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

        {currentStep === 'section' && currentSection && (
          <SectionPage
            sectionName={currentSection[0]}
            sectionColor={groupColors[currentSection[0]]}
            problems={currentSection[1]}
            responses={responses}
            currentSectionIndex={currentSectionIndex}
            totalSections={totalSections}
            onResponseUpdate={handleResponseUpdate}
            onPrevious={handlePreviousSection}
            onNext={handleNextSection}
          />
        )}

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

        {currentStep === 'thankyou' && <ThankYouPage />}

        {/* Footer */}
        {currentStep !== 'welcome' && currentStep !== 'thankyou' && (
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
  );
};

