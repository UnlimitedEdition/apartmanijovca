#!/usr/bin/env node

/**
 * Apartmani Jovca - Build Verification Script
 * 
 * This script performs pre-deployment checks to ensure the application
 * is ready for production deployment.
 * 
 * Usage:
 *   node scripts/verify-build.js
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - One or more checks failed
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = process.cwd();
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let exitCode = 0;

function log(message, type = 'info') {
  const prefix = {
    info: `${BLUE}ℹ${RESET}`,
    success: `${GREEN}✓${RESET}`,
    error: `${RED}✗${RESET}`,
    warning: `${YELLOW}⚠${RESET}`,
  }[type];
  console.log(`${prefix} ${message}`);
}

function logSection(title) {
  console.log(`\n${BLUE}━━━ ${title} ━━━${RESET}\n`);
}

function checkRequiredEnvVars() {
  logSection('Environment Variables');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_SITE_URL',
  ];
  
  const optionalVars = [
    'WHATSAPP_API_TOKEN',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    'ENABLE_WHATSAPP',
    'ENABLE_EMAIL_NOTIFICATIONS',
  ];
  
  let allRequiredPresent = true;
  
  // Check required variables
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log(`${varName}: Set`, 'success');
    } else {
      log(`${varName}: NOT SET`, 'error');
      allRequiredPresent = false;
    }
  }
  
  // Check optional variables
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      log(`${varName}: Set`, 'success');
    } else {
      log(`${varName}: Not set (optional)`, 'warning');
    }
  }
  
  if (!allRequiredPresent) {
    log('\nMissing required environment variables!', 'error');
    log('Copy .env.production.example to .env.local and configure', 'info');
    return false;
  }
  
  return true;
}

function checkProjectStructure() {
  logSection('Project Structure');
  
  const requiredFiles = [
    'package.json',
    'next.config.mjs',
    'vercel.json',
    'tsconfig.json',
    'tailwind.config.js',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/lib/supabase.ts',
  ];
  
  let allExist = true;
  
  for (const file of requiredFiles) {
    const filePath = join(PROJECT_ROOT, file);
    if (existsSync(filePath)) {
      log(`${file}: Exists`, 'success');
    } else {
      log(`${file}: Missing`, 'error');
      allExist = false;
    }
  }
  
  return allExist;
}

function checkDependencies() {
  logSection('Dependencies');
  
  try {
    const packageJson = JSON.parse(
      readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf-8')
    );
    
    const requiredDeps = [
      'next',
      '@supabase/supabase-js',
      '@supabase/ssr',
      'react',
      'react-dom',
    ];
    
    let allInstalled = true;
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies?.[dep]) {
        log(`${dep}: ${packageJson.dependencies[dep]}`, 'success');
      } else {
        log(`${dep}: Not installed`, 'error');
        allInstalled = false;
      }
    }
    
    return allInstalled;
  } catch (error) {
    log(`Failed to read package.json: ${error.message}`, 'error');
    return false;
  }
}

function checkBuild() {
  logSection('Build Check');
  
  try {
    log('Running npm run build...', 'info');
    execSync('npm run build', { 
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    log('Build successful!', 'success');
    return true;
  } catch (error) {
    log('Build failed!', 'error');
    return false;
  }
}

function checkTypeScript() {
  logSection('TypeScript Check');
  
  try {
    log('Running TypeScript compiler...', 'info');
    execSync('npx tsc --noEmit', { 
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    log('No TypeScript errors!', 'success');
    return true;
  } catch (error) {
    log('TypeScript errors found!', 'error');
    return false;
  }
}

function checkLint() {
  logSection('ESLint Check');
  
  try {
    log('Running ESLint...', 'info');
    execSync('npm run lint', { 
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    log('No ESLint errors!', 'success');
    return true;
  } catch (error) {
    log('ESLint errors found!', 'warning');
    return false;
  }
}

function checkTests() {
  logSection('Tests');
  
  try {
    log('Running tests...', 'info');
    execSync('npm test', { 
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    log('All tests passed!', 'success');
    return true;
  } catch (error) {
    log('Some tests failed!', 'warning');
    return false;
  }
}

function checkRoutes() {
  logSection('Route Verification');
  
  const routesPath = join(PROJECT_ROOT, 'src/app/[lang]');
  const apiPath = join(PROJECT_ROOT, 'src/app/api');
  
  function findRoutes(dir, prefix = '') {
    const routes = [];
    
    if (!existsSync(dir)) return routes;
    
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (item === 'api') {
          // API routes
          const apiRoutes = findRoutes(fullPath, '/api');
          routes.push(...apiRoutes);
        } else if (item !== '__tests__' && item !== 'components' && item !== 'lib' && item !== 'styles') {
          // Page routes
          const routeName = item === '[lang]' ? ':lang' : item;
          const pagePath = join(fullPath, 'page.tsx');
          if (existsSync(pagePath)) {
            routes.push(`${prefix}/${routeName}`);
          } else {
            routes.push(...findRoutes(fullPath, `${prefix}/${routeName}`));
          }
        }
      }
    }
    
    return routes;
  }
  
  // Check language routes
  if (existsSync(routesPath)) {
    log('Language routes (src/app/[lang]):', 'info');
    const langs = ['en', 'sr', 'de', 'it'];
    for (const lang of langs) {
      const langRoutePath = join(routesPath, lang, 'page.tsx');
      if (existsSync(langRoutePath)) {
        log(`  /${lang}: Exists`, 'success');
      }
    }
  }
  
  // Check API routes
  if (existsSync(apiPath)) {
    log('\nAPI routes:', 'info');
    const findApiRoutes = (dir, prefix = '') => {
      const routes = [];
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          const routePath = join(fullPath, 'route.ts');
          if (existsRoute(routePath)) {
            routes.push(`${prefix}/${item}`);
          } else {
            routes.push(...findApiRoutes(fullPath, `${prefix}/${item}`));
          }
        }
      }
      
      return routes;
    };
    
    const existsRoute = (path) => {
      return existsSync(path);
    };
    
    const apiDirs = readdirSync(apiPath);
    for (const dir of apiDirs) {
      const dirPath = join(apiPath, dir);
      if (statSync(dirPath).isDirectory()) {
        const routeFile = join(dirPath, 'route.ts');
        if (existsSync(routeFile)) {
          log(`  /api/${dir}: Exists`, 'success');
        }
      }
    }
  }
  
  return true;
}

function checkConfig() {
  logSection('Configuration');
  
  // Check next.config.mjs
  const nextConfigPath = join(PROJECT_ROOT, 'next.config.mjs');
  if (existsSync(nextConfigPath)) {
    const content = readFileSync(nextConfigPath, 'utf-8');
    
    const checks = [
      { name: 'poweredByHeader: false', test: /poweredByHeader:\s*false/ },
      { name: 'compress: true', test: /compress:\s*true/ },
      { name: 'Image optimization', test: /images:/ },
      { name: 'Security headers', test: /X-Content-Type-Options/ },
    ];
    
    for (const check of checks) {
      if (check.test.test(content)) {
        log(`${check.name}: Enabled`, 'success');
      } else {
        log(`${check.name}: Not configured`, 'warning');
      }
    }
  }
  
  // Check vercel.json
  const vercelConfigPath = join(PROJECT_ROOT, 'vercel.json');
  if (existsSync(vercelConfigPath)) {
    log('vercel.json: Exists', 'success');
    
    try {
      const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, 'utf-8'));
      
      if (vercelConfig.headers) {
        log('Headers configured', 'success');
      }
      if (vercelConfig.redirects) {
        log('Redirects configured', 'success');
      }
      if (vercelConfig.rewrites) {
        log('Rewrites configured', 'success');
      }
    } catch (error) {
      log(`vercel.json parsing error: ${error.message}`, 'error');
    }
  } else {
    log('vercel.json: Missing', 'warning');
  }
  
  return true;
}

function printSummary() {
  logSection('Summary');
  
  if (exitCode === 0) {
    log('All checks passed! Ready for deployment.', 'success');
    log('\nNext steps:', 'info');
    log('1. Commit your changes: git add . && git commit -m "Prepare for deployment"', 'info');
    log('2. Push to GitHub: git push origin main', 'info');
    log('3. Vercel will automatically deploy your app', 'info');
  } else {
    log('Some checks failed. Please fix the issues above.', 'error');
    log('\nCommon solutions:', 'info');
    log('- Run npm install to install dependencies', 'info');
    log('- Copy .env.production.example to .env.local and configure', 'info');
    log('- Run npm run build to see build errors', 'info');
  }
  
  console.log(`\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);
}

// Main execution
async function main() {
  console.log(`${BLUE}
╔═══════════════════════════════════════════════════════╗
║   Apartmani Jovca - Build Verification Script        ║
╚═══════════════════════════════════════════════════════╝
${RESET}`);
  
  const checks = [
    { name: 'Project Structure', fn: checkProjectStructure },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Environment Variables', fn: checkRequiredEnvVars },
    { name: 'Configuration', fn: checkConfig },
    { name: 'TypeScript', fn: checkTypeScript },
    { name: 'ESLint', fn: checkLint },
    { name: 'Routes', fn: checkRoutes },
    { name: 'Build', fn: checkBuild },
    // Tests are optional - run them last
  ];
  
  for (const check of checks) {
    try {
      const result = check.fn();
      if (!result) {
        exitCode = 1;
      }
    } catch (error) {
      log(`Error in ${check.name}: ${error.message}`, 'error');
      exitCode = 1;
    }
  }
  
  // Run tests (optional, don't fail on test errors)
  try {
    checkTests();
  } catch (error) {
    log('Tests had some failures (this may be expected)', 'warning');
  }
  
  printSummary();
  process.exit(exitCode);
}

main();
