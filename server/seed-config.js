import ibmdb from 'ibm_db';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const DB2_CONN_STRING = process.env.DB2_CONN_STRING;

if (!DB2_CONN_STRING) {
  console.error('ERROR: DB2_CONN_STRING not set');
  process.exit(1);
}

// Load the survey config JSON
const configData = JSON.parse(
  readFileSync(join(__dirname, '../public/survey-config.json'), 'utf-8')
);

const executeQuery = (conn, sql, params = []) => {
  return new Promise((resolve, reject) => {
    conn.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

async function seedDatabase() {
  let conn;
  
  try {
    console.log('Connecting to Db2...');
    conn = await new Promise((resolve, reject) => {
      ibmdb.open(DB2_CONN_STRING, (err, connection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });
    
    console.log('Connected! Seeding survey configuration...');
    
    const configId = `config-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Insert config
    await executeQuery(conn, `
      INSERT INTO SURVEYS.CONFIG (ID, TITLE, DESCRIPTION, IS_ACTIVE, CREATED_AT, UPDATED_AT)
      VALUES (?, ?, ?, 1, CAST(? AS TIMESTAMP), CAST(? AS TIMESTAMP))
    `, [configId, configData.title, configData.description, timestamp, timestamp]);
    
    console.log('✓ Config created');
    
    // Insert sections and problems
    for (let sectionIndex = 0; sectionIndex < configData.sections.length; sectionIndex++) {
      const section = configData.sections[sectionIndex];
      
      await executeQuery(conn, `
        INSERT INTO SURVEYS.SECTIONS (ID, CONFIG_ID, NAME, COLOR, DISPLAY_ORDER)
        VALUES (?, ?, ?, ?, ?)
      `, [section.id, configId, section.name, section.color || null, sectionIndex]);
      
      console.log(`✓ Section: ${section.name}`);
      
      // Insert problems
      for (let problemIndex = 0; problemIndex < section.problems.length; problemIndex++) {
        const problem = section.problems[problemIndex];
        
        await executeQuery(conn, `
          INSERT INTO SURVEYS.PROBLEMS (ID, SECTION_ID, TITLE, DISPLAY_ORDER)
          VALUES (?, ?, ?, ?)
        `, [problem.id, section.id, problem.title, problemIndex]);
      }
      
      console.log(`  ✓ ${section.problems.length} problems added`);
    }
    
    console.log('\n✅ Database seeded successfully!');
    console.log(`Config ID: ${configId}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    if (conn) {
      await new Promise((resolve) => conn.close(resolve));
    }
  }
}

seedDatabase();

