export type ProblemGroup = 
  | 'Query Performance & Tuning'
  | 'Incident Analysis & Resolution'
  | 'Monitoring & Anomaly Detection'
  | 'Maintenance & Operations'
  | 'AI Deployment'
  | 'Db2 Workflows and Interfaces';

export type QuestionType = 'slider' | 'single-choice' | 'multiple-choice' | 'slider-labeled';

export interface Problem {
  id: number;
  title: string;
  group: ProblemGroup;
  questionType?: QuestionType;
  options?: string[];
}

export interface Response {
  problemId: number;
  frequency?: number;
  severity?: number;
  textResponse?: string; // For single/multiple choice answers
}

export interface SurveySubmission {
  id: string;
  responses: Response[];
  notes?: string;
  timestamp: string;
  respondentName?: string;
  respondentEmail?: string;
  sessionId?: string;
}

export * from './session';

export interface AggregatePoint {
  id: number;
  x: number;
  y: number;
  group: ProblemGroup;
  title: string;
}
