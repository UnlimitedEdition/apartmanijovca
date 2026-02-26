const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlPath = path.join(__dirname, 'populate-content.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

// Split into individual INSERT statements (each line is one value)
const lines = sql.split('\n');
const header = lines[0]; // INSERT INTO...
const footer = lines[lines.length - 1]; // ON CONFLICT...

// Get all value lines (skip header and footer)
const valueLines = lines.slice(1, -1);

// Split into chunks of 50 values each
const chunkSize = 50;
const chunks = [];

for (let i = 0; i < valueLines.length; i += chunkSize) {
  const chunk = valueLines.slice(i, i + chunkSize);
  // Remove trailing comma from last line in chunk
  const lastIdx = chunk.length - 1;
  chunk[lastIdx] = chunk[lastIdx].replace(/,$/, '');
  
  const chunkSql = header + '\n' + chunk.join('\n') + '\n' + footer;
  chunks.push(chunkSql);
}

console.log(`Split SQL into ${chunks.length} chunks`);
console.log(`Total values: ${valueLines.length}`);

// Write chunks to separate files
chunks.forEach((chunk, idx) => {
  const chunkPath = path.join(__dirname, `populate-content-chunk-${idx + 1}.sql`);
  fs.writeFileSync(chunkPath, chunk, 'utf8');
  console.log(`Written: populate-content-chunk-${idx + 1}.sql`);
});

console.log('\nNow execute each chunk manually using Supabase MCP tool');
