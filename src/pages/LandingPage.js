import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function LandingPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 100 } 
    }
  };

  return (
    // MAIN CONTAINER
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-stone-50">
        
      {/* --- BACKGROUND IMAGE & OVERLAY --- */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
            // I've swapped this to a beige/luxury salon image that matches the pastel vibe
            backgroundImage: 'url(https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=2069&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
        }}
      >
        {/* WARM OVERLAY: Uses Stone/Brown tint instead of harsh black */}
        <div className="absolute inset-0 bg-stone-900/40 mix-blend-multiply"></div>
        
        {/* --- PASTEL AMBIENT ORBS --- */}
        {/* Orb 1: Soft Peach/Rose */}
        <motion.div 
           animate={{ 
             scale: [1, 1.2, 1],
             opacity: [0.3, 0.5, 0.3] 
           }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-1/4 -left-1/4 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl"
        />
        {/* Orb 2: Champagne Gold */}
        <motion.div 
           animate={{ 
             scale: [1.2, 1, 1.2],
             opacity: [0.2, 0.4, 0.2] 
           }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
           className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl"
        />
      </div>

      {/* --- MAIN CONTENT GLASS CARD --- */}
      <motion.div 
        // Changed border to white/30 for a softer edge
        className="relative z-10 p-8 md:p-12 bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl max-w-3xl mx-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* 1. Premium Tagline - Pastel Gold Border */}
        <motion.div variants={itemVariants}>
            <span className="inline-block py-1 px-4 mb-5 text-xs font-semibold tracking-[0.2em] text-amber-100 uppercase border border-amber-200/50 rounded-full bg-stone-900/20">
                The Future of Bespoke Styling
            </span>
        </motion.div>

        {/* 2. Main Headline */}
        <motion.h1 
          className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight leading-tight drop-shadow-sm"
          variants={itemVariants}
        >
          Define Your Look <br />
          {/* Gradient Text: Soft Rose to Champagne Gold */}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-200 to-rose-200">
             Before the Cut.
          </span>
        </motion.h1>

        {/* 3. Subheadline */}
        <motion.p 
          className="text-lg md:text-xl text-stone-100 mb-10 leading-relaxed max-w-2xl mx-auto font-light"
          variants={itemVariants}
        >
          Where advanced AI analysis meets world-class luxury salon services. Visualize perfection in a serene environment.
        </motion.p>

        {/* 4. Custom Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-5"
          variants={itemVariants}
        >
          {/* Login Button - Pastel Gradient */}
          <Link 
            to="/login" 
            className="group relative px-8 py-4 font-bold text-stone-800 rounded-full overflow-hidden shadow-xl"
          >
            {/* Background: Pastel Gold to Rose */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-200 to-rose-200 transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"></div>
            
            <span className="relative z-10 flex items-center justify-center gap-2">
                Member Login 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform text-stone-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </span>
          </Link>

          {/* Register Button - Glass Style */}
          <Link 
            to="/register" 
            className="px-8 py-4 font-bold text-white rounded-full border border-white/40 hover:bg-white/10 hover:border-amber-200 hover:text-amber-100 transition-all duration-300 shadow-lg backdrop-blur-sm"
          >
            New Client Registration
          </Link>
        </motion.div>

      </motion.div>

      {/* --- SIMPLE FOOTER --- */}
      <div className="absolute bottom-6 text-stone-300/60 text-xs tracking-widest z-10">
        <p>© {new Date().getFullYear()} LOOKLAB LUXURY SALON</p>
      </div>
    </div>
  );
}

export default LandingPage;