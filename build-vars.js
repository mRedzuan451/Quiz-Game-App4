// build-vars.js
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

console.log('--- Debugging build-vars.js ---');
console.log('Original script.js content start:', scriptContent.substring(0, 200), '...'); // Log first 200 chars

// List of environment variables and their placeholders
const replacements = {
  '@@FIREBASE_API_KEY@@': process.env.VUE_APP_FIREBASE_API_KEY,
  '@@FIREBASE_AUTH_DOMAIN@@': process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  '@@FIREBASE_PROJECT_ID@@': process.env.VUE_APP_FIREBASE_PROJECT_ID,
  '@@FIREBASE_STORAGE_BUCKET@@': process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  '@@FIREBASE_MESSAGING_SENDER_ID@@': process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  '@@FIREBASE_APP_ID@@': process.env.VUE_APP_FIREBASE_APP_ID,
};

for (const placeholder in replacements) {
  const value = replacements[placeholder] || '[UNDEFINED_ENV_VAR]'; // Indicate if env var is missing
  console.log(`Attempting to replace "${placeholder}" with value: "${value.substring(0, 10)}..." (length: ${value.length})`); // Log partial value for security
  const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  scriptContent = scriptContent.replace(regex, value);
}

fs.writeFileSync(scriptPath, scriptContent, 'utf8');
console.log('Firebase environment variables injected into script.js');
console.log('Modified script.js content start:', scriptContent.substring(0, 200), '...'); // Log modified content start
console.log('--- End build-vars.js Debugging ---');