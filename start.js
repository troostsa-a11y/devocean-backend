import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, 'server.ts');
const websitePath = join(__dirname, 'WebsiteProject', 'server.js');

console.log('🚀 Starting DEVOCEAN Lodge - Dual Server Mode');
console.log('📧 Email Automation: Port 3003');
console.log('🌐 Website Preview: Port 5000');
console.log('');

// Start the email automation server on port 3003
const emailServer = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env, PORT: '3003' }
});

emailServer.on('error', (err) => {
  console.error('Failed to start email automation server:', err);
  process.exit(1);
});

// Start the website preview server on port 5000
setTimeout(() => {
  const websiteServer = spawn('node', [websitePath], {
    stdio: 'inherit',
    cwd: join(__dirname, 'WebsiteProject'),
    env: { ...process.env, PORT: '5000' }
  });

  websiteServer.on('error', (err) => {
    console.error('Failed to start website server:', err);
  });

  websiteServer.on('exit', (code) => {
    console.log('Website server exited with code:', code);
  });
}, 3000); // Wait 3 seconds for email server to start

emailServer.on('exit', (code) => {
  console.log('Email automation server exited with code:', code);
  process.exit(code || 0);
});
