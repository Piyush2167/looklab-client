import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

function ContactPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-28">
      
      {/* --- HEADER --- */}
      <div className="text-center mb-16 px-6">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-amber-600 font-bold tracking-[0.2em] text-xs uppercase mb-4"
        >
          Concierge Services
        </motion.p>
        <motion.h1 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-5xl md:text-6xl font-serif text-stone-900"
        >
          Get in Touch
        </motion.h1>
      </div>

      {/* --- MAIN CARD SECTION --- */}
      <div className="max-w-6xl mx-auto px-6 mb-24">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-2 rounded-[3rem] overflow-hidden shadow-2xl"
        >
          
          {/* LEFT: CONTACT INFO (Dark Luxury Theme) */}
          <div className="bg-stone-900 text-white p-12 lg:p-16 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10 space-y-12">
              <div>
                <h3 className="text-2xl font-serif mb-2">Visit the Lab</h3>
                <p className="text-stone-400 leading-relaxed">
                  Luxury Lane, Bandra West<br/>
                  Mumbai, Maharashtra 400050
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-serif mb-2">Direct Line</h3>
                <p className="text-stone-400 mb-1">Concierge: <span className="text-white">+91 98765 43210</span></p>
                <p className="text-stone-400">Support: <span className="text-white">help@looklab.in</span></p>
              </div>

              <div>
                <h3 className="text-2xl font-serif mb-2">Hours</h3>
                <div className="flex justify-between max-w-xs text-stone-400">
                  <span>Mon - Fri</span>
                  <span className="text-amber-200">10:00 AM - 08:00 PM</span>
                </div>
                <div className="flex justify-between max-w-xs text-stone-400">
                  <span>Sat - Sun</span>
                  <span className="text-amber-200">09:00 AM - 06:00 PM</span>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-6 pt-4">
                {['Instagram', 'Twitter', 'Facebook'].map((social) => (
                  <button key={social} className="text-stone-500 hover:text-amber-400 transition-colors uppercase text-xs tracking-widest font-bold">
                    {social}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: FORM (Clean White Theme) */}
          <div className="bg-white p-12 lg:p-16">
            <h3 className="text-3xl font-serif text-stone-800 mb-8">Send an Inquiry</h3>
            <form className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label uppercase text-xs font-bold text-stone-400 tracking-wider">Your Name</label>
                  <input type="text" className="input bg-stone-50 border-stone-200 focus:border-amber-400 focus:outline-none w-full" placeholder="John Doe" />
                </div>
                <div className="form-control">
                  <label className="label uppercase text-xs font-bold text-stone-400 tracking-wider">Phone</label>
                  <input type="text" className="input bg-stone-50 border-stone-200 focus:border-amber-400 focus:outline-none w-full" placeholder="+91..." />
                </div>
              </div>

              <div className="form-control">
                <label className="label uppercase text-xs font-bold text-stone-400 tracking-wider">Email Address</label>
                <input type="email" className="input bg-stone-50 border-stone-200 focus:border-amber-400 focus:outline-none w-full" placeholder="john@example.com" />
              </div>

              <div className="form-control">
                <label className="label uppercase text-xs font-bold text-stone-400 tracking-wider">Message</label>
                <textarea className="textarea bg-stone-50 border-stone-200 focus:border-amber-400 focus:outline-none w-full h-32" placeholder="How can we assist you today?"></textarea>
              </div>

              <button className="btn bg-stone-900 text-white hover:bg-stone-700 border-none rounded-full px-10 py-3 shadow-lg w-full md:w-auto">
                Send Message
              </button>

            </form>
          </div>

        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

export default ContactPage;