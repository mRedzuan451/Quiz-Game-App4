// build-vars.js
const fs = require('fs');
const path = require('path');

// Target the new main.js file
const scriptPath = path.join(__dirname, 'js', 'main.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

console.log('--- Debugging build-vars.js ---');
console.log('Original js/main.js content start:', scriptContent.substring(0, 200), '...');

// List of environment variables and their placeholders
const replacements = {
  '@@FIREBASE_API_KEY@@': process.env.VUE_APP_FIREBASE_API_KEY,
  '@@FIREBASE_AUTH_DOMAIN@@': process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  '@@FIREBASE_PROJECT_ID@@': process.env.VUE_APP_FIREBASE_PROJECT_ID,
  '@@FIREBASE_STORAGE_BUCKET@@': process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  '@@FIREBASE_MESSAGING_SENDER_ID@@': process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  '@@FIREBASE_APP_ID@@': process.env.VUE_APP_FIREBASE_APP_ID,
};

// Perform replacements
for (const placeholder in replacements) {
  const value = replacements[placeholder] || '[UNDEFINED_ENV_VAR]';
  console.log(`Attempting to replace "${placeholder}" with value: "${value.substring(0, 10)}..." (length: ${value.length})`);
  const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  scriptContent = scriptContent.replace(regex, value);
}

// Write the modified content back to js/main.js
fs.writeFileSync(scriptPath, scriptContent, 'utf8');

console.log('Firebase environment variables injected into js/main.js');
console.log('Modified js/main.js content start:', scriptContent.substring(0, 200), '...');
console.log('--- End build-vars.js Debugging ---');