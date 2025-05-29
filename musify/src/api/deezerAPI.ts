import axios from "axios";
import { Track, SearchResult } from "../types";

const deezerApi = axios.create({
  baseURL: "https://deezerdevs-deezer.p.rapidapi.com",
  headers: {
    "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
    "x-rapidapi-key": "2e97bc1313mshe35d6ec451e07bdp1e00fdjsn7e2b3ff18869",
  },
});

export const searchTracks = async (
  query: string,
  limit: number = 20,
  index: number = 0
): Promise<SearchResult> => {
  const response = await deezerApi.get("/search", {
    params: { q: query, limit, index },
  });
  return response.data;
};

export const getTrack = async (id: number): Promise<Track> => {
  const response = await deezerApi.get(`/track/${id}`);
  return response.data;
};

const lyricsCache = new Map<string, string>();

export const getLyrics = async (artist: string, title: string): Promise<string> => {
  const cacheKey = `${artist}-${title}`;
  
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  try {
    const response = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );
    const lyrics = response.data.lyrics || "Lyrics not available";
    lyricsCache.set(cacheKey, lyrics);
    return lyrics;
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    const fallback = "Lyrics not available";
    lyricsCache.set(cacheKey, fallback);
    return fallback;
  }
};