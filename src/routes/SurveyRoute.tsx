import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Heading } from '@carbon/react';
import { Response, SurveySubmission } from '../types';
import { DEFAULT_RATING } from '../constants';
import { generateId } from '../utils';
import { sessionManager } from '../storage/sessionManager';
import { api } from '../api/client';
import { WelcomePage, SectionPage, FeedbackPage, ThankYouPage } from '../pages';
import { Problem } from '../types';

interface SurveyRouteProps {
  problems: Problem[];
  groupColors: Record<string, string>;
  config: any;
}

type SurveyStep = 'welcome' | 'section' | 'feedback' | 'thankyou';

export const SurveyRoute: React.FC<SurveyRouteProps> = ({ problems, groupColors, config }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [currentStep, setCurrentStep] = useState<SurveyStep>('welcome');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState<Response[]>([]);
  const [notes, setNotes] = useState('');
  const [sessionValid, setSessionValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if session is valid and active
  useEffect(() => {
    const checkSession = async () => {
      if (!sessionId) {
        setSessionValid(false);
        return;
      }

      const session = await sessionManager.getSessionById(sessionId);
      if (!session || !session.isActive) {
        setSessionValid(false);
      }
    };
    
    checkSession();
  }, [sessionId]);

  useEffect(() => {
    if (problems.length > 0) {
      console.log('Initializing responses for', problems.length, 'problems');
      setResponses(
        problems.map(problem => ({
          problemId: problem.id,
          frequency: DEFAULT_RATING,
          severity: DEFAULT_RATING,
        }))
      );
    }
  }, [problems]);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [name]);

  const handleNextSection = useCallback(() => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      setCurrentStep('feedback');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSectionIndex, totalSections]);

  const handlePreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    } else {
      setCurrentStep('welcome');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSectionIndex]);

  const handleSubmitSurvey = useCallback(async () => {
    const submission: SurveySubmission = {
      id: generateId(),
      responses,
      notes: notes.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    // Save to backend database
    setIsSubmitting(true);
    try {
      await api.submitSurvey(submission, name, email, sessionId);
      
      // Show thank you page
      setCurrentStep('thankyou');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to save submission:', error);
      alert('Failed to save your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [responses, notes, name, email, sessionId]);

  // Show error if session is invalid
  if (!sessionValid) {
    return (
      <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 48px)', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ padding: '4rem 2rem' }}>
          <Heading style={{ marginBottom: '1rem' }}>Survey Not Available</Heading>
          <p style={{ opacity: 0.9 }}>
            This survey session has ended or is no longer available.
          </p>
        </div>
      </div>
    );
  }

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
            isSubmitting={isSubmitting}
            onNotesChange={setNotes}
            onPrevious={() => {
              setCurrentStep('section');
              setCurrentSectionIndex(totalSections - 1);
            }}
            onSubmit={handleSubmitSurvey}
          />
        )}

        {currentStep === 'thankyou' && <ThankYouPage />}

      </div>
    </div>
  );
};

