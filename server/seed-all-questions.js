import ibmdb from 'ibm_db';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const DB2_CONN_STRING = process.env.DB2_CONN_STRING;

if (!DB2_CONN_STRING) {
  console.error('ERROR: DB2_CONN_STRING environment variable not set');
  process.exit(1);
}

const executeQuery = (conn, sql, params = []) => {
  return new Promise((resolve, reject) => {
    conn.query(sql, params, (err, result) => {
      if (err) {
        console.error('Query error:', err);
        return reject(err);
      }
      resolve(result);
    });
  });
};

async function seedAllQuestions() {
  let conn;
  
  try {
    console.log('Connecting to Db2...');
    conn = await new Promise((resolve, reject) => {
      ibmdb.open(DB2_CONN_STRING, (err, connection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });
    
    console.log('Connected! Seeding all survey questions...');
    
    // Load the original config
    const configPath = join(__dirname, '../public/survey-config.json');
    const configData = JSON.parse(readFileSync(configPath, 'utf8'));
    
    const configId = `config-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Insert config
    await executeQuery(conn, `
      INSERT INTO SURVEYS.CONFIG (ID, TITLE, DESCRIPTION, IS_ACTIVE, CREATED_AT, UPDATED_AT)
      VALUES (?, ?, ?, 1, CAST(? AS TIMESTAMP), CAST(? AS TIMESTAMP))
    `, [configId, configData.title, configData.description, timestamp, timestamp]);
    
    console.log('✓ Config created');
    
    // Insert original sections and problems
    for (let sectionIndex = 0; sectionIndex < configData.sections.length; sectionIndex++) {
      const section = configData.sections[sectionIndex];
      
      await executeQuery(conn, `
        INSERT INTO SURVEYS.SECTIONS (ID, CONFIG_ID, NAME, COLOR, DISPLAY_ORDER)
        VALUES (?, ?, ?, ?, ?)
      `, [section.id, configId, section.name, section.color || null, sectionIndex]);
      
      console.log(`✓ Section: ${section.name}`);
      
      // Insert problems (all as 'slider' type by default)
      for (let problemIndex = 0; problemIndex < section.problems.length; problemIndex++) {
        const problem = section.problems[problemIndex];
        
        await executeQuery(conn, `
          INSERT INTO SURVEYS.PROBLEMS (ID, SECTION_ID, TITLE, QUESTION_TYPE, DISPLAY_ORDER)
          VALUES (?, ?, ?, 'slider', ?)
        `, [problem.id, section.id, problem.title, problemIndex]);
      }
      
      console.log(`  ✓ ${section.problems.length} problems added`);
    }
    
    // Now add the two new sections
    let nextSectionOrder = configData.sections.length;
    let nextProblemId = 16; // After the original 15
    
    // Section 1: AI Deployment
    const aiDeploymentSectionId = 'ai-deployment';
    await executeQuery(conn, `
      INSERT INTO SURVEYS.SECTIONS (ID, CONFIG_ID, NAME, COLOR, DISPLAY_ORDER)
      VALUES (?, ?, ?, ?, ?)
    `, [aiDeploymentSectionId, configId, 'AI Deployment', '#06b6d4', nextSectionOrder]);
    
    console.log('✓ Section: AI Deployment');
    nextSectionOrder++;
    
    // AI Deployment Q1
    const deploymentOptions = JSON.stringify([
      'Fully on-prem (including air-gapped or isolated environments)',
      'On-prem with limited outbound connectivity (e.g., for updates or telemetry)',
      'Hybrid (some components on-prem, others cloud-connected)',
      'Fully cloud-hosted',
      'Not sure'
    ]);
    
    await executeQuery(conn, `
      INSERT INTO SURVEYS.PROBLEMS (ID, SECTION_ID, TITLE, QUESTION_TYPE, OPTIONS, DISPLAY_ORDER)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      nextProblemId,
      aiDeploymentSectionId,
      'Which of the following best describes how your organization prefers to deploy database management and AI tools?',
      'single-choice',
      deploymentOptions,
      0
    ]);
    console.log(`  ✓ Question ${nextProblemId} added (single-choice)`);
    nextProblemId++;
    
    // AI Deployment Q2
    const cloudStrategyOptions = JSON.stringify([
      'AWS',
      'Azure',
      'Google Cloud',
      'IBM Cloud',
      'Private or sovereign cloud managed internally',
      'Building or planning an internal AI data center (private LLM / GPU cluster)',
      'No defined cloud strategy (mostly on-prem)'
    ]);
    
    await executeQuery(conn, `
      INSERT INTO SURVEYS.PROBLEMS (ID, SECTION_ID, TITLE, QUESTION_TYPE, OPTIONS, DISPLAY_ORDER)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      nextProblemId,
      aiDeploymentSectionId,
      'Which best describes your organization\'s current or planned infrastructure strategy for AI and data workloads?',
      'multiple-choice',
      cloudStrategyOptions,
      1
    ]);
    console.log(`  ✓ Question ${nextProblemId} added (multiple-choice)`);
    nextProblemId++;
    
    // Section 2: Db2 Workflows and Interfaces
    const workflowsSectionId = 'db2-workflows';
    await executeQuery(conn, `
      INSERT INTO SURVEYS.SECTIONS (ID, CONFIG_ID, NAME, COLOR, DISPLAY_ORDER)
      VALUES (?, ?, ?, ?, ?)
    `, [workflowsSectionId, configId, 'Db2 Workflows and Interfaces', '#ec4899', nextSectionOrder]);
    
    console.log('✓ Section: Db2 Workflows and Interfaces');
    nextSectionOrder++;
    
    // Workflows Q1 - Slider with 5 options
    const workStyleOptions = JSON.stringify([
      'Entirely CLI / Automated - Almost everything I do is through command line or scripts.',
      'Mostly CLI - I use GUI tools occasionally, but most work happens in CLI or automation.',
      'Balanced - Roughly equal mix of GUI and CLI.',
      'Mostly GUI - I use GUI tools for most work but switch to CLI for a few tasks.',
      'Entirely GUI - I rely almost entirely on graphical tools.'
    ]);
    
    await executeQuery(conn, `
      INSERT INTO SURVEYS.PROBLEMS (ID, SECTION_ID, TITLE, QUESTION_TYPE, OPTIONS, DISPLAY_ORDER)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      nextProblemId,
      workflowsSectionId,
      'Which best describes your typical way of working with Db2?',
      'slider-labeled',
      workStyleOptions,
      0
    ]);
    console.log(`  ✓ Question ${nextProblemId} added (slider-labeled)`);
    nextProblemId++;
    
    // Workflows Q2
    const cliUsefulnessOptions = JSON.stringify([
      'Extremely useful — would likely use it often',
      'Somewhat useful — for certain scenarios',
      'Neutral — nice to have, not essential',
      'Not useful — prefer GUI or automated workflows',
      'Not sure'
    ]);
    
    await executeQuery(conn, `
      INSERT INTO SURVEYS.PROBLEMS (ID, SECTION_ID, TITLE, QUESTION_TYPE, OPTIONS, DISPLAY_ORDER)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      nextProblemId,
      workflowsSectionId,
      'How useful would a CLI interface for AI Agents be — for example, to run /ai analyze lockwaits or embed AI workflows in scripts?',
      'single-choice',
      cliUsefulnessOptions,
      1
    ]);
    console.log(`  ✓ Question ${nextProblemId} added (single-choice)`);
    nextProblemId++;
    
    console.log('\n✅ Database seeded successfully!');
    console.log(`Config ID: ${configId}`);
    console.log(`Total questions: ${nextProblemId - 1} (15 original + 4 new)`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    if (conn) {
      try {
        await new Promise((resolve) => conn.close(resolve));
        console.log('Connection closed');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

seedAllQuestions();
