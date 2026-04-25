import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  ChevronRight, 
  Play, 
  Zap, 
  BookOpen, 
  BarChart3,
  Globe
} from 'lucide-react';
import { useClerk, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  const { openSignIn } = useClerk();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-violet-light" />,
      title: "AI-Powered Insights",
      description: "Our Gemini-integrated engine analyzes your progress to create a truly personalized learning path."
    },
    {
      icon: <Play className="w-6 h-6 text-rose-primary" />,
      title: "Smart Aggregation",
      description: "Access the best educational content from YouTube, organized and curated for your specific goals."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-primary" />,
      title: "Advanced Analytics",
      description: "Visualize your growth with detailed metrics on concept mastery, time spent, and efficiency."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Define Your Goals",
      description: "Tell us what you want to learn, from mastering React to understanding Quantum Physics."
    },
    {
      number: "02",
      title: "Generate Your Path",
      description: "Our AI constructs a custom curriculum with curated modules and milestone tracking."
    },
    {
      number: "03",
      title: "Learn & Grow",
      description: "Dive into interactive lessons and watch as your personal knowledge graph expands."
    }
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-slate-200">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-violet-primary/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-blue-primary/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-emerald-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LearnMind <span className="gradient-text">AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>

          <SignedOut>
            <button 
              onClick={() => openSignIn()}
              className="px-5 py-2 text-sm font-semibold text-white gradient-primary rounded-full hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95"
            >
              Get Started
            </button>
          </SignedOut>
          <SignedIn>
            <Link 
              to="/dashboard"
              className="px-5 py-2 text-sm font-semibold text-white gradient-primary rounded-full hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95 flex items-center gap-2"
            >
              Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </SignedIn>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/10 text-xs font-semibold text-violet-light mb-8"
            >
              <Sparkles className="w-3 h-3" />
              <span>The Future of Learning is Here</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight"
            >
              Master Any Skill with <br />
              <span className="gradient-text">Adaptive AI Intelligence</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              LearnMind AI transforms how you acquire knowledge. We aggregate the world's best content and tailor it to your unique learning style using advanced AI.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <SignedOut>
                <button 
                  onClick={() => openSignIn()}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-dark-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors group"
                >
                  Start Your Journey
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignedOut>
              <SignedIn>
                <Link 
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-dark-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors group text-center"
                >
                  Go to Dashboard
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </SignedIn>
              <button className="w-full sm:w-auto px-8 py-4 glass text-white font-bold rounded-xl hover:bg-white/5 transition-colors">
                View Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Floating UI Elements Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-20 max-w-5xl mx-auto relative"
          >
            <div className="aspect-[16/9] glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5" />
              
              {/* Mock Dashboard Content */}
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="h-4 w-32 bg-white/10 rounded-full animate-pulse" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-6 flex-1">
                  <div className="col-span-2 glass-hover rounded-xl p-6 border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="h-2 w-24 bg-violet-light/30 rounded-full mb-4" />
                      <div className="h-6 w-48 bg-white/10 rounded-lg mb-2" />
                      <div className="h-3 w-64 bg-white/5 rounded-md" />
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 gradient-primary" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="glass-hover rounded-xl p-4 border border-white/5">
                        <div className="h-3 w-20 bg-white/10 rounded-full mb-2" />
                        <div className="h-2 w-full bg-white/5 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Orbiting Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 glass rounded-2xl flex flex-col items-center justify-center p-4 shadow-xl border border-white/10 animate-bounce" style={{ animationDuration: '3s' }}>
              <TrendingUp className="w-8 h-8 text-emerald-primary mb-2" />
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Progress</span>
              <span className="text-xl font-bold text-white">+84%</span>
            </div>
            
            <div className="absolute -bottom-10 -left-10 w-40 h-40 glass rounded-2xl p-4 shadow-xl border border-white/10 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-primary" />
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">AI Suggestion</span>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-white/10 rounded-full" />
                <div className="h-2 w-5/6 bg-white/10 rounded-full" />
                <div className="h-2 w-4/6 bg-white/10 rounded-full" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 bg-dark-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Scale Your Mind</h2>
              <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
                We've built a suite of tools designed to make learning friction-less, data-driven, and engaging.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -10 }}
                  className="p-8 rounded-2xl glass border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:gradient-primary group-hover:text-white transition-all">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-20">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                  Your Path to <br />
                  <span className="gradient-text">Mastery in 3 Steps</span>
                </h2>
                <p className="text-slate-400 mb-12 max-w-md leading-relaxed">
                  We've simplified the complex process of learning into a streamlined, AI-assisted workflow.
                </p>

                <div className="space-y-10">
                  {steps.map((step, index) => (
                    <div key={index} className="flex gap-6">
                      <div className="text-3xl font-black text-white/10 tracking-tighter">{step.number}</div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 relative">
                <div className="aspect-square relative flex items-center justify-center">
                  <div className="absolute inset-0 border-[40px] border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-[10%] border-[2px] border-dashed border-violet-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                  <div className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.4)] z-10">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Icons around the circle */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 glass rounded-xl flex items-center justify-center text-rose-primary shadow-lg border border-white/10">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 glass rounded-xl flex items-center justify-center text-blue-primary shadow-lg border border-white/10">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 glass rounded-xl flex items-center justify-center text-amber-primary shadow-lg border border-white/10">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-12 h-12 glass rounded-xl flex items-center justify-center text-emerald-primary shadow-lg border border-white/10">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto rounded-3xl gradient-primary p-12 text-center relative overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.2)]">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to Supercharge Your Learning?</h2>
              <p className="text-violet-100 mb-10 max-w-xl mx-auto text-lg">
                Join thousands of learners who are already using LearnMind AI to achieve their goals faster than ever.
              </p>
              <SignedOut>
                <button 
                  onClick={() => openSignIn()}
                  className="px-10 py-5 bg-white text-violet-primary font-bold rounded-2xl text-lg hover:bg-slate-50 transition-all hover:scale-105 shadow-xl"
                >
                  Get Started for Free
                </button>
              </SignedOut>
              <SignedIn>
                <Link 
                  to="/dashboard"
                  className="px-10 py-5 bg-white text-violet-primary font-bold rounded-2xl text-lg hover:bg-slate-50 transition-all hover:scale-105 shadow-xl inline-block"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-primary" />
            <span className="text-lg font-bold text-white">LearnMind AI</span>
          </div>
          
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <p className="text-xs">© 2024 LearnMind AI. Powered by Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
