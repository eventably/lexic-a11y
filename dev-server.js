#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

console.log('Starting development server for lexic-a11y...');

try {
  // Kill any existing process on port 4000
  try {
    const platform = process.platform;
    if (platform === 'win32') {
      execSync('netstat -ano | findstr :4000', { stdio: 'pipe' })
        .toString()
        .split('\n')
        .forEach(line => {
          const match = /(\d+)$/.exec(line.trim());
          if (match) {
            try {
              execSync(`taskkill /F /PID ${match[1]}`);
              console.log(`Killed process ${match[1]} on port 4000`);
            } catch (e) {}
          }
        });
    } else {
      // For macOS and Linux
      try {
        const pid = execSync('lsof -ti:4000', { stdio: 'pipe' }).toString().trim();
        if (pid) {
          execSync(`kill -9 ${pid}`);
          console.log(`Killed process ${pid} on port 4000`);
        }
      } catch (e) {
        // No process running on port 4000
      }
    }
  } catch (error) {
    // Ignore errors when checking for processes
  }

  // Start React development server
  console.log('Starting React app on port 4000...');
  const reactProcess = spawn('npx', ['react-scripts', 'start'], {
    env: { ...process.env, PORT: 4000, BROWSER: 'none' },
    stdio: 'inherit',
    shell: true
  });

  // Open browser after delay
  setTimeout(() => {
    const platform = process.platform;
    try {
      if (platform === 'win32') {
        execSync('start http://localhost:4000');
      } else if (platform === 'darwin') {
        execSync('open http://localhost:4000');
      } else {
        execSync('xdg-open http://localhost:4000');
      }
      console.log('Browser opened to http://localhost:4000');
    } catch (error) {
      console.log('Could not automatically open browser. Please navigate to http://localhost:4000');
    }
  }, 3000);

  // Handle process exit
  process.on('SIGINT', () => {
    console.log('Shutting down development server...');
    reactProcess.kill();
    process.exit(0);
  });

} catch (error) {
  console.error('Error starting development server:', error);
  process.exit(1);
}