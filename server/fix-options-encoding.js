// Script to fix corrupted OPTIONS data in the database
import ibmdb from 'ibm_db';
import dotenv from 'dotenv';

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

async function fixOptionsEncoding() {
  let conn;
  
  try {
    console.log('Connecting to Db2...');
    conn = await new Promise((resolve, reject) => {
      ibmdb.open(DB2_CONN_STRING, (err, connection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });
    
    console.log('Connected! Checking for corrupted OPTIONS data...\n');
    
    // Get all problems with OPTIONS
    const problems = await executeQuery(conn, 
      'SELECT ID, TITLE, QUESTION_TYPE, OPTIONS FROM SURVEYS.PROBLEMS WHERE OPTIONS IS NOT NULL'
    );
    
    console.log(`Found ${problems.length} problems with OPTIONS data\n`);
    
    let fixedCount = 0;
    
    for (const problem of problems) {
      const optionsStr = problem.OPTIONS;
      
      // Try to parse the OPTIONS
      try {
        JSON.parse(optionsStr);
        console.log(`✓ Problem ${problem.ID} (${problem.TITLE}) - OPTIONS is valid JSON`);
      } catch (err) {
        console.log(`✗ Problem ${problem.ID} (${problem.TITLE}) - CORRUPTED`);
        console.log(`  Error: ${err.message}`);
        console.log(`  Raw value (first 100 chars): ${optionsStr.substring(0, 100)}`);
        
        // Try to clean the string by removing control characters
        const cleanedOptions = optionsStr
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove all control characters
          .trim();
        
        console.log(`  Cleaned value: ${cleanedOptions.substring(0, 100)}`);
        
        // Try to parse the cleaned version
        try {
          const parsed = JSON.parse(cleanedOptions);
          console.log(`  ✓ Cleaned version is valid JSON with ${parsed.length} options`);
          
          // Update the database
          await executeQuery(conn,
            'UPDATE SURVEYS.PROBLEMS SET OPTIONS = ? WHERE ID = ?',
            [cleanedOptions, problem.ID]
          );
          
          console.log(`  ✓ Updated in database`);
          fixedCount++;
        } catch (cleanErr) {
          console.log(`  ✗ Even cleaned version is invalid: ${cleanErr.message}`);
          console.log(`  → You may need to manually fix this one`);
        }
        
        console.log('');
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} corrupted OPTIONS entries`);
    
    if (fixedCount === 0 && problems.some(p => {
      try { JSON.parse(p.OPTIONS); return false; } catch { return true; }
    })) {
      console.log('\n⚠️  Some OPTIONS are still corrupted. You may need to reseed those questions.');
    }
    
    conn.closeSync();
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (conn) conn.closeSync();
    process.exit(1);
  }
}

fixOptionsEncoding();
