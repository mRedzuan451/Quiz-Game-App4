// build-vars.js
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// List of environment variables and their placeholders
const replacements = {
  '@@FIREBASE_API_KEY@@': process.env.VUE_APP_FIREBASE_API_KEY,
  '@@FIREBASE_AUTH_DOMAIN@@': process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  '@@FIREBASE_PROJECT_ID@@': process.env.VUE_APP_FIREBASE_PROJECT_ID,
  '@@FIREBASE_STORAGE_BUCKET@@': process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  '@@FIREBASE_MESSAGING_SENDER_ID@@': process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  '@@FIREBASE_APP_ID@@': process.env.VUE_APP_FIREBASE_APP_ID,
  // Add measurementId if you use it:
  // '@@FIREBASE_MEASUREMENT_ID@@': process.env.VUE_APP_FIREBASE_MEASUREMENT_ID,
};

// Perform replacements
for (const placeholder in replacements) {
  const value = replacements[placeholder] || ''; // Use empty string if env var is undefined
  // Using global regex replacement
  const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  scriptContent = scriptContent.replace(regex, value);
}

// Write the modified content back to script.js
fs.writeFileSync(scriptPath, scriptContent, 'utf8');

console.log('Firebase environment variables injected into script.js');