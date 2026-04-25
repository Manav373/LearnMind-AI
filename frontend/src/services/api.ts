import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

let getTokenFn: (() => Promise<string | null>) | null = null;

export const setTokenProvider = (fn: () => Promise<string | null>) => {
  getTokenFn = fn;
};

// Attach fresh token to every request
API.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    const token = await getTokenFn();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth
export const getMe = () => API.get('/auth/me');
export const updateSettings = (data: { learningStyle?: string; mentorPersonality?: string; dailyGoal?: number }) =>
  API.put('/auth/settings', data);

// Concepts
export const getConcepts = () => API.get('/concepts');
export const getConcept = (id: string) => API.get(`/concepts/${id}`);

// Progress
export const updateProgress = (data: any) => API.post('/progress/update', data);
export const getOverview = () => API.get('/progress/overview');
export const getAnalytics = () => API.get('/progress/analytics');

// AI
export const getExplanation = (conceptId: string) => API.post('/ai/explain', { conceptId });
export const generateQuestions = (conceptId: string, count?: number) =>
  API.post('/ai/generate-questions', { conceptId, count });
export const sendChat = (messages: any[], message: string, conceptId?: string, context?: string) =>
  API.post('/ai/chat', { messages, message, conceptId, context });
export const askCourseAI = (messages: any[], message: string) =>
  API.post('/ai/course-assistant', { messages, message });
export const evaluateAnswer = (question: string, studentAnswer: string, correctAnswer: string) =>
  API.post('/ai/evaluate-answer', { question, studentAnswer, correctAnswer });
export const teachBack = (conceptId: string, explanation: string) =>
  API.post('/ai/teach-back', { conceptId, explanation });

// Courses
export const getCourses = () => API.get('/courses');
export const getMyCourses = () => API.get('/courses/my');
export const enrollInCourse = (id: string) => API.post(`/courses/${id}/enroll`);

// Recommendations
export const getRecommendations = () => API.get('/recommendations');

// External Content
export const searchExternal = (q: string) => API.get(`/external/search?q=${encodeURIComponent(q)}`);
export const updateVideoProgress = (data: { videoId: string; title: string; thumbnail: string; timestamp: number }) =>
  API.post('/external/progress', data);
export const getVideoDetails = (id: string) => API.get(`/external/video/${id}`);

// AI Video Tools
export const generateVideoNotes = (videoTitle: string, videoDescription: string) =>
  API.post('/ai/generate-notes', { videoTitle, videoDescription });
export const generateVideoMCQs = (videoTitle: string, videoDescription: string, count?: number) =>
  API.post('/ai/generate-video-mcqs', { videoTitle, videoDescription, count });
