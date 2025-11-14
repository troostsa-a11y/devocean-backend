#!/usr/bin/env node
/**
 * Replit Secrets Export Tool
 * 
 * This script helps you create a backup of your Replit Secrets
 * by generating a .env file with actual values.
 * 
 * SECURITY WARNING:
 * - The generated .env file will contain SENSITIVE data
 * - Store it in a SECURE location (password manager, encrypted drive)
 * - NEVER commit it to git
 * - DELETE it after backing up to secure storage
 * 
 * Usage:
 *   node export-secrets.js
 * 
 * Output:
 *   .env.backup - Contains actual secret values
 */

import { writeFileSync } from 'fs';

console.log('🔐 DEVOCEAN Lodge - Replit Secrets Export Tool');
console.log('================================================\n');

// List of secrets to export
const secrets = [
  'DATABASE_URL',
  'RESEND_API_KEY',
  'FROM_EMAIL',
  'IMAP_HOST',
  'IMAP_PORT',
  'IMAP_USER',
  'IMAP_PASSWORD',
  'IMAP_TLS',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'ADMIN_EMAIL',
  'TAXI_EMAIL',
  'PORT',
  'NODE_ENV',
  'RECAPTCHA_SECRET_KEY'
];

let envContent = `# DEVOCEAN Lodge - Secrets Backup
# Generated: ${new Date().toISOString()}
# 
# ⚠️  SECURITY WARNING ⚠️
# This file contains SENSITIVE credentials!
# - Store in secure location (password manager, encrypted drive)
# - NEVER commit to git
# - DELETE after backing up
#
# To restore:
# 1. Add these secrets to Replit Secrets panel
# 2. Or create .env file for local development
# 3. DELETE this backup file after restoration

`;

let foundSecrets = 0;
let missingSecrets = 0;

console.log('Exporting secrets...\n');

secrets.forEach(secret => {
  const value = process.env[secret];
  
  if (value) {
    envContent += `${secret}=${value}\n`;
    console.log(`✅ ${secret} - exported`);
    foundSecrets++;
  } else {
    envContent += `# ${secret}=NOT_SET\n`;
    console.log(`⚠️  ${secret} - not set`);
    missingSecrets++;
  }
});

// Write to file
const filename = '.env.backup';
writeFileSync(filename, envContent);

console.log('\n================================================');
console.log(`📄 Backup created: ${filename}`);
console.log(`✅ Exported: ${foundSecrets} secrets`);
console.log(`⚠️  Missing: ${missingSecrets} secrets`);
console.log('\n⚠️  IMPORTANT SECURITY STEPS:');
console.log('1. Copy .env.backup to secure storage');
console.log('2. Verify backup is readable');
console.log('3. DELETE .env.backup from Replit');
console.log('\nCommand to delete:');
console.log('   rm .env.backup');
console.log('================================================\n');
