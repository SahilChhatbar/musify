import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import { randomBytes } from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5000/callback';
const FRONTEND_URI = process.env.FRONTEND_URI || 'http://localhost:3000';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const stateKeys = new Map();

app.get('/', (_req, res) => {
  res.send('Server is running');
});

app.get('/login', (req, res) => {
  const state = randomBytes(16).toString('hex');
  
  stateKeys.set(state, true);
  
  const scope = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'user-library-read',
    'playlist-read-private',
    'playlist-read-collaborative',
  ].join(' ');

  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID as string,
    scope,
    redirect_uri: REDIRECT_URI,
    state
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!state || !stateKeys.has(state as string)) {
    return res.status(400).send('State mismatch error. Please try again.');
  }
  
  stateKeys.delete(state as string);

  try {
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    const queryParams = new URLSearchParams({
      access_token,
      refresh_token,
      expires_in: expires_in.toString()
    });

    res.redirect(`${FRONTEND_URI}/?${queryParams}`);
  } catch (error) {
    console.error('Error during token exchange:', error);
    res.redirect(`${FRONTEND_URI}/error?message=Authentication failed`);
  }
});

app.post('/refresh_token', async (req, res) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(400).send({ error: 'Refresh token is required' });
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'refresh_token',
        refresh_token
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      }
    });

    res.send(response.data);
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).send({ error: 'Failed to refresh token' });
  }
});

app.post('/api/spotify/:endpoint(*)', async (req, res) => {
  const { endpoint } = req.params;
  const { access_token } = req.body;
  
  if (!access_token) {
    return res.status(401).send({ error: 'Access token is required' });
  }

  try {
    const response = await axios({
      method: req.method,
      url: `https://api.spotify.com/v1/${endpoint}`,
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      data: req.body.data || {}
    });
    
    res.send(response.data);
  } catch (error:any) {
    console.error(`Error proxying to Spotify API (${endpoint}):`, error.response?.data || error.message);
    res.status(error.response?.status || 500).send(error.response?.data || { error: 'API request failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});