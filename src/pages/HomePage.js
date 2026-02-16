import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

// Data for the Trending Section
const trends = [
  { name: 'The Choppy Bob', image: 'https://images.unsplash.com/photo-1549420456-f584e0c38827?q=80&w=1974&auto=format&fit=crop', desc: 'Edgy, low-maintenance texture.' },
  { name: 'Copper Balayage', image: 'https://images.unsplash.com/photo-1589785869263-fb6517a10738?q=80&w=1974&auto=format&fit=crop', desc: 'Vibrant color and dimension.' },
  { name: 'Soft Layers', image: 'https://images.unsplash.com/photo-1547402636-61ed5b838426?q=80&w=1974&auto=format&fit=crop', desc: 'Adds movement without losing length.' },
  { name: 'The Buzz Cut', image: 'https://images.unsplash.com/photo-1594943085523-2895db34c891?q=80&w=1974&auto=format&fit=crop', desc: 'Bold, clean, and classic.' },
];

function HomePage() {
  const upcomingAppointment = null; 

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-800 pt-28">
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* --- 1. ELEGANT HEADER --- */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-stone-200 pb-8"
        >
          <div>
            <p className="text-amber-600 font-bold tracking-[0.2em] text-xs uppercase mb-3">Welcome Back</p>
            <h1 className="text-5xl md:text-7xl font-serif text-stone-900">
              Hello, <span className="italic text-stone-400">Icon.</span>
            </h1>
          </div>
          <div className="mt-6 md:mt-0 text-right">
            <p className="text-stone-500 font-serif italic text-lg">
              "{new Date().toLocaleDateString('en-US', { weekday: 'long' })}s are for self-care."
            </p>
          </div>
        </motion.div>


        {/* --- 2. THE "GOLDEN TICKET" STATUS --- */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-20"
        >
            {upcomingAppointment ? (
                // STATE A: BOOKED
                <div className="relative bg-stone-900 rounded-3xl p-10 md:p-16 text-white overflow-hidden shadow-2xl">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-400 text-xs font-bold tracking-widest uppercase mb-6">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Confirmed
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif mb-2">{upcomingAppointment.service}</h2>
                            <p className="text-stone-400 text-lg">Your stylist is preparing for your arrival.</p>
                        </div>
                        <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12">
                            <p className="text-5xl font-serif text-amber-200 mb-1">{upcomingAppointment.time}</p>
                            <p className="text-stone-400 uppercase tracking-widest text-sm">{upcomingAppointment.date}</p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                </div>
            ) : (
                // STATE B: NO BOOKING
                <div className="relative bg-white rounded-3xl p-10 md:p-14 border border-stone-100 shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-4xl font-serif text-stone-800 mb-4">Your calendar is clear.</h2>
                        <p className="text-stone-500 text-lg leading-relaxed mb-8">
                            Experience the luxury of our exclusive 2.5-hour sessions. 
                            Limited slots available for this week.
                        </p>
                        <Link to="/booking" className="inline-block bg-stone-900 text-white px-10 py-4 rounded-full font-bold tracking-wide hover:bg-stone-800 hover:shadow-lg transition-all transform hover:-translate-y-1">
                            Reserve Your Sanctuary
                        </Link>
                    </div>
                    <div className="relative w-64 h-64 flex-shrink-0">
                        <div className="absolute inset-0 rounded-full border border-stone-200 scale-110"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=2069&auto=format&fit=crop" 
                            alt="Salon" 
                            className="w-full h-full object-cover rounded-full shadow-lg"
                        />
                    </div>
                </div>
            )}
        </motion.div>


        {/* --- 3. THE TWIN PILLARS (AI & Booking) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {/* AI CARD */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative h-[500px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent opacity-80"></div>
                
                <div className="absolute bottom-0 left-0 p-10 w-full">
                    <span className="text-amber-200 text-xs font-bold tracking-[0.2em] uppercase mb-2 block">Innovation</span>
                    <h3 className="text-4xl font-serif text-white mb-4">The Virtual Studio</h3>
                    <p className="text-stone-300 mb-8 max-w-sm line-clamp-2">Upload your photo and let our AI analyze your features to curate your perfect look.</p>
                    <Link to="/stylist-ai" className="inline-flex items-center gap-3 text-white border-b border-amber-400 pb-1 hover:text-amber-300 transition-colors">
                        Enter the Studio <span className="text-xl">→</span>
                    </Link>
                </div>
            </motion.div>

            {/* BOOKING CARD */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group relative h-[500px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent opacity-80"></div>
                
                <div className="absolute bottom-0 left-0 p-10 w-full">
                    <span className="text-amber-200 text-xs font-bold tracking-[0.2em] uppercase mb-2 block">Service Menu</span>
                    <h3 className="text-4xl font-serif text-white mb-4">Book an Appointment</h3>
                    <p className="text-stone-300 mb-8 max-w-sm line-clamp-2">Select from our exclusive range of treatments. Secure your 2.5-hour luxury slot.</p>
                    <Link to="/booking" className="inline-flex items-center gap-3 text-white border-b border-amber-400 pb-1 hover:text-amber-300 transition-colors">
                        View Availability <span className="text-xl">→</span>
                    </Link>
                </div>
            </motion.div>
        </div>


        {/* --- 4. TRENDING STYLES (Replaced Section) --- */}
        <div className="mb-20">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">Trending Styles This Season</h2>
                <div className="w-24 h-1 bg-amber-300 mx-auto mt-4"></div>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {trends.map((trend, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeInUp}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-100 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img src={trend.image} alt={trend.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors"></div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">{trend.name}</h3>
                    <p className="text-sm text-stone-500 font-light">{trend.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default HomePage;