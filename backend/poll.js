const express = require('express');
const { google } = require('googleapis');
const axios = require('axios');

const app = express();
const PORT = 5000;

// OAuth2 credentials
const CLIENT_ID = "1091167326872-fuvuoqkvneg80ppb5ksnp9cdea1lajck.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:5000/oauth2callback";

// Initialize OAuth2 client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Store the last checked message ID to track new emails
let lastCheckedMessageId = null;

// Middleware to enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Home route with authentication link
app.get('/', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent'
  });
  
  res.send(`
    <h1>Gmail Polling Service</h1>
    <a href="${authUrl}">Authenticate with Gmail</a>
  `);
});

// OAuth callback handler
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    console.log('Authentication successful! Refresh token:', tokens.refresh_token);
    res.send('Authentication successful! You can close this window.');
    
    // Start polling after successful authentication
    startPolling();
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
});

// Function to check for new emails
async function checkNewEmails() {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    
    // Get list of unread messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 10
    });

    if (response.data.messages && response.data.messages.length > 0) {
      const latestMessageId = response.data.messages[0].id;
      
      // Check if this is a new message
      if (latestMessageId !== lastCheckedMessageId) {
        lastCheckedMessageId = latestMessageId;
        
        // Get the full message details
        const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id: latestMessageId
        });

        // Extract subject and sender from headers
        const headers = messageDetails.data.payload.headers;
        const subject = headers.find(header => header.name === 'Subject')?.value || 'No Subject';
        const from = headers.find(header => header.name === 'From')?.value || 'Unknown Sender';
        const snippet = messageDetails.data.snippet;

        console.log('\n🔔 New Email Received:');
        console.log('From:', from);
        console.log('Subject:', subject);
        console.log('Snippet:', snippet);
        console.log('─'.repeat(50));

        // Send the email details to localhost:3000/emailset
        await axios.post('http://localhost:3000/emailset', {
          subject,
          from,
          snippet
        });
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('Token expired. Please re-authenticate.');
      console.log('Visit http://localhost:5000 to authenticate again');
    } else {
      console.error('Error checking emails:', error.message);
    }
  }
}

// Function to start polling
function startPolling() {
  console.log('📫 Starting email polling service...');
  // Check immediately
  checkNewEmails();
  // Then check every 10 seconds
  setInterval(checkNewEmails, 5000);
}

// Start the server
app.listen(PORT, () => {
  console.log(`
🚀 Server running on http://localhost:${PORT}
📧 Visit http://localhost:${PORT} to authenticate and start email polling
  `);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});