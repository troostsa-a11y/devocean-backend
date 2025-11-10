import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, 'server.ts');

console.log('🚀 Starting DEVOCEAN Lodge - Production Mode');
console.log('📧 Email Automation Server: Port 3003');
console.log('🌐 Contact Forms: /api/contact, /api/experience-inquiry');
console.log('');

// Start ONLY the email automation server on port 3003
const emailServer = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env, PORT: '3003', NODE_ENV: 'production' }
});

emailServer.on('error', (err) => {
  console.error('Failed to start email automation server:', err);
  process.exit(1);
});

emailServer.on('exit', (code) => {
  console.log('Email automation server exited with code:', code);
  process.exit(code || 0);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  emailServer.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  emailServer.kill('SIGINT');
});
