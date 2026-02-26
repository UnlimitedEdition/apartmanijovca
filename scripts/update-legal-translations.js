const fs = require('fs');
const path = require('path');

// Load legal translations
const legalSr = require('../messages/legal-sr.json');
const legalEn = require('../messages/legal-en.json');

// Update Serbian
const srPath = path.join(__dirname, '../messages/sr.json');
const sr = JSON.parse(fs.readFileSync(srPath, 'utf8'));
sr.legal = legalSr.legal;
fs.writeFileSync(srPath, JSON.stringify(sr, null, 2), 'utf8');
console.log('✅ Updated sr.json');

// Update English
const enPath = path.join(__dirname, '../messages/en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
en.legal = legalEn.legal;
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('✅ Updated en.json');

console.log('\n✨ All legal translations updated successfully!');
