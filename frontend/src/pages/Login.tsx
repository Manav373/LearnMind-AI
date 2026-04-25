import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md z-10 flex flex-col items-center"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">LearnMind AI</h1>
          <p className="text-slate-400 mt-2 text-sm">An AI tutor that learns how you learn.</p>
        </div>

        {/* Clerk SignIn */}
        <SignIn 
          routing="hash"
          appearance={{
            elements: {
              card: "glass rounded-2xl shadow-xl border-white/10 bg-black/20 backdrop-blur-xl",
              headerTitle: "text-white font-bold",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-white/10",
              dividerText: "text-slate-400",
              formFieldLabel: "text-slate-300 font-medium",
              formFieldInput: "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-violet-500/50 rounded-xl",
              formButtonPrimary: "gradient-primary text-white hover:opacity-90 rounded-xl py-3 font-semibold",
              footerActionText: "text-slate-400",
              footerActionLink: "text-violet-400 hover:text-violet-300 font-medium",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-violet-400",
              formFieldInputShowPasswordButton: "text-slate-400 hover:text-white"
            }
          }}
        />
      </motion.div>
    </div>
  );
};

export default Login;
