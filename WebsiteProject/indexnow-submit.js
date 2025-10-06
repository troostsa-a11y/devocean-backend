#!/usr/bin/env node

import https from 'https';

const INDEXNOW_KEY = '4339cd9fe9f2766ae7f04b21f3848dec';
const HOST = 'devoceanlodge.com';

const allUrls = [
  'https://devoceanlodge.com/',
  'https://devoceanlodge.com/privacy.html',
  'https://devoceanlodge.com/cookies.html',
  'https://devoceanlodge.com/terms.html',
  'https://devoceanlodge.com/GDPR.html',
  'https://devoceanlodge.com/CRIC.html'
];

function submitToIndexNow(urls) {
  const payload = JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls
  });

  const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Successfully submitted URLs to IndexNow');
      console.log(`   Submitted ${urls.length} URL(s)`);
    } else {
      console.log('❌ Submission failed');
    }

    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error.message);
  });

  req.write(payload);
  req.end();
}

const urlsToSubmit = process.argv.slice(2);

if (urlsToSubmit.length > 0) {
  console.log(`Submitting ${urlsToSubmit.length} custom URL(s)...`);
  submitToIndexNow(urlsToSubmit);
} else {
  console.log('Submitting all site URLs...');
  submitToIndexNow(allUrls);
}
