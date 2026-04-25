import youtubeSearch from 'youtube-search-api';
import { google } from 'googleapis';

const youtubeApi = google.youtube('v3');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  channelTitle: string;
}

export const searchYouTube = async (query: string): Promise<YouTubeVideo[]> => {
  // Enhance query to find full courses specifically
  const enhancedQuery = `${query} full course tutorial`;

  // 1. Try Official API first
  if (YOUTUBE_API_KEY) {
    try {
      const response = await youtubeApi.search.list({
        key: YOUTUBE_API_KEY,
        part: ['snippet'],
        q: enhancedQuery,
        maxResults: 12,
        type: ['video'],
        videoDuration: 'long', // Only videos longer than 20 minutes
        relevanceLanguage: 'en'
      });

      const mapped = (response.data.items || []).map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle
      }));

      return mapped;
    } catch (error: any) {
      console.warn('⚠️ Official YouTube API failed (Fallback triggered):', error.message || error);
    }
  }

  // 2. Fallback to scraping-based search
  try {
    const results = await Promise.race([
      youtubeSearch.GetListByKeyword(enhancedQuery, false, 12, [{type: "video"}]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Scraping timeout')), 10000))
    ]) as any;
    const mapped = results.items.map((item: any) => {
      const id = item.id?.videoId || item.id || item.videoId;
      return {
        id: typeof id === 'string' ? id : (id?.videoId || ''),
        title: item.title,
        thumbnail: item.thumbnail?.thumbnails?.[0]?.url || '',
        description: item.descriptionSnippet?.[0]?.text || '',
        channelTitle: item.channelTitle || 'YouTube'
      };
    });
    
    return mapped;
  } catch (fallbackError) {
    console.error('❌ Critical: Both YouTube search methods failed:', fallbackError);
    return [];
  }
};

export const getVideoDetails = async (videoId: string) => {
  if (YOUTUBE_API_KEY) {
    try {
      const response = await youtubeApi.videos.list({
        key: YOUTUBE_API_KEY,
        part: ['snippet', 'contentDetails'],
        id: [videoId]
      });
      const item = response.data.items?.[0];
      if (item) {
        return {
          id: item.id,
          title: item.snippet?.title,
          description: item.snippet?.description,
          thumbnail: item.snippet?.thumbnails?.high?.url,
          channelTitle: item.snippet?.channelTitle
        };
      }
    } catch (error) {
      console.warn('⚠️ Official API details fetch failed, trying fallback.');
    }
  }

  try {
    const details = await youtubeSearch.GetVideoDetails(videoId);
    return details;
  } catch (error) {
    console.error('YouTube Details Error:', error);
    return null;
  }
};
