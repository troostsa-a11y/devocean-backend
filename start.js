import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, 'server.ts');
const websitePath = join(__dirname, 'WebsiteProject', 'server.js');

console.log('🚀 Starting DEVOCEAN Lodge - Website Preview Mode');
console.log('🌐 Website Preview: Port 5000');
console.log('📧 Email Automation: DISABLED (handled by Render)');
console.log('');

let emailServer = null;
let websiteServer = null;
let emailServerRestartCount = 0;
let websiteServerRestartCount = 0;
const MAX_RESTART_ATTEMPTS = 10;
const RESTART_DELAY_BASE = 5000;

function startEmailServer() {
  emailServer = spawn('npx', ['tsx', serverPath], {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, PORT: '3003' }
  });

  emailServer.on('error', (err) => {
    console.error('❌ Failed to start email automation server:', err);
    scheduleEmailServerRestart();
  });

  emailServer.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Email automation server crashed with code: ${code}`);
      scheduleEmailServerRestart();
    } else {
      console.log('Email automation server exited gracefully');
    }
  });
}

function scheduleEmailServerRestart() {
  emailServerRestartCount++;
  
  if (emailServerRestartCount > MAX_RESTART_ATTEMPTS) {
    console.error(`🛑 Email server exceeded ${MAX_RESTART_ATTEMPTS} restart attempts. Stopping.`);
    process.exit(1);
  }

  const delay = Math.min(RESTART_DELAY_BASE * emailServerRestartCount, 60000);
  console.log(`🔄 Restarting email server in ${delay/1000}s (attempt ${emailServerRestartCount}/${MAX_RESTART_ATTEMPTS})...`);
  
  setTimeout(() => {
    console.log('🔄 Restarting email automation server...');
    startEmailServer();
  }, delay);
}

function startWebsiteServer() {
  websiteServer = spawn('node', [websitePath], {
    stdio: 'inherit',
    cwd: join(__dirname, 'WebsiteProject'),
    env: { ...process.env, PORT: '5000' }
  });

  websiteServer.on('error', (err) => {
    console.error('❌ Failed to start website server:', err);
    scheduleWebsiteServerRestart();
  });

  websiteServer.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Website server crashed with code: ${code}`);
      scheduleWebsiteServerRestart();
    } else {
      console.log('Website server exited gracefully');
    }
  });
}

function scheduleWebsiteServerRestart() {
  websiteServerRestartCount++;
  
  if (websiteServerRestartCount > MAX_RESTART_ATTEMPTS) {
    console.error(`🛑 Website server exceeded ${MAX_RESTART_ATTEMPTS} restart attempts. Stopping.`);
    return;
  }

  const delay = Math.min(RESTART_DELAY_BASE * websiteServerRestartCount, 60000);
  console.log(`🔄 Restarting website server in ${delay/1000}s (attempt ${websiteServerRestartCount}/${MAX_RESTART_ATTEMPTS})...`);
  
  setTimeout(() => {
    console.log('🔄 Restarting website server...');
    startWebsiteServer();
  }, delay);
}

// Email automation disabled - now handled by Render
// startEmailServer();

// Start website server immediately (no delay needed since email server is disabled)
startWebsiteServer();

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  if (emailServer) emailServer.kill();
  if (websiteServer) websiteServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  if (emailServer) emailServer.kill();
  if (websiteServer) websiteServer.kill();
  process.exit(0);
});
