#!/usr/bin/env node

/**
 * Script to send push notifications via Expo Push Notification API
 * 
 * Usage:
 *   node scripts/send-notification.js <EXPO_PUSH_TOKEN> <WORD_ID> [TITLE] [BODY]
 * 
 * Example:
 *   node scripts/send-notification.js ExponentPushToken[xxxxx] a-se-furisa-1 "Cuvântul zilei" "Învață cuvântul: a se furișa"
 */

const https = require('https');

const token = process.argv[2];
const wordId = process.argv[3];
const title = process.argv[4] || 'Cuvântul zilei';
const body = process.argv[5] || `Învață un cuvânt nou!`;

if (!token || !wordId) {
  console.error('Usage: node scripts/send-notification.js <EXPO_PUSH_TOKEN> <WORD_ID> [TITLE] [BODY]');
  console.error('Example: node scripts/send-notification.js ExponentPushToken[xxxxx] a-se-furisa-1');
  process.exit(1);
}

const message = {
  to: token,
  sound: 'default',
  title: title,
  body: body,
  data: {
    type: 'word',
    wordId: wordId,
  },
  priority: 'high',
};

const postData = JSON.stringify([message]);

const options = {
  hostname: 'exp.host',
  path: '/--/api/v2/push/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate',
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.data && result.data.status === 'ok') {
        console.log('✅ Notification sent successfully!');
        console.log('Ticket ID:', result.data.id);
      } else {
        console.error('❌ Failed to send notification:', result);
      }
    } catch (e) {
      console.error('❌ Error parsing response:', e);
      console.error('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();


