// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
// Try using port 3001 which is less commonly used
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Spotify credentials from environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${PORT}/callback`;
const FRONTEND_URI = process.env.FRONTEND_URI || 'http://localhost:5173';

// Generate random string for state
const generateRandomString = (length: number): string => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Spotify login route
app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-read user-library-modify playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';

  // Redirect to Spotify authorization page
  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID as string,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: state
  }).toString();

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// Callback route that Spotify will redirect to
app.get('/callback', async (req, res) => {
  const code = req.query.code as string || null;
  
  if (code) {
    try {
      // Exchange authorization code for access token
      const tokenResponse = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      });

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Redirect back to frontend with tokens
      const queryParams = new URLSearchParams({
        access_token,
        refresh_token,
        expires_in: expires_in.toString()
      }).toString();

      res.redirect(`${FRONTEND_URI}?${queryParams}`);
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      res.redirect(`${FRONTEND_URI}?error=invalid_token`);
    }
  } else {
    res.redirect(`${FRONTEND_URI}?error=invalid_code`);
  }
});

// Refresh token route
app.post('/refresh_token', async (req, res) => {
  const { refresh_token } = req.body;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(400).json({ error: 'Failed to refresh token' });
  }
});

// Basic test route
app.get('/', (req, res) => {
  res.send('Musify API is running on port ' + PORT);
});

// Start server with better error handling
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Redirect URI: ${REDIRECT_URI}`);
}).on('error', (e: any) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try using a different port by setting the PORT environment variable.`);
    process.exit(1);
  } else {
    console.error(`Error starting server: ${e.message}`);
  }
});