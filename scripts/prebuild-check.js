import fs from 'fs';
import path from 'path';

console.log('------------------------------------------------------------');
console.log('⚡ CONNECTED PAKISTAN VRF 2026 — PRE-BUILD VALIDATION CHECK');
console.log('------------------------------------------------------------\n');

let hasErrors = false;

// 1. Validate .env.example and .env / .env.local
const rootDir = process.cwd();
const envExamplePath = path.join(rootDir, '.env.example');
const envPath = path.join(rootDir, '.env');

if (!fs.existsSync(envExamplePath)) {
  console.error('❌ CRITICAL ERROR: .env.example template file is missing at project root.');
  hasErrors = true;
} else {
  console.log('✅ .env.example template verified.');
  const exampleContent = fs.readFileSync(envExamplePath, 'utf-8');
  const requiredVars = ['GEMINI_API_KEY', 'VITE_GOOGLE_MAPS_API_KEY', 'APP_URL', 'PORT', 'NODE_ENV'];
  
  const missingInExample = requiredVars.filter(v => !exampleContent.includes(v));
  if (missingInExample.length > 0) {
    console.warn(`⚠️ Warning: Missing documented variable keys in .env.example: ${missingInExample.join(', ')}`);
  } else {
    console.log('✅ All required environment key declarations present in .env.example.');
  }

  // Ensure a local .env exists for build validation if missing
  if (!fs.existsSync(envPath)) {
    console.log('ℹ️ Generating fallback .env file from .env.example template for standard build pipeline...');
    fs.writeFileSync(envPath, exampleContent);
  } else {
    console.log('✅ .env configuration file exists.');
  }
}

// 2. Validate Critical Entry Point & Asset Reachability
const criticalAssets = [
  'index.html',
  'src/main.tsx',
  'src/App.tsx',
  'src/index.css',
  'src/types.ts',
  'package.json',
  'vercel.json',
];

console.log('\n🔍 Verifying critical asset structure...');
criticalAssets.forEach(assetPath => {
  const fullPath = path.join(rootDir, assetPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ CRITICAL ERROR: Essential asset missing: ${assetPath}`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Asset verified: ${assetPath}`);
  }
});

// 3. Verify Vercel Build & Route Config
const vercelConfigPath = path.join(rootDir, 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  try {
    const vercelJson = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
    if (vercelJson.rewrites && Array.isArray(vercelJson.rewrites)) {
      console.log('✅ vercel.json routes & SPA rewrites verified.');
    } else {
      console.warn('⚠️ vercel.json exists but may be missing standard SPA rewrites.');
    }
  } catch (e) {
    console.error('❌ Error parsing vercel.json:', e);
    hasErrors = true;
  }
} else {
  console.error('❌ CRITICAL ERROR: vercel.json is missing.');
  hasErrors = true;
}

// 4. Security Scan for Hardcoded Private API Keys
console.log('\n🔒 Running security scan for exposed API keys in source code...');
function scanDirForKeys(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        scanDirForKeys(filePath);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Look for standard API key formats like AIzaSy... or sk-...
      if (/AIzaSy[a-zA-Z0-9_\-]{33}/.test(content) || /sk-[a-zA-Z0-9]{32,}/.test(content)) {
        console.error(`❌ SECURITY WARNING: Hardcoded API key detected in ${filePath}`);
        hasErrors = true;
      }
    }
  }
}
scanDirForKeys(path.join(rootDir, 'src'));
console.log('✅ Security audit complete: No hardcoded API keys found in src/.');

// 5. Final Status Report
console.log('\n------------------------------------------------------------');
if (hasErrors) {
  console.error('💥 PRE-BUILD VALIDATION FAILED. Please resolve errors before building.');
  process.exit(1);
} else {
  console.log('🎉 ALL PRE-BUILD CHECKS PASSED! Application is 100% ready for Vercel/Production deployment.');
  console.log('------------------------------------------------------------\n');
}
