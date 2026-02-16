import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

function AboutPage() {
  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-800 pt-28">
      
      {/* --- 1. HEADER SECTION --- */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-20">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-amber-600 font-bold tracking-[0.2em] text-xs uppercase mb-4"
        >
          Our Philosophy
        </motion.p>
        <motion.h1 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-5xl md:text-7xl font-serif text-stone-900 mb-8 leading-tight"
        >
          Beauty meets <br/> <span className="italic text-stone-400">Intelligence.</span>
        </motion.h1>
        <motion.p 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-xl text-stone-600 leading-relaxed font-light"
        >
          Looklab isn't just a salon. It is a fusion of high-end artistry and cutting-edge AI. 
          We believe confidence starts with clarity—visualizing your perfect self before the transformation begins.
        </motion.p>
      </div>

      {/* --- 2. THE STORY (Split Layout) --- */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center mb-24">
        
        {/* Left: Image */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[600px]"
        >
          <img 
            src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=2069&auto=format&fit=crop" 
            alt="Salon Interior" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
          {/* Gold Border Outline */}
          <div className="absolute inset-4 border border-white/30 rounded-[2.5rem] pointer-events-none"></div>
        </motion.div>

        {/* Right: Text Content */}
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mb-4 text-2xl">🔮</div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">The Digital Mirror</h2>
            <p className="text-stone-600 leading-relaxed text-lg">
              Traditional consultations are based on guesswork. We changed that. 
              By integrating <strong>Computer Vision</strong> and <strong>Generative AI</strong>, we give our stylists a blueprint 
              and our clients total peace of mind.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-2xl">⏳</div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Luxury, Unrushed.</h2>
            <p className="text-stone-600 leading-relaxed text-lg">
              We operate on a strictly limited capacity. Only <strong>4 clients</strong> per slot. 
              No waiting, no noise, just 2.5 hours of dedicated attention to your vision.
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- 3. STATS SECTION --- */}
      <div className="bg-stone-900 text-white py-20 mb-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-stone-800">
          <div className="p-4">
            <span className="block text-5xl font-serif font-bold text-amber-200 mb-2">5k+</span>
            <span className="text-stone-400 uppercase tracking-widest text-xs">Virtual Try-Ons</span>
          </div>
          <div className="p-4">
            <span className="block text-5xl font-serif font-bold text-amber-200 mb-2">12</span>
            <span className="text-stone-400 uppercase tracking-widest text-xs">Master Stylists</span>
          </div>
          <div className="p-4">
            <span className="block text-5xl font-serif font-bold text-amber-200 mb-2">4.9</span>
            <span className="text-stone-400 uppercase tracking-widest text-xs">Client Rating</span>
          </div>
        </div>
      </div>

      {/* --- 4. TEAM SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-stone-900">Meet the Masters</h2>
            <div className="w-24 h-1 bg-amber-300 mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { name: "Elena V.", role: "Creative Director", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop" },
                { name: "Marco D.", role: "Color Specialist", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
                { name: "Sarah J.", role: "AI & Style Tech", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop" }
            ].map((member, idx) => (
                <motion.div 
                    key={idx}
                    whileHover={{ y: -10 }}
                    className="group text-center"
                >
                    <div className="relative h-96 mb-6 overflow-hidden rounded-2xl">
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors"></div>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-stone-800">{member.name}</h3>
                    <p className="text-stone-500 uppercase text-xs tracking-widest mt-2">{member.role}</p>
                </motion.div>
            ))}
        </div>
      </div>

      {/* Include Footer */}
      <Footer />
    </div>
  );
}

export default AboutPage;