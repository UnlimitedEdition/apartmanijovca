#!/usr/bin/env node

/**
 * Database Migration Helper Script
 * ================================
 * This script tests the Supabase connection and verifies the database schema.
 * 
 * Usage:
 *   node scripts/migrate.js
 * 
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY - Your Supabase anon/public key
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key (for admin operations)
 * 
 * You can set these in a .env.local file in the project root.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'cyan');
  console.log('='.repeat(50));
}

function logSuccess(message) {
  log(`  [OK] ${message}`, 'green');
}

function logError(message) {
  log(`  [ERROR] ${message}`, 'red');
}

function logWarning(message) {
  log(`  [WARN] ${message}`, 'yellow');
}

function logInfo(message) {
  log(`  [INFO] ${message}`, 'blue');
}

// Expected tables in the database
const EXPECTED_TABLES = [
  'apartments',
  'bookings',
  'content',
  'guests',
  'messages',
  'reviews',
  'availability',
];

// Expected columns for key tables
const EXPECTED_COLUMNS = {
  apartments: ['id', 'name', 'type', 'capacity', 'price_per_night', 'images', 'created_at', 'updated_at'],
  bookings: ['id', 'apartment_id', 'guest_id', 'checkin', 'checkout', 'total_price', 'status', 'created_at', 'updated_at'],
  content: ['id', 'lang', 'section', 'data', 'created_at', 'updated_at'],
  guests: ['id', 'name', 'email', 'phone', 'created_at'],
};

async function main() {
  logSection('Apartmani Jovca - Database Migration Helper');
  
  // Step 1: Check environment variables
  logSection('Step 1: Checking Environment Variables');
  
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
    logWarning('SUPABASE_SERVICE_ROLE_KEY is not set (needed for admin operations)');
  }
  
  if (hasErrors) {
    logError('\nMissing required environment variables. Please check your .env.local file.');
    process.exit(1);
  }
  
  // Step 2: Test connection
  logSection('Step 2: Testing Database Connection');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const adminClient = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;
  
  try {
    // Simple query to test connection
    const { data, error } = await supabase.from('apartments').select('count').limit(1);
    
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist - migration not run
      logWarning('Connection successful, but apartments table does not exist.');
      logInfo('You need to run the migration first. See docs/DATABASE_MIGRATION.md');
    } else if (error) {
      logError(`Connection failed: ${error.message}`);
      process.exit(1);
    } else {
      logSuccess('Connection to Supabase successful!');
    }
  } catch (err) {
    logError(`Connection error: ${err.message}`);
    process.exit(1);
  }
  
  // Step 3: Verify tables exist
  logSection('Step 3: Verifying Database Tables');
  
  // Use admin client if available, otherwise use anon client
  const client = adminClient || supabase;
  
  const tableStatus = {};
  
  for (const table of EXPECTED_TABLES) {
    try {
      const { data, error } = await client.from(table).select('id').limit(1);
      
      if (error && error.code === 'PGRST116') {
        logWarning(`Table '${table}' does not exist`);
        tableStatus[table] = false;
      } else if (error) {
        logError(`Error checking table '${table}': ${error.message}`);
        tableStatus[table] = false;
      } else {
        logSuccess(`Table '${table}' exists`);
        tableStatus[table] = true;
      }
    } catch (err) {
      logError(`Error checking table '${table}': ${err.message}`);
      tableStatus[table] = false;
    }
  }
  
  // Step 4: Check table contents
  logSection('Step 4: Checking Table Contents');
  
  // Check apartments
  try {
    const { data: apartments, error: aptError } = await client
      .from('apartments')
      .select('id, name, type, capacity, price_per_night');
    
    if (aptError) {
      logWarning(`Could not fetch apartments: ${aptError.message}`);
    } else if (apartments && apartments.length > 0) {
      logSuccess(`Found ${apartments.length} apartment(s):`);
      apartments.forEach(apt => {
        logInfo(`  - ${apt.name} (${apt.type}, ${apt.capacity} guests, ${apt.price_per_night} RSD/night)`);
      });
    } else {
      logWarning('No apartments found. Run seed.sql to add sample data.');
    }
  } catch (err) {
    logWarning(`Could not check apartments: ${err.message}`);
  }
  
  // Check content
  try {
    const { data: content, error: contentError } = await client
      .from('content')
      .select('lang, section');
    
    if (contentError) {
      logWarning(`Could not fetch content: ${contentError.message}`);
    } else if (content && content.length > 0) {
      logSuccess(`Found ${content.length} content entries:`);
      
      // Group by language
      const byLang = content.reduce((acc, item) => {
        if (!acc[item.lang]) acc[item.lang] = [];
        acc[item.lang].push(item.section);
        return acc;
      }, {});
      
      Object.entries(byLang).forEach(([lang, sections]) => {
        logInfo(`  - ${lang}: ${sections.join(', ')}`);
      });
    } else {
      logWarning('No content found. Run seed.sql to add sample data.');
    }
  } catch (err) {
    logWarning(`Could not check content: ${err.message}`);
  }
  
  // Step 5: Test database functions
  logSection('Step 5: Testing Database Functions');
  
  try {
    // Test get_available_apartments function
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const formatDate = (d) => d.toISOString().split('T')[0];
    
    const { data: available, error: funcError } = await client
      .rpc('get_available_apartments', {
        checkin: formatDate(today),
        checkout: formatDate(nextWeek)
      });
    
    if (funcError) {
      logWarning(`Function test failed: ${funcError.message}`);
      logInfo('The get_available_apartments function may not be created yet.');
    } else {
      logSuccess('get_available_apartments function works!');
      if (available && available.length > 0) {
        logInfo(`  Found ${available.length} available apartment(s) for next week`);
      }
    }
  } catch (err) {
    logWarning(`Could not test functions: ${err.message}`);
  }
  
  // Step 6: Summary
  logSection('Migration Status Summary');
  
  const allTablesExist = Object.values(tableStatus).every(v => v);
  
  if (allTablesExist) {
    logSuccess('All required tables exist!');
    log('\nYour database is ready to use.', 'green');
    log('\nNext steps:', 'blue');
    log('  1. Run seed.sql if you haven\'t already (see docs/DATABASE_MIGRATION.md)');
    log('  2. Start the development server: npm run dev');
    log('  3. Test the booking flow in the browser');
  } else {
    const missingTables = Object.entries(tableStatus)
      .filter(([_, exists]) => !exists)
      .map(([table]) => table);
    
    logWarning(`Missing tables: ${missingTables.join(', ')}`);
    log('\nYou need to run the migration. See docs/DATABASE_MIGRATION.md', 'yellow');
    log('\nQuick fix (using Supabase Dashboard):', 'blue');
    log('  1. Go to SQL Editor in your Supabase dashboard');
    log('  2. Copy the contents of supabase/migrations/20260213000000_initial_schema.sql');
    log('  3. Paste and run the query');
    log('  4. Run this script again to verify');
  }
  
  console.log('\n');
}

// Run the script
main().catch(err => {
  logError(`Script failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});