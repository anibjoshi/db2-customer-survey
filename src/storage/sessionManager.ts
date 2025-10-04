import { SurveySession } from '../types';

const SESSIONS_KEY = 'zora_survey_sessions';
const ACTIVE_SESSION_KEY = 'zora_active_session';

export const sessionManager = {
  // Get all sessions
  getAllSessions(): SurveySession[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  },

  // Save sessions
  saveSessions(sessions: SurveySession[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  },

  // Create new session
  createSession(name: string, description?: string): SurveySession {
    const session: SurveySession = {
      id: `session-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      isActive: true,
      responseCount: 0
    };

    const sessions = this.getAllSessions();
    sessions.push(session);
    this.saveSessions(sessions);

    return session;
  },

  // Set active session
  setActiveSession(sessionId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);

    // Update isActive flag
    const sessions = this.getAllSessions();
    const updated = sessions.map(s => ({
      ...s,
      isActive: s.id === sessionId
    }));
    this.saveSessions(updated);
  },

  // Get active session
  getActiveSession(): SurveySession | null {
    if (typeof window === 'undefined') return null;
    const activeId = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!activeId) return null;

    const sessions = this.getAllSessions();
    return sessions.find(s => s.id === activeId) || null;
  },

  // Get session by ID
  getSessionById(sessionId: string): SurveySession | null {
    const sessions = this.getAllSessions();
    return sessions.find(s => s.id === sessionId) || null;
  },

  // Update session response count
  updateResponseCount(sessionId: string, count: number): void {
    const sessions = this.getAllSessions();
    const updated = sessions.map(s => 
      s.id === sessionId ? { ...s, responseCount: count } : s
    );
    this.saveSessions(updated);
  },

  // End session (set inactive)
  endSession(sessionId: string): void {
    const sessions = this.getAllSessions();
    const updated = sessions.map(s => 
      s.id === sessionId ? { ...s, isActive: false } : s
    );
    this.saveSessions(updated);

    // Clear active if ending active session
    if (localStorage.getItem(ACTIVE_SESSION_KEY) === sessionId) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  },

  // Delete session
  deleteSession(sessionId: string): void {
    const sessions = this.getAllSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    this.saveSessions(filtered);

    // Clear active if deleting active session
    if (localStorage.getItem(ACTIVE_SESSION_KEY) === sessionId) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }
};

