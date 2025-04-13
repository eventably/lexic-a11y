const { execSync, spawn } = require('child_process');

// Function to open a browser
function openBrowser(url) {
  const platform = process.platform;
  try {
    if (platform === 'win32') {
      execSync(`start ${url}`);
    } else if (platform === 'darwin') {
      execSync(`open ${url}`);
    } else {
      execSync(`xdg-open ${url}`);
    }
    console.log(`Browser opened to ${url}`);
  } catch (error) {
    console.log(`Could not automatically open browser. Please navigate to ${url}`);
  }
}

console.log('Starting Lexical A11y Editor development server...');

// Start React app
const port = 4000;
const reactApp = spawn('npx', ['react-scripts', 'start'], {
  env: { ...process.env, PORT: port, BROWSER: 'none' },
  stdio: 'inherit',
  shell: true
});

console.log(`React app starting on port ${port}...`);
console.log('Opening browser in 3 seconds...');

// Open browser after a delay
setTimeout(() => {
  openBrowser(`http://localhost:${port}`);
}, 3000);

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down...');
  reactApp.kill();
  process.exit(0);
});