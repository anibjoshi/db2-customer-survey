import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite database
const db = new Database(join(__dirname, 'survey.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    response_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    timestamp TEXT NOT NULL,
    respondent_name TEXT,
    respondent_email TEXT,
    notes TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );

  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id TEXT NOT NULL,
    problem_id INTEGER NOT NULL,
    frequency INTEGER NOT NULL,
    severity INTEGER NOT NULL,
    FOREIGN KEY (submission_id) REFERENCES submissions(id)
  );
`);

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// SESSION ENDPOINTS
// ============================================================================

// Get all sessions
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = db.prepare('SELECT * FROM sessions ORDER BY created_at DESC').all();
    res.json(sessions.map(s => ({
      ...s,
      isActive: s.is_active === 1
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create session
app.post('/api/sessions', (req, res) => {
  try {
    const { id, name, description, createdAt } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO sessions (id, name, description, created_at, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);
    
    stmt.run(id, name, description || null, createdAt);
    
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
    res.json({ ...session, isActive: session.is_active === 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session by ID
app.get('/api/sessions/:id', (req, res) => {
  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ ...session, isActive: session.is_active === 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update session (set active/inactive)
app.patch('/api/sessions/:id', (req, res) => {
  try {
    const { isActive } = req.body;
    
    const stmt = db.prepare('UPDATE sessions SET is_active = ? WHERE id = ?');
    stmt.run(isActive ? 1 : 0, req.params.id);
    
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    res.json({ ...session, isActive: session.is_active === 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete session
app.delete('/api/sessions/:id', (req, res) => {
  try {
    // Delete associated responses first
    const submissions = db.prepare('SELECT id FROM submissions WHERE session_id = ?').all(req.params.id);
    const deleteResponses = db.prepare('DELETE FROM responses WHERE submission_id = ?');
    submissions.forEach(sub => deleteResponses.run(sub.id));
    
    // Delete submissions
    db.prepare('DELETE FROM submissions WHERE session_id = ?').run(req.params.id);
    
    // Delete session
    db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// SUBMISSION ENDPOINTS
// ============================================================================

// Submit survey response
app.post('/api/submissions', (req, res) => {
  try {
    const { submission, name, email, sessionId } = req.body;
    
    // Insert submission
    const submissionStmt = db.prepare(`
      INSERT INTO submissions (id, session_id, timestamp, respondent_name, respondent_email, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    submissionStmt.run(
      submission.id,
      sessionId || null,
      submission.timestamp,
      name,
      email || null,
      submission.notes || null
    );
    
    // Insert responses
    const responseStmt = db.prepare(`
      INSERT INTO responses (submission_id, problem_id, frequency, severity)
      VALUES (?, ?, ?, ?)
    `);
    
    submission.responses.forEach(response => {
      responseStmt.run(
        submission.id,
        response.problemId,
        response.frequency,
        response.severity
      );
    });
    
    // Update session response count
    if (sessionId) {
      const count = db.prepare('SELECT COUNT(*) as count FROM submissions WHERE session_id = ?').get(sessionId);
      db.prepare('UPDATE sessions SET response_count = ? WHERE id = ?').run(count.count, sessionId);
    }
    
    res.json({ success: true, id: submission.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all submissions
app.get('/api/submissions', (req, res) => {
  try {
    const submissions = db.prepare('SELECT * FROM submissions ORDER BY timestamp DESC').all();
    
    const result = submissions.map(sub => {
      const responses = db.prepare('SELECT problem_id, frequency, severity FROM responses WHERE submission_id = ?').all(sub.id);
      
      return {
        id: sub.id,
        timestamp: sub.timestamp,
        respondentName: sub.respondent_name,
        respondentEmail: sub.respondent_email,
        notes: sub.notes,
        sessionId: sub.session_id,
        responses: responses.map(r => ({
          problemId: r.problem_id,
          frequency: r.frequency,
          severity: r.severity
        }))
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get submissions by session
app.get('/api/sessions/:id/submissions', (req, res) => {
  try {
    const submissions = db.prepare('SELECT * FROM submissions WHERE session_id = ? ORDER BY timestamp DESC').all(req.params.id);
    
    const result = submissions.map(sub => {
      const responses = db.prepare('SELECT problem_id, frequency, severity FROM responses WHERE submission_id = ?').all(sub.id);
      
      return {
        id: sub.id,
        timestamp: sub.timestamp,
        respondentName: sub.respondent_name,
        respondentEmail: sub.respondent_email,
        notes: sub.notes,
        sessionId: sub.session_id,
        responses: responses.map(r => ({
          problemId: r.problem_id,
          frequency: r.frequency,
          severity: r.severity
        }))
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// EXPORT ENDPOINTS
// ============================================================================

// Export database
app.get('/api/export/database', (req, res) => {
  try {
    res.download(join(__dirname, 'survey.db'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Survey server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${join(__dirname, 'survey.db')}`);
});

