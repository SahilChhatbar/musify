import { useEffect, useState } from 'react';
import axios from 'axios';
import { SpotifyTokens } from '../types/types';

export const useSpotifyAuth = () => {
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getTokensFromUrl = (): SpotifyTokens | null => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');
    
    // Clear URL params if present
    if (accessToken && refreshToken && expiresIn) {
      window.history.replaceState({}, document.title, '/');
      
      const tokens: SpotifyTokens = {
        accessToken,
        refreshToken,
        expiresIn: parseInt(expiresIn),
        timestamp: Date.now()
      };
      
      localStorage.setItem('spotifyTokens', JSON.stringify(tokens));
      return tokens;
    }
    
    // Check localStorage
    const storedTokens = localStorage.getItem('spotifyTokens');
    if (storedTokens) {
      return JSON.parse(storedTokens);
    }
    
    return null;
  };

  // Check if token needs refreshing
  const isTokenExpired = (tokens: SpotifyTokens): boolean => {
    const { accessToken, timestamp, expiresIn } = tokens;
    if (!accessToken || !timestamp) return true;
    
    const millisecondsElapsed = Date.now() - timestamp;
    const expiresInMs = expiresIn * 1000;
    
    // Add a buffer of 5 minutes
    return millisecondsElapsed > expiresInMs - 300000;
  };

  // Handle token refresh
  const refreshToken = async () => {
    if (!tokens?.refreshToken) return null;
    
    try {
      const response = await axios.post('http://localhost:5000/refresh_token', {
        refresh_token: tokens.refreshToken
      });
      
      const { access_token, expires_in } = response.data;
      
      const updatedTokens: SpotifyTokens = {
        ...tokens,
        accessToken: access_token,
        expiresIn: expires_in,
        timestamp: Date.now()
      };
      
      localStorage.setItem('spotifyTokens', JSON.stringify(updatedTokens));
      setTokens(updatedTokens);
      return updatedTokens;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
      return null;
    }
  };

  // Fetch user profile from Spotify
  const fetchProfile = async (tokenToUse: SpotifyTokens) => {
    try {
      const response = await axios.post('http://localhost:5000/api/spotify/me', {
        access_token: tokenToUse.accessToken
      });
      
      setProfile(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      return null;
    }
  };

  // Login handler
  const login = () => {
    window.location.href = 'http://localhost:5000/login';
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('spotifyTokens');
    setTokens(null);
    setProfile(null);
    window.location.href = '/';
  };

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        let currentTokens = getTokensFromUrl();
        
        if (currentTokens) {
          if (isTokenExpired(currentTokens)) {
            currentTokens = await refreshToken();
          }
          
          if (currentTokens) {
            setTokens(currentTokens);
            await fetchProfile(currentTokens);
          }
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Make authenticated API requests to Spotify
  const spotifyApi = async (endpoint: string, method = 'GET', data = {}) => {
    if (!tokens) return null;
    
    // Check if token needs refresh
    let currentTokens = tokens;
    if (isTokenExpired(currentTokens)) {
      const refreshedTokens = await refreshToken();
      if (!refreshedTokens) return null;
      currentTokens = refreshedTokens;
    }
    
    try {
      const response = await axios.post(`http://localhost:5000/api/spotify/${endpoint}`, {
        access_token: currentTokens.accessToken,
        method,
        data
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error in Spotify API call to ${endpoint}:`, error);
      return null;
    }
  };

  return {
    tokens,
    profile,
    loading,
    login,
    logout,
    spotifyApi,
    isAuthenticated: !!tokens
  };
};