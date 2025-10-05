import initSqlJs, { Database } from 'sql.js';
import { SurveySubmission, Response } from '../types';

const DB_KEY = 'zora_survey_db';

let db: Database | null = null;

export const initDatabase = async (): Promise<void> => {
  if (db) return;

  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`
  });

  // Try to load existing database from localStorage
  const savedDb = localStorage.getItem(DB_KEY);
  
  if (savedDb) {
    const uint8Array = new Uint8Array(JSON.parse(savedDb));
    db = new SQL.Database(uint8Array);
    migrateDatabase();
  } else {
    db = new SQL.Database();
    createTables();
  }
};

const migrateDatabase = (): void => {
  if (!db) return;

  // Check if session_id column exists
  try {
    db.exec('SELECT session_id FROM submissions LIMIT 1');
  } catch (error) {
    // Column doesn't exist, add it
    console.log('Migrating database: adding session_id column');
    db.run('ALTER TABLE submissions ADD COLUMN session_id TEXT');
    saveDatabase();
  }
};

const createTables = (): void => {
  if (!db) return;

  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      respondent_name TEXT,
      respondent_email TEXT,
      notes TEXT,
      session_id TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id TEXT NOT NULL,
      problem_id INTEGER NOT NULL,
      frequency INTEGER NOT NULL,
      severity INTEGER NOT NULL,
      FOREIGN KEY (submission_id) REFERENCES submissions(id)
    );
  `);

  saveDatabase();
};

const saveDatabase = (): void => {
  if (!db) return;
  
  const data = db.export();
  const buffer = Array.from(data);
  localStorage.setItem(DB_KEY, JSON.stringify(buffer));
};

export const saveSubmission = (
  submission: SurveySubmission, 
  name: string, 
  email: string,
  sessionId?: string
): void => {
  if (!db) throw new Error('Database not initialized');

  db.run(
    'INSERT INTO submissions (id, timestamp, respondent_name, respondent_email, notes, session_id) VALUES (?, ?, ?, ?, ?, ?)',
    [submission.id, submission.timestamp, name, email, submission.notes || null, sessionId || null]
  );

  submission.responses.forEach(response => {
    db!.run(
      'INSERT INTO responses (submission_id, problem_id, frequency, severity) VALUES (?, ?, ?, ?)',
      [submission.id, response.problemId, response.frequency ?? null, response.severity ?? null]
    );
  });

  saveDatabase();
};

export const getAllSubmissions = (): SurveySubmission[] => {
  if (!db) return [];

  const submissions: SurveySubmission[] = [];
  
  const submissionResults = db.exec('SELECT * FROM submissions');
  if (submissionResults.length === 0) return [];

  submissionResults[0].values.forEach((row: any) => {
    const [id, timestamp, name, email, notes, sessionId] = row;
    
    const responseResults = db!.exec(
      'SELECT problem_id, frequency, severity FROM responses WHERE submission_id = ?',
      [id]
    );

    const responses: Response[] = responseResults.length > 0
      ? responseResults[0].values.map((r: any) => ({
          problemId: r[0],
          frequency: r[1],
          severity: r[2]
        }))
      : [];

    submissions.push({
      id: id as string,
      timestamp: timestamp as string,
      responses,
      notes: notes as string | undefined,
      respondentName: name as string | undefined,
      respondentEmail: email as string | undefined,
      sessionId: sessionId as string | undefined
    });
  });

  return submissions;
};

export const exportDatabaseToFile = (): void => {
  if (!db) return;

  const data = db.export();
  const blob = new Blob([new Uint8Array(data)], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `zora-survey-database-${new Date().toISOString().split('T')[0]}.db`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const clearAllData = (): void => {
  if (!db) return;

  db.run('DELETE FROM responses');
  db.run('DELETE FROM submissions');
  saveDatabase();
};

export const getSubmissionCount = (): number => {
  if (!db) return 0;

  const result = db.exec('SELECT COUNT(*) FROM submissions');
  return result.length > 0 ? (result[0].values[0][0] as number) : 0;
};

export const getSubmissionsBySession = (sessionId: string): SurveySubmission[] => {
  if (!db) return [];

  const submissions: SurveySubmission[] = [];
  
  const submissionResults = db!.exec('SELECT * FROM submissions WHERE session_id = ?', [sessionId]);
  if (submissionResults.length === 0) return [];

  submissionResults[0].values.forEach((row: any) => {
    const [id, timestamp, name, email, notes, sessionIdCol] = row;
    
    const responseResults = db!.exec(
      'SELECT problem_id, frequency, severity FROM responses WHERE submission_id = ?',
      [id]
    );

    const responses: Response[] = responseResults.length > 0
      ? responseResults[0].values.map((r: any) => ({
          problemId: r[0],
          frequency: r[1],
          severity: r[2]
        }))
      : [];

    submissions.push({
      id: id as string,
      timestamp: timestamp as string,
      responses,
      notes: notes as string | undefined,
      respondentName: name as string | undefined,
      respondentEmail: email as string | undefined,
      sessionId: sessionIdCol as string | undefined
    });
  });

  return submissions;
};

