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
    
    const storedTokens = localStorage.getItem('spotifyTokens');
    if (storedTokens) {
      return JSON.parse(storedTokens);
    }
    
    return null;
  };

  const isTokenExpired = (tokens: SpotifyTokens): boolean => {
    const { accessToken, timestamp, expiresIn } = tokens;
    if (!accessToken || !timestamp) return true;
    
    const millisecondsElapsed = Date.now() - timestamp;
    const expiresInMs = expiresIn * 1000;
    
    return millisecondsElapsed > expiresInMs - 300000;
  };

  const refreshToken = async () => {
    if (!tokens?.refreshToken) return null;
    
    try {
      const response = await axios.post('http://localhost:3001/refresh_token', {
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

  const fetchProfile = async (tokenToUse: SpotifyTokens) => {
    try {
      const response = await axios.post('http://localhost:3001/api/spotify/me', {
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

  const login = () => {
    window.location.href = 'http://localhost:3001/login';
  };

  const logout = () => {
    localStorage.removeItem('spotifyTokens');
    setTokens(null);
    setProfile(null);
    window.location.href = '/';
  };

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

  const spotifyApi = async (endpoint: string, method = 'GET', data = {}) => {
    if (!tokens) return null;
    
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