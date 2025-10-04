import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SurveySubmission, AggregatePoint, Problem } from '../types';
import { DEFAULT_RATING } from '../constants';
import { calculateAverage, exportToCSV } from '../utils';
import { getAllSubmissions, clearAllData, exportDatabaseToFile, initDatabase } from '../storage/database';
import { LoginPage, ResultsPage } from '../pages';

interface ResultsRouteProps {
  problems: Problem[];
}

const RESULTS_PASSWORD = 'zora2024';

export const ResultsRoute: React.FC<ResultsRouteProps> = ({ problems }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('zora_results_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await initDatabase();
      const data = getAllSubmissions();
      setSubmissions(data);
    };
    loadData();
  }, []);

  const aggregates = useMemo<AggregatePoint[]>(() => {
    if (submissions.length === 0) {
      return problems.map(problem => ({
        id: problem.id,
        x: DEFAULT_RATING,
        y: DEFAULT_RATING,
        group: problem.group,
        title: problem.title,
      }));
    }

    return problems.map(problem => {
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
  }, [submissions, problems]);

  const handleExport = useCallback(() => {
    exportToCSV(submissions);
  }, [submissions]);

  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all saved responses? This cannot be undone.')) {
      clearAllData();
      setSubmissions([]);
    }
  }, []);

  const handleTakeAnother = useCallback(() => {
    navigate('/survey');
  }, [navigate]);

  const handleLogin = useCallback((password: string) => {
    if (password === RESULTS_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('zora_results_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  }, []);

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 48px)', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ padding: '0 2rem' }}>
          <LoginPage onLogin={handleLogin} error={loginError} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 48px)', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ padding: '0 2rem' }}>
        <ResultsPage
          aggregates={aggregates}
          problems={problems}
          submissions={submissions}
          submissionCount={submissions.length}
          onExport={handleExport}
          onExportDatabase={exportDatabaseToFile}
        />

      </div>
    </div>
  );
};

