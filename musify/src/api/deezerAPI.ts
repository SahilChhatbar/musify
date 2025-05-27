import axios, { AxiosResponse } from "axios";
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
  try {
    const response: AxiosResponse<SearchResult> = await deezerApi.get(
      "/search",
      {
        params: {
          q: query,
          limit,
          index,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching tracks:", error);
    throw error;
  }
};

export const getTrack = async (id: number): Promise<Track> => {
  try {
    const response: AxiosResponse<Track> = await deezerApi.get(`/track/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching track ${id}:`, error);
    throw error;
  }
};

export const getLyrics = async (
  artist: string,
  title: string
): Promise<string> => {
  try {
    const response = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(
        artist
      )}/${encodeURIComponent(title)}`
    );
    return response.data.lyrics;
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return "Lyrics not available";
  }
};

export default {
  searchTracks,
  getTrack,
  getLyrics,
};