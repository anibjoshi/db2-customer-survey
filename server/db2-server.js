import express from 'express';
import cors from 'cors';
import ibmdb from 'ibm_db';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Db2 connection string
// Format: DATABASE=dbname;HOSTNAME=host;PORT=50000;PROTOCOL=TCPIP;UID=username;PWD=password;
const DB2_CONN_STRING = process.env.DB2_CONN_STRING;

if (!DB2_CONN_STRING) {
  console.error('ERROR: DB2_CONN_STRING environment variable not set');
  console.error('Example: DATABASE=SAMPLE;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP;UID=db2inst1;PWD=password;');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to execute queries
const executeQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    ibmdb.open(DB2_CONN_STRING, (err, conn) => {
      if (err) {
        console.error('Connection error:', err);
        return reject(err);
      }

      conn.query(sql, params, (err, result) => {
        conn.close(() => {});
        
        if (err) {
          console.error('Query error:', err);
          return reject(err);
        }
        
        resolve(result);
      });
    });
  });
};

// ============================================================================
// SESSION ENDPOINTS
// ============================================================================

// Get all sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await executeQuery('SELECT * FROM SURVEYS.SESSIONS ORDER BY CREATED_AT DESC');
    res.json(sessions.map(s => ({
      id: s.ID,
      name: s.NAME,
      description: s.DESCRIPTION,
      createdAt: s.CREATED_AT,
      isActive: s.IS_ACTIVE === 1,
      responseCount: s.RESPONSE_COUNT
    })));
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create session
app.post('/api/sessions', async (req, res) => {
  try {
    const { id, name, description, createdAt } = req.body;
    
    // Convert ISO string to Db2 timestamp format
    const timestamp = new Date(createdAt).toISOString().replace('T', ' ').substring(0, 19);
    
    await executeQuery(`
      INSERT INTO SURVEYS.SESSIONS (ID, NAME, DESCRIPTION, CREATED_AT, IS_ACTIVE, RESPONSE_COUNT)
      VALUES (?, ?, ?, CAST(? AS TIMESTAMP), 1, 0)
    `, [id, name, description || null, timestamp]);
    
    const sessions = await executeQuery('SELECT * FROM SURVEYS.SESSIONS WHERE ID = ?', [id]);
    const session = sessions[0];
    
    res.json({
      id: session.ID,
      name: session.NAME,
      description: session.DESCRIPTION,
      createdAt: session.CREATED_AT,
      isActive: session.IS_ACTIVE === 1,
      responseCount: session.RESPONSE_COUNT
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session by ID
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const sessions = await executeQuery('SELECT * FROM SURVEYS.SESSIONS WHERE ID = ?', [req.params.id]);
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessions[0];
    res.json({
      id: session.ID,
      name: session.NAME,
      description: session.DESCRIPTION,
      createdAt: session.CREATED_AT,
      isActive: session.IS_ACTIVE === 1,
      responseCount: session.RESPONSE_COUNT
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update session
app.patch('/api/sessions/:id', async (req, res) => {
  try {
    const { isActive } = req.body;
    
    await executeQuery(
      'UPDATE SURVEYS.SESSIONS SET IS_ACTIVE = ? WHERE ID = ?',
      [isActive ? 1 : 0, req.params.id]
    );
    
    const sessions = await executeQuery('SELECT * FROM SURVEYS.SESSIONS WHERE ID = ?', [req.params.id]);
    const session = sessions[0];
    
    res.json({
      id: session.ID,
      name: session.NAME,
      description: session.DESCRIPTION,
      createdAt: session.CREATED_AT,
      isActive: session.IS_ACTIVE === 1,
      responseCount: session.RESPONSE_COUNT
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete session
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    // Delete associated responses first
    await executeQuery(`
      DELETE FROM SURVEYS.RESPONSES 
      WHERE SUBMISSION_ID IN (
        SELECT ID FROM SURVEYS.SUBMISSIONS WHERE SESSION_ID = ?
      )
    `, [req.params.id]);
    
    // Delete submissions
    await executeQuery('DELETE FROM SURVEYS.SUBMISSIONS WHERE SESSION_ID = ?', [req.params.id]);
    
    // Delete session
    await executeQuery('DELETE FROM SURVEYS.SESSIONS WHERE ID = ?', [req.params.id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// SUBMISSION ENDPOINTS
// ============================================================================

// Submit survey response
app.post('/api/submissions', async (req, res) => {
  try {
    const { submission, name, email, sessionId } = req.body;
    
    // Convert ISO string to Db2 timestamp format
    const timestamp = new Date(submission.timestamp).toISOString().replace('T', ' ').substring(0, 19);
    
    // Insert submission
    await executeQuery(`
      INSERT INTO SURVEYS.SUBMISSIONS (ID, SESSION_ID, TIMESTAMP, RESPONDENT_NAME, RESPONDENT_EMAIL, NOTES)
      VALUES (?, ?, CAST(? AS TIMESTAMP), ?, ?, ?)
    `, [
      submission.id,
      sessionId || null,
      timestamp,
      name,
      email || null,
      submission.notes || null
    ]);
    
    // Insert responses
    for (const response of submission.responses) {
      await executeQuery(`
        INSERT INTO SURVEYS.RESPONSES (SUBMISSION_ID, PROBLEM_ID, FREQUENCY, SEVERITY)
        VALUES (?, ?, ?, ?)
      `, [submission.id, response.problemId, response.frequency, response.severity]);
    }
    
    // Update session response count
    if (sessionId) {
      const countResult = await executeQuery(
        'SELECT COUNT(*) as COUNT FROM SURVEYS.SUBMISSIONS WHERE SESSION_ID = ?',
        [sessionId]
      );
      const count = countResult[0].COUNT;
      
      await executeQuery(
        'UPDATE SURVEYS.SESSIONS SET RESPONSE_COUNT = ? WHERE ID = ?',
        [count, sessionId]
      );
    }
    
    res.json({ success: true, id: submission.id });
  } catch (error) {
    console.error('Error submitting survey:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all submissions
app.get('/api/submissions', async (req, res) => {
  try {
    const submissions = await executeQuery('SELECT * FROM SURVEYS.SUBMISSIONS ORDER BY TIMESTAMP DESC');
    
    const result = [];
    for (const sub of submissions) {
      const responses = await executeQuery(
        'SELECT PROBLEM_ID, FREQUENCY, SEVERITY FROM SURVEYS.RESPONSES WHERE SUBMISSION_ID = ?',
        [sub.ID]
      );
      
      result.push({
        id: sub.ID,
        timestamp: sub.TIMESTAMP,
        respondentName: sub.RESPONDENT_NAME,
        respondentEmail: sub.RESPONDENT_EMAIL,
        notes: sub.NOTES,
        sessionId: sub.SESSION_ID,
        responses: responses.map(r => ({
          problemId: r.PROBLEM_ID,
          frequency: r.FREQUENCY,
          severity: r.SEVERITY
        }))
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get submissions by session
app.get('/api/sessions/:id/submissions', async (req, res) => {
  try {
    const submissions = await executeQuery(
      'SELECT * FROM SURVEYS.SUBMISSIONS WHERE SESSION_ID = ? ORDER BY TIMESTAMP DESC',
      [req.params.id]
    );
    
    const result = [];
    for (const sub of submissions) {
      const responses = await executeQuery(
        'SELECT PROBLEM_ID, FREQUENCY, SEVERITY FROM SURVEYS.RESPONSES WHERE SUBMISSION_ID = ?',
        [sub.ID]
      );
      
      result.push({
        id: sub.ID,
        timestamp: sub.TIMESTAMP,
        respondentName: sub.RESPONDENT_NAME,
        respondentEmail: sub.RESPONDENT_EMAIL,
        notes: sub.NOTES,
        sessionId: sub.SESSION_ID,
        responses: responses.map(r => ({
          problemId: r.PROBLEM_ID,
          frequency: r.FREQUENCY,
          severity: r.SEVERITY
        }))
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching session submissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// CONFIGURATION ENDPOINTS
// ============================================================================

// Get active survey configuration
app.get('/api/config', async (req, res) => {
  try {
    const configs = await executeQuery('SELECT * FROM SURVEYS.CONFIG WHERE IS_ACTIVE = 1 ORDER BY CREATED_AT DESC FETCH FIRST 1 ROWS ONLY');
    
    if (configs.length === 0) {
      return res.status(404).json({ error: 'No active configuration found' });
    }
    
    const config = configs[0];
    
    // Get sections
    const sections = await executeQuery(
      'SELECT * FROM SURVEYS.SECTIONS WHERE CONFIG_ID = ? ORDER BY DISPLAY_ORDER',
      [config.ID]
    );
    
    // Get problems for each section
    const result = {
      title: config.TITLE,
      description: config.DESCRIPTION,
      sections: []
    };
    
    for (const section of sections) {
      const problems = await executeQuery(
        'SELECT * FROM SURVEYS.PROBLEMS WHERE SECTION_ID = ? ORDER BY DISPLAY_ORDER',
        [section.ID]
      );
      
      result.sections.push({
        id: section.ID,
        name: section.NAME,
        color: section.COLOR,
        problems: problems.map(p => ({
          id: p.ID,
          title: p.TITLE
        }))
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all sections
app.get('/api/config/sections', async (req, res) => {
  try {
    const configs = await executeQuery('SELECT * FROM SURVEYS.CONFIG WHERE IS_ACTIVE = 1 ORDER BY CREATED_AT DESC FETCH FIRST 1 ROWS ONLY');
    
    if (configs.length === 0) {
      return res.json([]);
    }
    
    const sections = await executeQuery(
      'SELECT * FROM SURVEYS.SECTIONS WHERE CONFIG_ID = ? ORDER BY DISPLAY_ORDER',
      [configs[0].ID]
    );
    
    res.json(sections.map(s => ({
      id: s.ID,
      name: s.NAME,
      color: s.COLOR,
      displayOrder: s.DISPLAY_ORDER
    })));
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new section
app.post('/api/config/sections', async (req, res) => {
  try {
    const { id, name, color, displayOrder, configId } = req.body;
    
    await executeQuery(`
      INSERT INTO SURVEYS.SECTIONS (ID, CONFIG_ID, NAME, COLOR, DISPLAY_ORDER)
      VALUES (?, ?, ?, ?, ?)
    `, [id, configId, name, color || null, displayOrder]);
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error adding section:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update section
app.patch('/api/config/sections/:id', async (req, res) => {
  try {
    const { name, color } = req.body;
    
    await executeQuery(
      'UPDATE SURVEYS.SECTIONS SET NAME = ?, COLOR = ? WHERE ID = ?',
      [name, color || null, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete section
app.delete('/api/config/sections/:id', async (req, res) => {
  try {
    // Delete associated problems first
    await executeQuery('DELETE FROM SURVEYS.PROBLEMS WHERE SECTION_ID = ?', [req.params.id]);
    
    // Delete section
    await executeQuery('DELETE FROM SURVEYS.SECTIONS WHERE ID = ?', [req.params.id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get problems for a section
app.get('/api/config/sections/:id/problems', async (req, res) => {
  try {
    const problems = await executeQuery(
      'SELECT * FROM SURVEYS.PROBLEMS WHERE SECTION_ID = ? ORDER BY DISPLAY_ORDER',
      [req.params.id]
    );
    
    res.json(problems.map(p => ({
      id: p.ID,
      title: p.TITLE,
      displayOrder: p.DISPLAY_ORDER
    })));
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new problem
app.post('/api/config/problems', async (req, res) => {
  try {
    const { id, sectionId, title, displayOrder } = req.body;
    
    await executeQuery(`
      INSERT INTO SURVEYS.PROBLEMS (ID, SECTION_ID, TITLE, DISPLAY_ORDER)
      VALUES (?, ?, ?, ?)
    `, [id, sectionId, title, displayOrder]);
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error adding problem:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update problem
app.patch('/api/config/problems/:id', async (req, res) => {
  try {
    const { title } = req.body;
    
    await executeQuery(
      'UPDATE SURVEYS.PROBLEMS SET TITLE = ? WHERE ID = ?',
      [title, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete problem
app.delete('/api/config/problems/:id', async (req, res) => {
  try {
    await executeQuery('DELETE FROM SURVEYS.PROBLEMS WHERE ID = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: 'IBM Db2',
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Survey server running on http://localhost:${PORT}`);
  console.log(`📊 Database: IBM Db2`);
  console.log(`🔗 Connection configured`);
});