import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

let groqClient: any = null;

const getGroqClient = () => {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is missing in environment variables. Please add it to your .env file.');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
};

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Helper to get completion from Groq
 */
async function getCompletion(prompt: string, systemPrompt: string = 'You are a helpful learning assistant.', json: boolean = false) {
  try {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      model: MODEL,
      temperature: 0.5,
      max_tokens: 2048,
      response_format: json ? { type: 'json_object' } : undefined,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('Groq API Error:', error.message);
    throw new Error(`AI Service Error: ${error.message}`);
  }
}

/**
 * Generate an adaptive explanation for a concept.
 */
export const generateExplanation = async (
  concept: string,
  style: string,
  mastery: number,
  personality: string = 'friendly'
): Promise<string> => {
  const personalityPrompts: Record<string, string> = {
    friendly: 'Be warm, encouraging, and supportive. Use emojis sparingly.',
    strict: 'Be direct, precise, and focused. No fluff.',
    coach: 'Be motivating and challenging. Push the student to think deeper.',
  };

  const stylePrompts: Record<string, string> = {
    simple: 'Use very simple language, analogies, and avoid jargon. Explain like teaching a beginner.',
    example: 'Focus on practical real-world examples and step-by-step demonstrations.',
    analogy: 'Use creative analogies and metaphors to explain the concept in a completely different way.',
    technical: 'Use proper technical terminology, include edge cases and deeper nuances.',
  };

  const systemPrompt = `You are an AI learning tutor. ${personalityPrompts[personality] || personalityPrompts.friendly}
  ${stylePrompts[style] || stylePrompts.simple}
  Format your response in Markdown with clear sections. Keep it concise but thorough (max 400 words).`;

  const prompt = `The student's current mastery level of "${concept}" is ${mastery}%.
  Explain the concept "${concept}" in a way that matches the student's level.`;

  return await getCompletion(prompt, systemPrompt);
};

/**
 * Generate adaptive quiz questions.
 */
export const generateQuestions = async (
  concept: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 5
): Promise<any[]> => {
  const systemPrompt = `You are a quiz generator. You MUST return ONLY a valid JSON array. No text before or after the JSON.`;
  const prompt = `Generate exactly ${count} ${difficulty}-level multiple choice questions about "${concept}".
  
  Format:
  [
    {
      "question": "Question text?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A) ...",
      "explanation": "Brief explanation",
      "difficulty": "${difficulty}"
    }
  ]`;

  const response = await getCompletion(prompt, systemPrompt, true);
  try {
    return JSON.parse(response);
  } catch {
    return [];
  }
};

/**
 * AI Tutor chat response.
 */
export const getChatResponse = async (
  messages: Array<{ role: string; content: string }>,
  userMessage: string,
  conceptContext?: string,
  personality: string = 'friendly'
): Promise<string> => {
  const systemPrompt = `You are LearnMind AI, a personalized learning tutor. 
  Personality: ${personality}.
  ${conceptContext ? `Current topic context: ${conceptContext}` : ''}
  Be helpful, accurate, and adaptive. Format responses in Markdown when helpful.`;

  try {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ 
          role: m.role === 'user' ? 'user' as const : 'assistant' as const, 
          content: m.content 
        })),
        { role: 'user', content: userMessage }
      ],
      model: MODEL,
    });
    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('Groq Chat Error:', error.message);
    return "I'm having trouble responding right now.";
  }
};

/**
 * AI Course Discovery chat response.
 */
export const getCourseAssistantResponse = async (
  messages: Array<{ role: string; content: string }>,
  userMessage: string,
  availableCourses: any[]
): Promise<string> => {
  const coursesContext = availableCourses.map(c => `- ${c.title}: ${c.description}`).join('\n');
  const systemPrompt = `You are the LearnMind Course Assistant. Help students find the best courses.
  Available Courses:
  ${coursesContext}
  Format responses in Markdown.`;

  try {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ 
          role: m.role === 'user' ? 'user' as const : 'assistant' as const, 
          content: m.content 
        })),
        { role: 'user', content: userMessage }
      ],
      model: MODEL,
    });
    return response.choices[0]?.message?.content || '';
  } catch {
    return "I can help you find a course! What are you interested in?";
  }
};

/**
 * Evaluate a teach-back attempt.
 */
export const evaluateTeachBack = async (
  concept: string,
  studentExplanation: string
): Promise<{ score: number; feedback: string; gaps: string[] }> => {
  const systemPrompt = `Evaluate the student's explanation of "${concept}". Return ONLY JSON.`;
  const prompt = `Student says: "${studentExplanation}"
  Return JSON: { "score": 0-100, "feedback": "...", "gaps": ["..."] }`;

  const response = await getCompletion(prompt, systemPrompt, true);
  try {
    return JSON.parse(response);
  } catch {
    return { score: 0, feedback: 'Unable to evaluate', gaps: [] };
  }
};

/**
 * Evaluate a student's answer.
 */
export const evaluateAnswer = async (
  question: string,
  studentAnswer: string,
  correctAnswer: string
): Promise<{ isCorrect: boolean; feedback: string; errorType: string }> => {
  const systemPrompt = `Evaluate if the answer is correct. Return ONLY JSON.`;
  const prompt = `Q: ${question}\nStudent: ${studentAnswer}\nCorrect: ${correctAnswer}
  Return JSON: { "isCorrect": true/false, "feedback": "...", "errorType": "conceptual/careless/etc" }`;

  const response = await getCompletion(prompt, systemPrompt, true);
  try {
    return JSON.parse(response);
  } catch {
    return { isCorrect: false, feedback: '', errorType: 'conceptual' };
  }
};

/**
 * Generate structured notes from a video's context.
 */
export const generateVideoNotes = async (
  videoTitle: string,
  videoDescription: string
): Promise<string> => {
  const systemPrompt = `You are a professional note-taker. Generate structured Markdown notes for the video.`;
  const prompt = `Video: ${videoTitle}\nDescription: ${videoDescription}\nGenerate comprehensive, organized learning notes.`;

  return await getCompletion(prompt, systemPrompt);
};

/**
 * Generate MCQ questions based on video context.
 */
export const generateVideoMCQs = async (
  videoTitle: string,
  videoDescription: string,
  count: number = 5
): Promise<any[]> => {
  const systemPrompt = `Generate exactly ${count} MCQs for the video. Return ONLY a JSON array.`;
  const prompt = `Video: ${videoTitle}\nDescription: ${videoDescription}\nFormat as JSON array of objects with question, options, answer, explanation.`;

  const response = await getCompletion(prompt, systemPrompt, true);
  try {
    // Clean potential markdown code blocks if the model didn't follow the JSON mode perfectly
    const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
};
