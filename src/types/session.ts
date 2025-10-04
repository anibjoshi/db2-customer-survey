export interface SurveySession {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  isActive: boolean;
  responseCount: number;
}

