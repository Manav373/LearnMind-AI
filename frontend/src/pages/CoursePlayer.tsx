import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Sparkles, BookOpen, HelpCircle, 
  Download, Share2, Play, 
  Settings, Bot, Send, User
} from 'lucide-react';
import { 
  updateVideoProgress, generateVideoNotes, 
  generateVideoMCQs, sendChat, getVideoDetails 
} from '../services/api';

const Player = ReactPlayer as any;

const CoursePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State
  const [videoData, setVideoData] = useState<any>(location.state?.video);
  const [playing, setPlaying] = useState(false); // Default to false to avoid autoplay block
  const [, setPlayed] = useState(0);
  const [, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  // AI Tools State
  const [activeTab, setActiveTab] = useState<'notes' | 'quiz' | 'chat'>('notes');
  const [notes, setNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  const playerRef = useRef<any>(null);
  
  useEffect(() => {
    const fetchVideo = async (videoId: string) => {
      try {
        const res = await getVideoDetails(videoId);
        setVideoData(res.data);
      } catch (err) {
        console.error("Failed to fetch video", err);
        if (!videoData) navigate('/courses');
      }
    };

    if (id && (!videoData || !videoData.description)) {
      fetchVideo(id);
    } else if (!id && !videoData) {
      navigate('/courses');
    }
  }, [id, videoData, navigate]);

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setPlayed(state.played);
    // Sync progress to backend every 30 seconds or so
    if (Math.floor(state.playedSeconds) % 30 === 0 && state.playedSeconds > 0) {
      updateVideoProgress({
        videoId: id!,
        title: videoData?.title || 'YouTube Video',
        thumbnail: videoData?.thumbnail || '',
        timestamp: state.playedSeconds
      });
    }
  };

  const handleGenerateNotes = async () => {
    if (!videoData) return;
    setNotesLoading(true);
    try {
      const res = await generateVideoNotes(videoData.title, videoData.description || videoData.title);
      setNotes(res.data.notes);
    } catch (err) { console.error(err); }
    setNotesLoading(false);
  };

  const handleGenerateQuiz = async () => {
    if (!videoData) return;
    setQuizLoading(true);
    try {
      const res = await generateVideoMCQs(videoData.title, videoData.description || videoData.title);
      setQuiz(res.data.questions);
    } catch (err) { console.error(err); }
    setQuizLoading(false);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading || !videoData) return;
    const userMsg = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const context = `Video Title: ${videoData.title}\nDescription: ${videoData.description || ''}`;
      const res = await sendChat(messages, chatInput, undefined, context);
      setMessages(prev => [...prev, { role: 'model', content: res.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: "Error connecting to AI." }]);
    }
    setChatLoading(false);
  };

  const extractId = (str: any) => {
    if (!str) return '';
    const s = String(str);
    if (s.includes('v=')) return s.split('v=')[1].split('&')[0];
    if (s.includes('youtu.be/')) return s.split('youtu.be/')[1].split('?')[0];
    if (s.includes('embed/')) return s.split('embed/')[1].split('?')[0];
    return s;
  };
  
  const videoId = extractId(id);
  const renderMarkdown = (text: string) => {
    return text
      .replace(/### (.*)/g, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-6 mb-3 border-b border-white/10 pb-1">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-violet-300">$1</strong>')
      .replace(/^- (.*)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  if (!videoData) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] gap-6 overflow-hidden">
      {/* Left: Player & Info */}
      <div className="flex-1 flex flex-col min-w-0">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Courses
        </button>

        <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 group flex items-center justify-center">
          <Player
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="100%"
            playing={playing}
            onProgress={handleProgress as any}
            onDuration={(d: any) => setDuration(d)}
            onReady={() => setIsReady(true)}
            onStart={() => setPlaying(true)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={(e: any) => {
              console.error("Video Player Error:", e);
              setIsReady(true);
            }}
            controls={true}
            config={{
              youtube: {
                playerVars: { 
                  autoplay: 0, 
                  modestbranding: 1, 
                  rel: 0
                }
              } as any
            }}
          />
          {!playing && isReady && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer group-hover:bg-black/40 transition-all"
              onClick={() => setPlaying(true)}
            >
              <div className="w-20 h-20 rounded-full bg-violet-600/80 flex items-center justify-center shadow-2xl shadow-violet-500/50 scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold leading-tight">{videoData.title}</h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <span className="text-violet-400 font-medium">{videoData.channelTitle}</span>
                <span>•</span>
                <span>YouTube Course</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl">
            <h3 className="text-sm font-semibold mb-2">About this lesson</h3>
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 hover:line-clamp-none cursor-pointer transition-all">
              {videoData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Right: AI Sidebar */}
      <div className="w-full lg:w-[400px] flex flex-col glass rounded-3xl overflow-hidden border border-white/10">
        <div className="flex border-b border-white/5">
          {[
            { id: 'notes', icon: <BookOpen className="w-4 h-4" />, label: 'AI Notes' },
            { id: 'quiz', icon: <HelpCircle className="w-4 h-4" />, label: 'Quiz' },
            { id: 'chat', icon: <Bot className="w-4 h-4" />, label: 'Tutor' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-4 text-xs font-bold transition-all relative ${
                activeTab === tab.id ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'notes' && (
              <motion.div 
                key="notes" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {!notes ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto text-violet-400">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold">Generate AI Notes</h4>
                      <p className="text-xs text-slate-500 mt-1">Get a structured summary of this video instantly.</p>
                    </div>
                    <button 
                      onClick={handleGenerateNotes}
                      disabled={notesLoading}
                      className="w-full py-3 rounded-xl gradient-primary text-white text-sm font-bold shadow-lg shadow-violet-500/20 disabled:opacity-50"
                    >
                      {notesLoading ? 'AI is writing...' : 'Generate Now'}
                    </button>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-xs max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(notes) }} />
                    <button className="mt-6 flex items-center gap-2 text-violet-400 text-xs font-bold hover:underline">
                      <Download className="w-4 h-4" /> Download PDF Notes
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div 
                key="quiz" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {(!Array.isArray(quiz) || quiz.length === 0) ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-400">
                      <HelpCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold">Test Your Knowledge</h4>
                      <p className="text-xs text-slate-500 mt-1">Generate dynamic MCQs based on the video content.</p>
                    </div>
                    <button 
                      onClick={handleGenerateQuiz}
                      disabled={quizLoading}
                      className="w-full py-3 rounded-xl bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      {quizLoading ? 'Creating Quiz...' : 'Generate Quiz'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Array.isArray(quiz) && quiz.map((q, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                        <p className="text-sm font-bold">{i + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt: string) => (
                            <button key={opt} className="w-full text-left p-3 rounded-xl bg-black/20 border border-white/5 text-xs hover:border-violet-500/50 transition-colors">
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div 
                key="chat" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-[500px]"
              >
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.length === 0 && (
                    <div className="text-center py-12 opacity-50 space-y-2">
                      <Bot className="w-10 h-10 mx-auto" />
                      <p className="text-xs font-medium">Ask me anything about this video!</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-violet-500/20 text-violet-400'}`}>
                          {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        </div>
                        <div className={`p-3 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-500/10 border border-blue-500/15' : 'bg-white/5 border border-white/5'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && <div className="w-8 h-8 rounded-lg bg-violet-500/10 animate-pulse" />}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder="Ask a question..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-violet-500/40 transition-colors"
                  />
                  <button 
                    onClick={handleSendChat}
                    className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-violet-500/20"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
