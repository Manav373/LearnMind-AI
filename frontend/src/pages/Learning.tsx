import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Send, Bot, User, BookOpen, HelpCircle, CheckCircle2, XCircle, ChevronRight, Award, Lightbulb, MessageSquare, Mic } from 'lucide-react';
import { getConcepts, getExplanation, generateQuestions, sendChat, updateProgress, teachBack } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Tab = 'learn' | 'quiz' | 'chat' | 'teachback';

const Learning: React.FC = () => {
  const { refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [concepts, setConcepts] = useState<any[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [loading, setLoading] = useState(true);

  // Learn state
  const [explanation, setExplanation] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(0);
  const [mistakeDetails, setMistakeDetails] = useState<any[]>([]);
  const [sessionResult, setSessionResult] = useState<any>(null);

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Teach-back state
  const [teachInput, setTeachInput] = useState('');
  const [teachResult, setTeachResult] = useState<any>(null);
  const [teachLoading, setTeachLoading] = useState(false);

  useEffect(() => {
    const fetchConcepts = async () => {
      const res = await getConcepts();
      setConcepts(res.data);
      const paramId = searchParams.get('concept');
      if (paramId) {
        const found = res.data.find((c: any) => c._id === paramId);
        if (found) setSelectedConcept(found);
      }
      setLoading(false);
    };
    fetchConcepts();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConcept = (concept: any) => {
    setSelectedConcept(concept);
    setActiveTab('learn');
    setExplanation('');
    setQuestions([]);
    setQuizDone(false);
    setSessionResult(null);
    setMessages([]);
    setTeachResult(null);
  };

  const handleGetExplanation = async () => {
    if (!selectedConcept) return;
    setExplainLoading(true);
    try {
      const res = await getExplanation(selectedConcept._id);
      setExplanation(res.data.explanation);
    } catch (err) { console.error(err); }
    setExplainLoading(false);
  };

  const handleStartQuiz = async () => {
    if (!selectedConcept) return;
    setQuizLoading(true);
    setCurrentQ(0); setScore(0); setMistakes(0); setQuizDone(false);
    setSelectedAnswer(null); setAnswered(false); setMistakeDetails([]);
    setSessionResult(null);
    try {
      const res = await generateQuestions(selectedConcept._id, 5);
      setQuestions(res.data.questions || []);
      setQuizStartTime(Date.now());
      setActiveTab('quiz');
    } catch (err) { console.error(err); }
    setQuizLoading(false);
  };

  const handleAnswer = (option: string) => {
    if (answered) return;
    setSelectedAnswer(option);
    setAnswered(true);
    const q = questions[currentQ];
    if (option === q.answer) {
      setScore(s => s + 1);
    } else {
      setMistakes(m => m + 1);
      setMistakeDetails(prev => [...prev, { question: q.question, userAnswer: option, correctAnswer: q.answer, errorType: 'conceptual' }]);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      // Finish quiz
      setQuizDone(true);
      const duration = Math.round((Date.now() - quizStartTime) / 1000);
      const accuracy = questions.length > 0 ? score / questions.length : 0;
      try {
        const res = await updateProgress({
          conceptId: selectedConcept._id,
          accuracy,
          responseTime: Date.now() - quizStartTime,
          mistakes,
          questionsAttempted: questions.length,
          questionsCorrect: score,
          duration,
          difficulty: questions[0]?.difficulty || 'medium',
          mistakeDetails,
        });
        setSessionResult(res.data);
        await refreshUser();
      } catch (err) { console.error(err); }
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await sendChat(history, chatInput, selectedConcept?._id);
      setMessages(prev => [...prev, { role: 'model', content: res.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting. Please try again." }]);
    }
    setChatLoading(false);
  };

  const handleTeachBack = async () => {
    if (!teachInput.trim() || !selectedConcept) return;
    setTeachLoading(true);
    try {
      const res = await teachBack(selectedConcept._id, teachInput);
      setTeachResult(res.data);
    } catch (err) { console.error(err); }
    setTeachLoading(false);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'learn', label: 'Learn', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
    { key: 'chat', label: 'AI Tutor', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'teachback', label: 'Teach Back', icon: <Mic className="w-4 h-4" /> },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Concept sidebar */}
      <div className="w-72 flex-shrink-0 glass rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-slate-400">Topics</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {concepts.map((c) => {
            const mastery = c.progress?.masteryScore || 0;
            const isSelected = selectedConcept?._id === c._id;
            return (
              <button
                key={c._id}
                onClick={() => handleSelectConcept(c)}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all text-sm ${
                  isSelected ? 'bg-violet-500/15 border border-violet-500/20' : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${mastery >= 80 ? 'bg-emerald-400' : mastery > 0 ? 'bg-amber-400' : 'bg-slate-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`truncate font-medium ${isSelected ? 'text-violet-300' : 'text-slate-300'}`}>{c.name}</p>
                  <p className="text-[10px] text-slate-600">{c.category} · {Math.round(mastery)}%</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedConcept ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-500">Select a topic to start learning</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header with tabs */}
            <div className="glass rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold">{selectedConcept.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedConcept.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-violet-400">{Math.round(selectedConcept.progress?.masteryScore || 0)}%</span>
                  <p className="text-[10px] text-slate-600">Mastery</p>
                </div>
              </div>
              <div className="flex gap-1 bg-white/[0.02] p-1 rounded-xl">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.key ? 'bg-violet-500/15 text-violet-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {/* LEARN TAB */}
                {activeTab === 'learn' && (
                  <motion.div key="learn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
                    <div className="glass rounded-2xl p-6 space-y-4">
                      {!explanation ? (
                        <div className="text-center py-12 space-y-4">
                          <Lightbulb className="w-12 h-12 text-amber-400 mx-auto" />
                          <div>
                            <p className="text-lg font-semibold">Ready to learn {selectedConcept.name}?</p>
                            <p className="text-sm text-slate-500 mt-1">AI will generate an explanation tailored to your level.</p>
                          </div>
                          <button onClick={handleGetExplanation} disabled={explainLoading} className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                            {explainLoading ? 'Generating...' : 'Get AI Explanation'}
                          </button>
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code class="bg-white/5 px-1 rounded">$1</code>') }} />
                        </div>
                      )}
                      {explanation && (
                        <div className="flex gap-3 pt-4 border-t border-white/5">
                          <button onClick={handleStartQuiz} className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                            Take Quiz →
                          </button>
                          <button onClick={handleGetExplanation} className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                            Explain Again
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* QUIZ TAB */}
                {activeTab === 'quiz' && (
                  <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
                    {questions.length === 0 && !quizLoading ? (
                      <div className="glass rounded-2xl p-6 text-center py-12 space-y-4">
                        <HelpCircle className="w-12 h-12 text-blue-400 mx-auto" />
                        <p className="text-lg font-semibold">Test Your Knowledge</p>
                        <p className="text-sm text-slate-500">AI will generate adaptive questions based on your mastery level.</p>
                        <button onClick={handleStartQuiz} className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90">
                          Start Quiz
                        </button>
                      </div>
                    ) : quizLoading ? (
                      <div className="glass rounded-2xl p-6 text-center py-12">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Generating adaptive questions...</p>
                      </div>
                    ) : quizDone ? (
                      <div className="glass rounded-2xl p-8 text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                          <Award className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Session Complete!</h3>
                          <p className="text-slate-400 mt-1">Your mastery has been updated.</p>
                        </div>
                        {sessionResult && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                            <div className="bg-white/5 rounded-xl p-3"><p className="text-xl font-bold">{Math.round((score / questions.length) * 100)}%</p><p className="text-[10px] text-slate-500">Accuracy</p></div>
                            <div className="bg-white/5 rounded-xl p-3"><p className="text-xl font-bold text-violet-400">{sessionResult.mastery}%</p><p className="text-[10px] text-slate-500">Mastery</p></div>
                            <div className="bg-white/5 rounded-xl p-3"><p className="text-xl font-bold text-amber-400">+{sessionResult.xpEarned}</p><p className="text-[10px] text-slate-500">XP Earned</p></div>
                            <div className="bg-white/5 rounded-xl p-3"><p className="text-xl font-bold text-blue-400">Lv.{sessionResult.level}</p><p className="text-[10px] text-slate-500">Level</p></div>
                          </div>
                        )}
                        <div className="flex gap-3 justify-center">
                          <button onClick={handleStartQuiz} className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Try Again</button>
                          <button onClick={() => setActiveTab('learn')} className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-medium">Back to Learn</button>
                        </div>
                      </div>
                    ) : (
                      <div className="glass rounded-2xl p-6 space-y-6">
                        {/* Progress */}
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>Question {currentQ + 1} of {questions.length}</span>
                          <span>{score}/{currentQ + (answered ? 1 : 0)} correct</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
                        </div>

                        {/* Question */}
                        <h3 className="text-lg font-medium leading-relaxed">{questions[currentQ]?.question}</h3>

                        {/* Options */}
                        <div className="space-y-2.5">
                          {questions[currentQ]?.options.map((opt: string) => {
                            const isCorrect = answered && opt === questions[currentQ].answer;
                            const isWrong = answered && selectedAnswer === opt && opt !== questions[currentQ].answer;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleAnswer(opt)}
                                disabled={answered}
                                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between text-sm ${
                                  isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' :
                                  isWrong ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' :
                                  selectedAnswer === opt ? 'border-violet-500 bg-violet-500/10' :
                                  'border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04]'
                                }`}
                              >
                                {opt}
                                {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                                {isWrong && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation + Next */}
                        {answered && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                            <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-xl">
                              <p className="text-sm text-slate-300">{questions[currentQ]?.explanation}</p>
                            </div>
                            <div className="flex justify-end">
                              <button onClick={handleNextQuestion} className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                                {currentQ < questions.length - 1 ? 'Next' : 'Finish'} <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* CHAT TAB */}
                {activeTab === 'chat' && (
                  <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col glass rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400"><Bot className="w-4 h-4" /></div>
                      <div><p className="text-sm font-semibold">AI Tutor</p><p className="text-[10px] text-slate-500">Ask anything about {selectedConcept.name}</p></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                          <Bot className="w-10 h-10 text-violet-500" />
                          <p className="text-sm">Ask me anything about <span className="font-semibold">{selectedConcept.name}</span></p>
                        </div>
                      )}
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-2.5 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-violet-500/20 text-violet-400'}`}>
                              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                            </div>
                            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-500/10 border border-blue-500/15' : 'bg-white/[0.03] border border-white/5'}`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))}
                      {chatLoading && <div className="flex gap-2.5"><div className="w-7 h-7 rounded-lg bg-violet-500/20 animate-pulse" /><div className="w-20 h-8 bg-white/5 rounded-2xl animate-pulse" /></div>}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-white/5">
                      <div className="flex gap-3">
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} placeholder="Ask a question..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-500/40 transition-colors" />
                        <button onClick={handleSendChat} disabled={chatLoading} className="gradient-primary w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-50"><Send className="w-4 h-4 text-white" /></button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TEACH-BACK TAB */}
                {activeTab === 'teachback' && (
                  <motion.div key="teachback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
                    <div className="glass rounded-2xl p-6 space-y-5">
                      <div className="text-center space-y-2">
                        <Mic className="w-10 h-10 text-violet-400 mx-auto" />
                        <h3 className="text-lg font-semibold">Teach Back Mode</h3>
                        <p className="text-sm text-slate-500">Explain <span className="font-semibold text-slate-300">{selectedConcept.name}</span> in your own words. The AI will evaluate your understanding.</p>
                      </div>
                      <textarea
                        value={teachInput}
                        onChange={e => setTeachInput(e.target.value)}
                        placeholder="Type your explanation here..."
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/40 transition-colors resize-none"
                      />
                      <button onClick={handleTeachBack} disabled={teachLoading || !teachInput.trim()} className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 w-full">
                        {teachLoading ? 'Evaluating...' : 'Submit Explanation'}
                      </button>

                      {teachResult && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={`text-3xl font-bold ${teachResult.score >= 70 ? 'text-emerald-400' : teachResult.score >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {teachResult.score}%
                            </div>
                            <p className="text-sm text-slate-300 flex-1">{teachResult.feedback}</p>
                          </div>
                          {teachResult.gaps?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-400 mb-2">Knowledge Gaps:</p>
                              <div className="flex flex-wrap gap-2">
                                {teachResult.gaps.map((gap: string, i: number) => (
                                  <span key={i} className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full">{gap}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Learning;
