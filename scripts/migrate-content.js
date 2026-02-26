#!/usr/bin/env node

/**
 * Content Migration Script
 * ========================
 * Migrates content from legacy JSON files to Supabase database.
 * 
 * Source Files: backend/data/{sr,en,de,it}.json
 * Target Tables: content, apartments (if applicable)
 * 
 * Usage:
 *   npm run db:migrate-content
 * 
 * Environment variables required (from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY - Your Supabase anon/public key
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key (for admin operations)
 * 
 * The script is idempotent - safe to run multiple times.
 * Uses upsert to handle conflicts on (lang, section) pairs.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`  ✓ ${message}`, 'green');
}

function logError(message) {
  log(`  ✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`  ⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`  ℹ ${message}`, 'blue');
}

function logProgress(current, total, message) {
  const percent = Math.round((current / total) * 100);
  log(`  [${current}/${total}] (${percent}%) ${message}`, 'magenta');
}

// Language configurations
const LANGUAGES = ['sr', 'en', 'de', 'it'];

// Sections to migrate from legacy JSON
const SECTIONS = [
  'home',
  'gallery', 
  'prices',
  'attractions',
  'contact',
  'nav',
  'language',
  'footer'
];

// Path to legacy data files (relative to project root)
const LEGACY_DATA_PATH = join(__dirname, '..', '..', 'backend', 'data');

/**
 * Read and parse a legacy JSON file
 */
