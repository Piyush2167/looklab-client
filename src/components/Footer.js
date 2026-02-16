import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 pt-20 pb-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* --- TOP SECTION: GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. BRAND */}
          <div className="space-y-6">
            <Link to="/" className="text-3xl font-serif text-white font-bold tracking-wide block">
              Looklab<span className="text-amber-500">.</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Where artificial intelligence meets artisanal styling. 
              Redefining the luxury salon experience for the modern icon.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
                {['Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                    <motion.a 
                        key={social}
                        whileHover={{ y: -3, color: '#fbbf24' }}
                        href="#" 
                        className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 transition-colors"
                    >
                        <span className="sr-only">{social}</span>
                        {/* Simple placeholder icon */}
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </motion.a>
                ))}
            </div>
          </div>

          {/* 2. EXPLORE */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Explore</h4>
            <ul className="space-y-4 text-sm">
                {['Home', 'About Us', 'Services', 'AI Stylist', 'Contact'].map((item) => (
                    <li key={item}>
                        <Link to="/about" className="hover:text-amber-400 transition-colors">{item}</Link>
                    </li>
                ))}
            </ul>
          </div>

          {/* 3. LEGAL */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Legal</h4>
            <ul className="space-y-4 text-sm">
                <li><Link to="#" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-amber-400 transition-colors">Cookie Policy</Link></li>
                <li><Link to="/admin" className="hover:text-amber-400 transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          {/* 4. NEWSLETTER */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Stay Updated</h4>
            <p className="text-xs mb-4">Subscribe for exclusive offers and style trends.</p>
            <div className="flex flex-col gap-3">
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="bg-stone-800 border border-stone-700 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
                />
                <button className="bg-amber-500 text-stone-900 font-bold text-sm rounded-lg px-4 py-3 hover:bg-amber-400 transition-colors">
                    Subscribe
                </button>
            </div>
          </div>

        </div>

        {/* --- BOTTOM SECTION --- */}
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2025 Looklab Inc. All rights reserved.</p>
            <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Systems Operational
            </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;