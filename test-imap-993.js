import 'dotenv/config';
import imaps from 'imap-simple';

console.log('📧 Testing IMAP connection on port 993...\n');

const config = {
  imap: {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST || process.env.MAIL_HOST,
    port: 993,  // Standard IMAP SSL port
    tls: true,
    authTimeout: 10000,
    tlsOptions: { rejectUnauthorized: false }
  }
};

console.log('Config:', {
  host: config.imap.host,
  port: config.imap.port,
  user: config.imap.user,
  tls: config.imap.tls
});

try {
  console.log('\n🔌 Connecting to IMAP server...');
  const connection = await imaps.connect(config);
  console.log('✅ Connected successfully!');
  
  console.log('\n📂 Opening INBOX...');
  await connection.openBox('INBOX');
  console.log('✅ INBOX opened');
  
  console.log('\n🔍 Searching for unseen emails...');
  const searchCriteria = ['UNSEEN'];
  const fetchOptions = {
    bodies: ['HEADER', 'TEXT'],
    markSeen: false
  };
  
  const messages = await connection.search(searchCriteria, fetchOptions);
  console.log(`✅ Found ${messages.length} unseen email(s)`);
  
  if (messages.length > 0) {
    console.log('\n📨 Unseen messages:');
    for (let i = 0; i < Math.min(messages.length, 5); i++) {
      const msg = messages[i];
      const header = msg.parts.find(part => part.which === 'HEADER');
      if (header && header.body) {
        console.log(`\n  ${i + 1}. Subject: ${header.body.subject?.[0] || 'N/A'}`);
        console.log(`     From: ${header.body.from?.[0] || 'N/A'}`);
        console.log(`     Date: ${header.body.date?.[0] || 'N/A'}`);
      }
    }
  }
  
  console.log('\n🔌 Closing connection...');
  connection.end();
  console.log('✅ Test completed successfully!');
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ IMAP Test Failed:');
  console.error('Error:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
