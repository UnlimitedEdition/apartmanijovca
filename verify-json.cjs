const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');
const files = ['en.json', 'sr.json', 'de.json', 'it.json'];

files.forEach(file => {
  const filePath = path.join(messagesDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    console.log(`✅ ${file} is valid JSON`);
  } catch (error) {
    console.error(`❌ ${file} is INVALID JSON:`, error.message);
  }
});
