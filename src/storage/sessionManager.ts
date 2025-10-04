import { SurveySession } from '../types';
import { api } from '../api/client';

const ACTIVE_SESSION_KEY = 'zora_active_session';

export const sessionManager = {
  // Get all sessions
  async getAllSessions(): Promise<SurveySession[]> {
    try {
      return await api.getAllSessions();
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  },

  // Create new session
  async createSession(name: string, description?: string): Promise<SurveySession> {
    const session: SurveySession = {
      id: `session-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      isActive: true,
      responseCount: 0
    };

    return await api.createSession(session);
  },

  // Set active session
  setActiveSession(sessionId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  },

  // Get active session
  getActiveSession(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  },

  // Get session by ID
  async getSessionById(sessionId: string): Promise<SurveySession | null> {
    try {
      return await api.getSession(sessionId);
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  },

  // End session (set inactive)
  async endSession(sessionId: string): Promise<void> {
    await api.updateSession(sessionId, { isActive: false });
    
    // Clear active if ending active session
    if (localStorage.getItem(ACTIVE_SESSION_KEY) === sessionId) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  },

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    await api.deleteSession(sessionId);
    
    // Clear active if deleting active session
    if (localStorage.getItem(ACTIVE_SESSION_KEY) === sessionId) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }
};

