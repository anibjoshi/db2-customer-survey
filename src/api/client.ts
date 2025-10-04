import { SurveySession, SurveySubmission } from '../types';

// In production, API is on same origin. In dev, it's on localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api');

export const api = {
  // ============================================================================
  // SESSIONS
  // ============================================================================
  
  async getAllSessions(): Promise<SurveySession[]> {
    const response = await fetch(`${API_BASE_URL}/sessions`);
    if (!response.ok) throw new Error('Failed to fetch sessions');
    return response.json();
  },

  async createSession(session: Omit<SurveySession, 'responseCount'>): Promise<SurveySession> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: session.id,
        name: session.name,
        description: session.description,
        createdAt: session.createdAt
      })
    });
    if (!response.ok) throw new Error('Failed to create session');
    return response.json();
  },

  async getSession(id: string): Promise<SurveySession> {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`);
    if (!response.ok) throw new Error('Session not found');
    return response.json();
  },

  async updateSession(id: string, updates: { isActive: boolean }): Promise<SurveySession> {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update session');
    return response.json();
  },

  async deleteSession(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete session');
  },

  // ============================================================================
  // SUBMISSIONS
  // ============================================================================

  async submitSurvey(
    submission: SurveySubmission,
    name: string,
    email: string,
    sessionId?: string
  ): Promise<{ success: boolean; id: string }> {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission, name, email, sessionId })
    });
    if (!response.ok) throw new Error('Failed to submit survey');
    return response.json();
  },

  async getAllSubmissions(): Promise<SurveySubmission[]> {
    const response = await fetch(`${API_BASE_URL}/submissions`);
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  },

  async getSessionSubmissions(sessionId: string): Promise<SurveySubmission[]> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/submissions`);
    if (!response.ok) throw new Error('Failed to fetch session submissions');
    return response.json();
  },

  // ============================================================================
  // EXPORT
  // ============================================================================

  async exportDatabase(): Promise<void> {
    window.open(`${API_BASE_URL}/export/database`, '_blank');
  }
};

