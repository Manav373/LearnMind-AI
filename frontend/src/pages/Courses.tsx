import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BarChart, Sparkles, Send, Bot, User } from 'lucide-react';
import { askCourseAI, searchExternal } from '../services/api';

import { useNavigate } from 'react-router-dom';

const Courses: React.FC = () => {

  const navigate = useNavigate();
  const [externalCourses, setExternalCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  
  // AI Assistant state
  const [showAI, setShowAI] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        // Automatically search for Python and Java courses as requested
        const results = await Promise.allSettled([
          searchExternal('Python Full Course'),
          searchExternal('Java Full Course')
        ]);
        
        let combined: any[] = [];
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            combined = [...combined, ...result.value.data.slice(0, 4)];
          }
        });
        
        setExternalCourses(combined);
      } catch (err) { 
        console.error('Fetch error:', err); 
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setExternalCourses([]);
      return;
    }
    setSearching(true);
    try {
      const res = await searchExternal(searchTerm);
      setExternalCourses(res.data);
    } catch (err) {
      console.error(err);
    }
    setSearching(false);
  };



  const handleWatchExternal = (video: any) => {
    navigate(`/player/${video.id}`, { state: { video } });
  };

  const handleSendAI = async () => {
    if (!input.trim() || aiLoading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAiLoading(true);
    try {
      const res = await askCourseAI(messages, input);
      setMessages(prev => [...prev, { role: 'model', content: res.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble recommending courses right now." }]);
    }
    setAiLoading(false);
  };



  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Course Explorer</h1>
          <p className="text-slate-500 mt-1">Discover courses from across the web and local experts.</p>
        </div>
        <button 
          onClick={() => setShowAI(true)}
          className="flex items-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 px-4 py-2 rounded-xl border border-violet-500/20 transition-all text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" /> Ask AI Assistant
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search any topic (e.g. Python for Beginners, AI Ethics...)" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-violet-500/50 transition-all text-sm"
          />
          <button 
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-500 hover:bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            Search
          </button>
        </div>

      </div>

      {/* YouTube / External Results Section */}
      {externalCourses.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold">From YouTube & Web</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {externalCourses.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleWatchExternal(video)}
                className="glass rounded-xl overflow-hidden cursor-pointer group hover:border-violet-500/30 transition-all"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold line-clamp-2 leading-snug">{video.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{video.channelTitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}



    {/* AI Assistant Modal */}
      <AnimatePresence>
        {showAI && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-800 border border-white/10 w-full max-w-2xl h-[600px] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-violet-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Course Assistant</h2>
                    <p className="text-[10px] text-slate-500 tracking-wider uppercase">Find your perfect path</p>
                  </div>
                </div>
                <button onClick={() => setShowAI(false)} className="text-slate-500 hover:text-white transition-colors">
                  <BarChart className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <Sparkles className="w-12 h-12 text-violet-500" />
                    <div>
                      <p className="text-lg font-semibold">How can I help you learn today?</p>
                      <p className="text-sm max-w-xs mx-auto">Ask me about specific topics or let me recommend a course based on your goals.</p>
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-violet-500/20 text-violet-400'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-500/10 border border-blue-500/15 text-blue-100' : 'bg-white/[0.03] border border-white/5 text-slate-200'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {aiLoading && <div className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-violet-500/20 animate-pulse" /><div className="w-32 h-10 bg-white/5 rounded-2xl animate-pulse" /></div>}
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendAI()}
                    placeholder="E.g. 'I want to learn how to build websites from scratch...'"
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-violet-500/40 transition-colors"
                  />
                  <button 
                    onClick={handleSendAI}
                    disabled={aiLoading}
                    className="gradient-primary w-12 h-12 rounded-2xl flex items-center justify-center hover:opacity-90 disabled:opacity-50 shadow-lg shadow-violet-500/20"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Courses;
