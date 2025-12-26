#!/usr/bin/env node

/**
 * Script to send push notifications via Expo Push Notification API
 * Automatically fetches word data from Supabase and formats the notification body
 * 
 * Usage:
 *   node scripts/send-notification.js <EXPO_PUSH_TOKEN> <WORD_ID_OR_SLUG> [TITLE]
 * 
 * WORD_ID_OR_SLUG can be:
 *   - Numeric ID (BIGINT): "123", "456", etc.
 *   - Slug: "a-se-furisa", "dor", etc.
 * 
 * TITLE is optional, defaults to "Cuvântul zilei"
 * 
 * The notification body is automatically formatted as:
 *   - "Word title" - Grammar block (first line)
 *   - Definition (second line)
 * 
 * Examples:
 *   node scripts/send-notification.js ExponentPushToken[xxxxx] 2 "Cuvintești - Cuvântul zilei"
 *   node scripts/send-notification.js ExponentPushToken[xxxxx] "a-chilavi" "Cuvântul zilei"
 */

const https = require('https');
require('dotenv').config();

const token = process.argv[2];
const wordId = process.argv[3];
const title = process.argv[4] || 'Cuvântul zilei';

if (!token || !wordId) {
  console.error('Usage: node scripts/send-notification.js <EXPO_PUSH_TOKEN> <WORD_ID_OR_SLUG> [TITLE]');
  console.error('WORD_ID_OR_SLUG can be numeric ID (e.g., "123") or slug (e.g., "a-se-furisa")');
  console.error('TITLE is optional, defaults to "Cuvântul zilei"');
  console.error('Examples:');
  console.error('  node scripts/send-notification.js ExponentPushToken[xxxxx] 2 "Cuvintești - Cuvântul zilei"');
  console.error('  node scripts/send-notification.js ExponentPushToken[xxxxx] "a-chilavi" "Cuvântul zilei"');
  process.exit(1);
}

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
// Use service role key if available for inserting notifications (bypasses RLS)
// If not set, falls back to anon key (requires proper RLS policy)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ Using service role key (RLS bypassed)');
} else {
  console.log('⚠️  Using anon key (RLS policy must allow inserts)');
  console.log('   Consider setting SUPABASE_SERVICE_ROLE_KEY in .env for better security');
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Supabase credentials not found in environment variables');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

// Function to fetch word from Supabase
function fetchWordFromSupabase(wordId) {
  return new Promise((resolve, reject) => {
    // Check if wordId is numeric (BIGINT ID) or a slug
    const isNumericId = /^\d+$/.test(wordId);
    const queryField = isNumericId ? 'id' : 'slug';
    const queryValue = isNumericId ? parseInt(wordId, 10) : wordId;
    
    // Build the query URL using PostgREST format
    const supabaseUrl = new URL(SUPABASE_URL);
    const path = `/rest/v1/cuvinteziCuvinte`;
    // PostgREST format: field=eq.value for filtering
    const filterValue = isNumericId ? queryValue : encodeURIComponent(queryValue);
    const queryString = `${queryField}=eq.${filterValue}&select=id,title,grammar_block,definition&limit=1`;
    
    const options = {
      hostname: supabaseUrl.hostname,
      path: `${path}?${queryString}`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const words = JSON.parse(data);
            if (words && words.length > 0) {
              resolve(words[0]);
            } else {
              reject(new Error(`Word not found: ${wordId}`));
            }
          } else {
            reject(new Error(`Supabase API error: ${res.statusCode} - ${data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request error: ${e.message}`));
    });

    req.end();
  });
}

// Function to find user_id from push token
function findUserIdFromToken(token) {
  return new Promise((resolve) => {
    const supabaseUrl = new URL(SUPABASE_URL);
    const path = `/rest/v1/cuvinteziPushTokens`;
    const queryString = `token=eq.${encodeURIComponent(token)}&select=user_id&limit=1`;
    
    const options = {
      hostname: supabaseUrl.hostname,
      path: `${path}?${queryString}`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const tokens = JSON.parse(data);
            if (tokens && tokens.length > 0 && tokens[0].user_id) {
              resolve(tokens[0].user_id);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => {
      resolve(null);
    });

    req.end();
  });
}

// Function to save notification to Supabase
function saveNotificationToSupabase(notificationData) {
  return new Promise((resolve, reject) => {
    const supabaseUrl = new URL(SUPABASE_URL);
    const path = `/rest/v1/cuvinteziNotifications`;
    
    const postData = JSON.stringify(notificationData);
    
    const options = {
      hostname: supabaseUrl.hostname,
      path: path,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Prefer': 'return=representation',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 201 || res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Failed to save notification: ${res.statusCode} - ${data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request error: ${e.message}`));
    });

    req.write(postData);
    req.end();
  });
}

// Function to send notification
function sendNotification(token, title, body, wordId) {
  return new Promise((resolve, reject) => {
    const message = {
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: {
        type: 'word',
        wordId: String(wordId), // Ensure wordId is a string
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
          // Expo API returns an array of results in result.data
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            const firstResult = result.data[0];
            if (firstResult.status === 'ok') {
              resolve(result);
            } else {
              reject(new Error(`Failed to send notification: ${JSON.stringify(result)}`));
            }
          } else if (result.data && result.data.status === 'ok') {
            // Handle non-array response format (shouldn't happen, but just in case)
            resolve(result);
          } else {
            reject(new Error(`Failed to send notification: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          reject(new Error(`Error parsing response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request error: ${e.message}`));
    });

    req.write(postData);
    req.end();
  });
}

// Main execution
(async () => {
  try {
    console.log(`📖 Fetching word data for: ${wordId}...`);
    const word = await fetchWordFromSupabase(wordId);
    
    console.log(`✅ Found word: ${word.title}`);
    
    // Format the body: "title" - grammar_block (first line), then definition (second line)
    const firstLine = word.grammar_block 
      ? `${word.title} - ${word.grammar_block}`
      : word.title;
    const body = `${firstLine}\n${word.definition || ''}`;
    
    // Find user_id from token (if exists)
    console.log(`🔍 Looking up user for token...`);
    const userId = await findUserIdFromToken(token);
    
    console.log(`📤 Sending notification...`);
    const result = await sendNotification(token, title, body, word.id);
    
    // Handle array response from Expo API
    const notificationResult = Array.isArray(result.data) ? result.data[0] : result.data;
    const ticketId = notificationResult.id;
    
    // Save notification to database
    console.log(`💾 Saving notification to database...`);
    const notificationData = {
      word_id: word.id,
      word_title: word.title,
      token: token,
      user_id: userId || null,
      sent_at: new Date().toISOString(),
      notification_title: title,
      notification_body: body,
      ticket_id: ticketId,
    };
    
    await saveNotificationToSupabase(notificationData);
    
    console.log('✅ Notification sent and saved successfully!');
    console.log(`Ticket ID: ${ticketId}`);
    if (userId) {
      console.log(`User ID: ${userId}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();



