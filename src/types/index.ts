export type ProblemGroup = 
  | 'Query Performance & Tuning'
  | 'Incident Analysis & Resolution'
  | 'Monitoring & Anomaly Detection'
  | 'Maintenance & Operations';

export interface Problem {
  id: number;
  title: string;
  group: ProblemGroup;
}

export interface Response {
  problemId: number;
  frequency: number;
  severity: number;
}

export interface SurveySubmission {
  id: string;
  responses: Response[];
  notes?: string;
  timestamp: string;
  respondentName?: string;
  respondentEmail?: string;
}

export interface AggregatePoint {
  id: number;
  x: number;
  y: number;
  group: ProblemGroup;
  title: string;
}
