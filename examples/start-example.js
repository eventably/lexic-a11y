#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define the port for the example server
const PORT = 4321;

// Kill any process running on the port
try {
  console.log(`Checking for processes on port ${PORT}...`);
  if (process.platform === 'win32') {
    execSync(`netstat -ano | findstr :${PORT}`, { stdio: 'pipe' });
    // Would need to parse the output and kill the PID on Windows
  } else {
    // For macOS/Linux
    const output = execSync(`lsof -i:${PORT} -t`, { stdio: 'pipe' }).toString();
    if (output.trim()) {
      console.log(`Killing process on port ${PORT}...`);
      execSync(`kill -9 ${output.trim()}`);
    }
  }
} catch (error) {
  // No process running on that port, which is fine
}

// Start the Parcel server
console.log('Starting example server...');
try {
  execSync(`npx parcel serve examples/index.html --port ${PORT} --open`, { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
} catch (error) {
  console.error('Failed to start example server:', error);
}