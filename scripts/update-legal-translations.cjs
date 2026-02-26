const fs = require('fs');
const path = require('path');

// Load legal translations
const legalSr = require('../messages/legal-sr.json');
const legalEn = require('../messages/legal-en.json');
const legalDe = require('../messages/legal-de.json');
const legalIt = require('../messages/legal-it.json');

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

// Update German
const dePath = path.join(__dirname, '../messages/de.json');
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
de.legal = legalDe.legal;
fs.writeFileSync(dePath, JSON.stringify(de, null, 2), 'utf8');
console.log('✅ Updated de.json');

// Update Italian
const itPath = path.join(__dirname, '../messages/it.json');
const it = JSON.parse(fs.readFileSync(itPath, 'utf8'));
it.legal = legalIt.legal;
fs.writeFileSync(itPath, JSON.stringify(it, null, 2), 'utf8');
console.log('✅ Updated it.json');

console.log('\n✨ All legal translations updated successfully!');
console.log('📄 Updated files: sr.json, en.json, de.json, it.json');

