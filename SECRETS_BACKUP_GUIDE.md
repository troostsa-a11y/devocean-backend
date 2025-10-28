# Replit Secrets Backup Guide
**How to Backup and Restore Environment Variables**  
**Last Updated:** October 28, 2025

---

## 🔐 Understanding Replit Secrets

Replit Secrets are encrypted environment variables stored securely in your Repl. They:
- ✅ Are encrypted at rest
- ✅ Are only accessible to your Repl
- ✅ Don't appear in git commits
- ✅ Can't be exported automatically (for security)

**Current Secrets Configured:**
- `DATABASE_URL` - Supabase PostgreSQL connection
- `IMAP_HOST` - Email server hostname
- `IMAP_USER` - Email username
- `IMAP_PASSWORD` - Email password
- Additional secrets for SMTP, admin emails, etc.

---

## 📥 Method 1: Export Using Script (Recommended)

### Step 1: Run Export Script
```bash
node export-secrets.js
```

This creates `.env.backup` with all your actual secret values.

### Step 2: Secure the Backup
**IMMEDIATELY** copy the file to secure storage:
- Password manager (1Password, LastPass, Bitwarden)
- Encrypted USB drive
- Encrypted cloud storage (with encryption key separate)

### Step 3: Delete from Replit
```bash
rm .env.backup
```

**NEVER leave the backup file in Replit!**

---

## 📥 Method 2: Manual Export

### Via Replit UI:
1. Click **Tools** → **Secrets** in Replit
2. For each secret:
   - Click on the secret name
   - Copy the value
   - Paste into your password manager or secure document

### Via Template File:
1. Open `SECRETS_TEMPLATE.env`
2. Copy to a new file (outside of Replit)
3. Fill in actual values from Replit Secrets
4. Save in secure location

---

## 📤 Restoring Secrets

### To Replit:
1. Go to **Tools** → **Secrets**
2. Click **Add new secret**
3. Enter key name and value
4. Repeat for all secrets

### To .env File (Local Development):
1. Create `.env` file in project root
2. Copy secrets from backup
3. Verify `.env` is in `.gitignore`

---

## 📋 Required Secrets Checklist

### ✅ Email Automation (Required)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `RESEND_API_KEY` - Email sending API key
- [ ] `FROM_EMAIL` - Sender email address
- [ ] `IMAP_HOST` - Email receiving server
- [ ] `IMAP_PORT` - Usually 993
- [ ] `IMAP_USER` - Email username
- [ ] `IMAP_PASSWORD` - Email password

### ✅ Email Recipients (Required)
- [ ] `ADMIN_EMAIL` - Admin notifications
- [ ] `TAXI_EMAIL` - Transfer notifications

### ⚙️ Server Configuration (Optional)
- [ ] `PORT` - Server port (default: 3003)
- [ ] `NODE_ENV` - Environment (production/development)

### 🔒 Website Features (Optional)
- [ ] `RECAPTCHA_SECRET_KEY` - Contact form protection

---

## 🔒 Security Best Practices

### DO:
✅ Store backups in encrypted password managers  
✅ Use unique, strong passwords for each service  
✅ Rotate API keys every 90 days  
✅ Delete backup files after storing securely  
✅ Use 2FA on all external services  
✅ Limit access to secrets (need-to-know basis)

### DON'T:
❌ Commit secrets to git  
❌ Share secrets via email or chat  
❌ Store in plain text files  
❌ Leave .env.backup in Replit  
❌ Screenshot secrets  
❌ Store in cloud notes without encryption

---

## 🚨 If Secrets Are Compromised

### Immediate Actions:
1. **Revoke API keys** (Resend, Supabase, etc.)
2. **Generate new keys** in service dashboards
3. **Update Replit Secrets** with new values
4. **Restart server** to use new secrets
5. **Change passwords** for IMAP/SMTP
6. **Monitor for unauthorized access**

### Service-Specific Steps:

**Resend API:**
- Login to https://resend.com
- Go to API Keys
- Revoke old key
- Create new key
- Update `RESEND_API_KEY`

**Supabase Database:**
- Login to https://supabase.com
- Go to Project Settings → Database
- Reset database password
- Update `DATABASE_URL`

**Email (IMAP/SMTP):**
- Login to email provider
- Change account password
- Update `IMAP_PASSWORD` and `SMTP_PASSWORD`

---

## 📖 Secret Value Formats

### DATABASE_URL
```
postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres
```
Example:
```
postgresql://postgres:abc123XYZ@db.xyz.supabase.co:5432/postgres
```

### RESEND_API_KEY
```
re_[random_string]
```
Example:
```
re_AbCd1234EfGh5678IjKl
```

### FROM_EMAIL
```
"Display Name" <email@domain.com>
```
Example:
```
"DEVOCEAN Lodge - Ponta do Ouro" <reservations@devoceanlodge.com>
```

### Email Server Settings
```
IMAP_HOST=mail.yourdomain.com
IMAP_PORT=993
IMAP_USER=reservations@devoceanlodge.com
IMAP_PASSWORD=your_secure_password
```

---

## 🔄 Migration to New Environment

### Scenario: Moving from Replit to VPS/Cloud

1. **Export secrets** using script
2. **Create .env file** on new server
3. **Paste secret values**
4. **Verify permissions:**
   ```bash
   chmod 600 .env
   ```
5. **Test connection:**
   ```bash
   node test-db.js
   ```
6. **Start services:**
   ```bash
   npm run dev
   ```
7. **Delete backup** after verification

---

## 📝 Secrets Audit Log

Keep a log of secret rotations:

| Secret | Last Rotated | Next Rotation | Notes |
|--------|--------------|---------------|-------|
| RESEND_API_KEY | 2025-10-28 | 2026-01-28 | Initial setup |
| DATABASE_URL | 2025-10-28 | N/A | Supabase managed |
| IMAP_PASSWORD | 2025-10-28 | 2026-01-28 | 90-day rotation |

---

## 🆘 Troubleshooting

### "Secret not found" error
**Problem:** Code can't access secret  
**Solution:**
1. Check spelling of secret name
2. Verify secret exists in Replit Secrets
3. Restart the Repl
4. Check `process.env.SECRET_NAME` in code

### "Invalid credentials" error
**Problem:** Secret value is incorrect  
**Solution:**
1. Verify value in Replit Secrets
2. Copy-paste carefully (no extra spaces)
3. Check for special characters
4. Test value in service dashboard

### Export script shows "NOT_SET"
**Problem:** Secret doesn't exist  
**Solution:**
1. Add secret in Replit Secrets panel
2. Run export script again

---

## 📞 Quick Reference

### View Current Secrets (Names Only)
```bash
env | grep -E "^(DATABASE_URL|RESEND|IMAP|SMTP|ADMIN|TAXI)" | sed 's/=.*/=***/'
```

### Export Secrets to Backup
```bash
node export-secrets.js
# Then immediately copy .env.backup to secure storage
# Then delete: rm .env.backup
```

### Test Database Connection
```bash
node test-db.js
```

### Restart Server (Apply New Secrets)
```bash
# In Replit: Click Stop, then Run
# Or use workflow restart
```

---

## ✅ Backup Checklist

Before closing this Repl:
- [ ] Run `node export-secrets.js`
- [ ] Copy `.env.backup` to password manager
- [ ] Delete `.env.backup` from Replit
- [ ] Verify backup is readable
- [ ] Document any new secrets added
- [ ] Update this guide if secrets changed

---

**Remember:** Secrets are the keys to your kingdom. Protect them like your bank password! 🔐
