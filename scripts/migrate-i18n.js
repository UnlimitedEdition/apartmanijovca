#!/usr/bin/env node

/**
 * i18n Migration and Consolidation Script
 * 
 * This script migrates translation files from the legacy frontend to the Next.js project.
 * It merges translations from both sources and writes to multiple locations for 
 * client-side and server-side usage.
 * 
 * Usage: node scripts/migrate-i18n.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES = ['sr', 'en', 'de', 'it'];
const DEFAULT_LOCALE = 'en';

// Paths
const LEGACY_PATH = path.join(__dirname, '../../frontend/public/locales');
const NEXTJS_PUBLIC_PATH = path.join(__dirname, '../public/locales');
const NEXTJS_MESSAGES_PATH = path.join(__dirname, '../messages');

// Statistics tracking
const stats = {
  legacyKeys: {},
  existingKeys: {},
  mergedKeys: {},
  newKeys: {},
  missingTranslations: {},
};

/**
 * Deep merge two objects, combining nested properties
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Count all keys in a nested object (including nested keys)
 */
function countKeys(obj, prefix = '') {
  let count = 0;
  const keys = [];
  
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (obj[key] instanceof Object && !Array.isArray(obj[key])) {
      const nested = countKeys(obj[key], fullKey);
      count += nested.count;
      keys.push(...nested.keys);
    } else {
      count++;
      keys.push(fullKey);
    }
  }
  
  return { count, keys };
}

/**
 * Find missing keys between two translation objects
 */
function findMissingKeys(source, target, prefix = '') {
  const missing = [];
  
  for (const key of Object.keys(source)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      const nestedMissing = findMissingKeys(source[key], target[key] || {}, fullKey);
      missing.push(...nestedMissing);
    } else if (!(key in target)) {
      missing.push(fullKey);
    }
  }
  
  return missing;
}

/**
 * Read JSON file safely
 */
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}: ${error.message}`);
  }
  return {};
}

/**
 * Write JSON file with formatting
 */
function writeJsonFile(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Get placeholder text for missing translations
 */
function getPlaceholder(key, locale) {
  if (locale === DEFAULT_LOCALE) {
    return `[Missing: ${key}]`;
  }
  return null; // Will be filled from default locale later
}

/**
 * Ensure all locales have the same keys by filling missing with placeholders
 */
function ensureCompleteTranslations(translations) {
  // Get all unique keys from all locales
  const allKeys = new Set();
  for (const locale of LOCALES) {
    const { keys } = countKeys(translations[locale] || {});
    keys.forEach(key => allKeys.add(key));
  }
  
  // Build a reference structure from the default locale
  const reference = translations[DEFAULT_LOCALE] || {};
  
  // For each locale, ensure it has all keys
  for (const locale of LOCALES) {
    if (!translations[locale]) {
      translations[locale] = {};
    }
    
    // Fill missing keys from reference (default locale)
    translations[locale] = fillMissingKeys(translations[locale], reference, locale);
  }
  
  return translations;
}

/**
 * Recursively fill missing keys from reference
 */
function fillMissingKeys(target, reference, locale) {
  const result = { ...target };
  
  for (const key of Object.keys(reference)) {
    if (reference[key] instanceof Object && !Array.isArray(reference[key])) {
      result[key] = fillMissingKeys(result[key] || {}, reference[key], locale);
    } else if (!(key in result) || result[key] === null) {
      // Use reference value as placeholder for non-default locales
      result[key] = locale === DEFAULT_LOCALE 
        ? reference[key] 
        : `[${locale.toUpperCase()}] ${reference[key]}`;
    }
  }
  
  return result;
}

/**
 * Main migration function
 */
async function migrateTranslations() {
  console.log('🌍 i18n Migration Script');
  console.log('========================\n');
  
  const translations = {};
  
  // Step 1: Read legacy translations
  console.log('📖 Reading legacy translations...');
  for (const locale of LOCALES) {
    const legacyFile = path.join(LEGACY_PATH, locale, 'common.json');
    translations[locale] = readJsonFile(legacyFile);
    
    const { count, keys } = countKeys(translations[locale]);
    stats.legacyKeys[locale] = count;
    console.log(`   ${locale}: ${count} keys from legacy`);
  }
  
  // Step 2: Read existing Next.js translations
  console.log('\n📚 Reading existing Next.js translations...');
  for (const locale of LOCALES) {
    // Read from public/locales
    const publicFile = path.join(NEXTJS_PUBLIC_PATH, locale, 'common.json');
    const publicTranslations = readJsonFile(publicFile);
    
    // Read from messages
    const messagesFile = path.join(NEXTJS_MESSAGES_PATH, `${locale}.json`);
    const messagesTranslations = readJsonFile(messagesFile);
    
    // Merge existing translations with legacy
    const existingCombined = deepMerge(messagesTranslations, publicTranslations);
    const { count } = countKeys(existingCombined);
    stats.existingKeys[locale] = count;
    console.log(`   ${locale}: ${count} existing keys`);
    
    // Merge legacy with existing (legacy takes precedence for overlapping keys)
    translations[locale] = deepMerge(existingCombined, translations[locale]);
  }
  
  // Step 3: Ensure all translations are complete
  console.log('\n🔧 Ensuring translation completeness...');
  const completeTranslations = ensureCompleteTranslations(translations);
  
  for (const locale of LOCALES) {
    const { count } = countKeys(completeTranslations[locale]);
    stats.mergedKeys[locale] = count;
    console.log(`   ${locale}: ${count} total keys after merge`);
  }
  
  // Step 4: Write to public/locales (for next-i18next client-side)
  console.log('\n💾 Writing to public/locales/...');
  for (const locale of LOCALES) {
    const targetFile = path.join(NEXTJS_PUBLIC_PATH, locale, 'common.json');
    writeJsonFile(targetFile, completeTranslations[locale]);
    console.log(`   ✓ ${locale}/common.json`);
  }
  
  // Step 5: Write to messages (for next-intl server-side)
  console.log('\n💾 Writing to messages/...');
  for (const locale of LOCALES) {
    const targetFile = path.join(NEXTJS_MESSAGES_PATH, `${locale}.json`);
    writeJsonFile(targetFile, completeTranslations[locale]);
    console.log(`   ✓ ${locale}.json`);
  }
  
  // Step 6: Generate summary
  console.log('\n📊 Migration Summary');
  console.log('====================');
  console.log('\n| Locale | Legacy | Existing | Merged |');
  console.log('|--------|--------|----------|--------|');
  for (const locale of LOCALES) {
    console.log(`| ${locale.padEnd(6)} | ${String(stats.legacyKeys[locale]).padEnd(6)} | ${String(stats.existingKeys[locale]).padEnd(8)} | ${String(stats.mergedKeys[locale]).padEnd(6)} |`);
  }
  
  // Check for any potential issues
  console.log('\n⚠️  Notes:');
  const enKeys = countKeys(completeTranslations[DEFAULT_LOCALE]).keys;
  for (const locale of LOCALES.filter(l => l !== DEFAULT_LOCALE)) {
    const localeKeys = countKeys(completeTranslations[locale]).keys;
    const missingInLocale = enKeys.filter(k => !localeKeys.includes(k));
    if (missingInLocale.length > 0) {
      console.log(`   ${locale}: ${missingInLocale.length} keys using placeholder text`);
    }
  }
  
  console.log('\n✅ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Review the generated translation files');
  console.log('2. Replace placeholder text (marked with [XX]) with proper translations');
  console.log('3. Run the app to verify translations work correctly');
  
  return completeTranslations;
}

// Run the migration
migrateTranslations().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