function readLegacyJson(lang) {
  const filePath = join(LEGACY_DATA_PATH, `${lang}.json`);
  
  if (!existsSync(filePath)) {
    throw new Error(`Legacy JSON file not found: ${filePath}`);
  }
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse ${filePath}: ${error.message}`);
  }
}

/**
 * Transform legacy data to Supabase content format
 */
function transformToContentRecords(lang, legacyData) {
  const records = [];
  
  for (const section of SECTIONS) {
    if (legacyData[section]) {
      records.push({
        lang,
        section,
        data: legacyData[section]
      });
    }
  }
  
  return records;
}

/**
 * Extract site settings from legacy data
 */
function extractSiteSettings(legacyData) {
  // Extract contact info that should be in site_settings
  const contactInfo = legacyData.contact || {};
  
  return {
    site_name: 'Apartmani Jovča',
    contact_email: contactInfo.email || 'apartmanijovca@gmail.com',
    contact_phone: contactInfo.phone || '+381 65 237 8080',
    whatsapp: contactInfo.phone || '+381 65 237 8080',
    address: contactInfo.address || 'Apartmani Jovča, Serbia',
    languages: ['sr', 'en', 'de', 'it'],
    checkin_time: '14:00',
    checkout_time: '10:00',
    currency: 'RSD'
  };
}

/**
 * Extract attractions from legacy data for the attractions table
 */
function extractAttractions(legacyData) {
  const attractions = legacyData.attractions?.list || [];
  
  return attractions.map((attraction, index) => ({
    name: attraction.name,
    description: attraction.description,
    distance: extractDistance(attraction.description),
    category: categorizeAttraction(attraction.name),
    order_index: index
  }));
}

/**
 * Extract distance from description text
 */
function extractDistance(description) {
  const match = description.match(/(\d+)(?:\s*-\s*(\d+))?\s*km/);
  if (match) {
    return match[2] ? `${match[1]}-${match[2]} km` : `${match[1]} km`;
  }
  return null;
}

/**
 * Categorize attraction based on name
 */
function categorizeAttraction(name) {
  const categories = {
    nature: ['Rtanj', 'Izvor', 'Jezero', 'Vrmdja'],
    spa: ['Sokobanja', 'Banja'],
    historical: ['Sokograd', 'Logor', 'Spomen', 'Mediana', 'Čegar', 'Bubanj'],
    religious: ['Crkva', 'Manastir', 'Roman'],
    entertainment: ['Akva', 'Aquapark']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => name.toLowerCase().includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  return 'other';
}

/**
 * Main migration function
 */
async function migrateContent() {
  logSection('Apartmani Jovča - Content Migration Script');
  
  // Step 1: Validate environment
  logSection('Step 1: Validating Environment');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  let hasErrors = false;
  
  if (supabaseUrl) {
    logSuccess(`SUPABASE_URL: ${supabaseUrl}`);
  } else {
    logError('NEXT_PUBLIC_SUPABASE_URL is not set');
    hasErrors = true;
  }
  
  if (supabaseAnonKey) {
    logSuccess('NEXT_PUBLIC_SUPABASE_ANON_KEY is set');
  } else {
    logError('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    hasErrors = true;
  }
  
  if (serviceRoleKey) {
    logSuccess('SUPABASE_SERVICE_ROLE_KEY is set');
  } else {
    logWarning('SUPABASE_SERVICE_ROLE_KEY is not set (using anon key)');
  }
  
  if (hasErrors) {
    logError('\nMissing required environment variables. Please check your .env.local file.');
    process.exit(1);
  }
  
  // Step 2: Initialize Supabase client
  logSection('Step 2: Initializing Supabase Client');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  logSuccess('Supabase client initialized');
  
  // Step 3: Read legacy JSON files
  logSection('Step 3: Reading Legacy JSON Files');
  
  const legacyData = {};
  let totalRecords = 0;
  
  for (const lang of LANGUAGES) {
    try {
      legacyData[lang] = readLegacyJson(lang);
      const sections = Object.keys(legacyData[lang]).filter(key => SECTIONS.includes(key));
      totalRecords += sections.length;
      logSuccess(`Read ${lang}.json - Found ${sections.length} sections`);
    } catch (error) {
      logError(`Failed to read ${lang}.json: ${error.message}`);
      process.exit(1);
    }
  }
  
  logInfo(`Total records to migrate: ${totalRecords}`);
  
  // Step 4: Migrate content to Supabase
  logSection('Step 4: Migrating Content to Supabase');
  
  let successCount = 0;
  let errorCount = 0;
  let currentRecord = 0;
  
  for (const lang of LANGUAGES) {
    logInfo(`\nMigrating language: ${lang.toUpperCase()}`);
    
    const records = transformToContentRecords(lang, legacyData[lang]);
    
    for (const record of records) {
      currentRecord++;
      logProgress(currentRecord, totalRecords, `Migrating section: ${record.section}`);
      
      try {
        // Use upsert to handle conflicts (idempotent)
        const { error } = await supabase
          .from('content')
          .upsert(record, {
            onConflict: 'lang,section',
            ignoreDuplicates: false
          });
        
        if (error) {
          logError(`Failed to migrate ${lang}/${record.section}: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        logError(`Exception migrating ${lang}/${record.section}: ${err.message}`);
        errorCount++;
      }
    }
  }
  
  // Step 5: Migrate site settings
  logSection('Step 5: Migrating Site Settings');
  
  const siteSettings = extractSiteSettings(legacyData.sr);
  
  try {
    const { error } = await supabase
      .from('content')
      .upsert({
        lang: 'sr',
        section: 'site_settings',
        data: siteSettings
      }, {
        onConflict: 'lang,section'
      });
    
    if (error) {
      logError(`Failed to migrate site_settings: ${error.message}`);
      errorCount++;
    } else {
      logSuccess('Site settings migrated successfully');
      successCount++;
    }
  } catch (err) {
    logError(`Exception migrating site_settings: ${err.message}`);
    errorCount++;
  }
  
  // Step 6: Migrate attractions (if attractions table exists)
  logSection('Step 6: Migrating Attractions');
  
  // First check if attractions table exists
  try {
    const { error: checkError } = await supabase
      .from('attractions')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      logWarning('Attractions table does not exist - skipping attractions migration');
      logInfo('Attractions will be stored in content table instead');
    } else if (!checkError) {
      // Table exists, migrate attractions
      const attractions = extractAttractions(legacyData.sr);
      
      for (const attraction of attractions) {
        try {
          const { error } = await supabase
            .from('attractions')
            .upsert(attraction, {
              onConflict: 'name',
              ignoreDuplicates: false
            });
          
          if (error) {
            logWarning(`Failed to migrate attraction "${attraction.name}": ${error.message}`);
          }
        } catch (err) {
          logWarning(`Exception migrating attraction "${attraction.name}": ${err.message}`);
        }
      }
      
      logSuccess(`Migrated ${attractions.length} attractions`);
    }
  } catch (err) {
    logWarning(`Could not check attractions table: ${err.message}`);
  }
  
  // Step 7: Summary
  logSection('Migration Summary');
  
  log(`Total records processed: ${totalRecords + 1}`, 'blue');
  logSuccess(`Successfully migrated: ${successCount}`);
  
  if (errorCount > 0) {
    logError(`Failed: ${errorCount}`);
    log('\nSome records failed to migrate. Check the errors above.', 'yellow');
    process.exit(1);
  } else {
    log('\n✓ All content migrated successfully!', 'green');
    log('\nNext steps:', 'blue');
    log('  1. Verify the migration: npm run db:check');
    log('  2. Check content in Supabase dashboard');
    log('  3. Test the website to ensure content displays correctly');
  }
  
  console.log('\n');
}

// Run the migration
migrateContent().catch(err => {
  logError(`Migration failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
