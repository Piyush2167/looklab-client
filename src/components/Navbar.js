import React, { useState, useEffect } from 'react';
import { Link, useLocation , useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔴 FIX: Hide Navbar completely if on Admin Panel
  if (path.startsWith('/admin')) {
    return null;
  }

  // --- HANDLERS ---
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  // --- LINKS ---
  const guestLinks = (
    <>
      <li><Link to="/about" className="font-medium text-stone-600 hover:text-amber-600 transition-colors text-base">About Us</Link></li>
      <li><Link to="/contact" className="font-medium text-stone-600 hover:text-amber-600 transition-colors text-base">Contact</Link></li>
      
      {path !== '/login' && (
        <li className="ml-6"> 
            <Link to="/login" className="btn btn-sm btn-ghost border border-stone-300 text-stone-800 hover:bg-amber-50 hover:border-amber-300 font-bold px-5">Login</Link>
        </li>
      )}

      {path !== '/register' && (
        <li className="ml-3">
            <Link to="/register" className="btn btn-sm bg-stone-800 text-white hover:bg-stone-700 border-none rounded-full px-5 font-bold shadow-md">Register</Link>
        </li>
      )}
    </>
  );

  const userLinks = (
    <>
      <li><Link to="/home" className="font-medium text-stone-600 hover:text-amber-600">Home</Link></li>
      <li><Link to="/about" className="font-medium text-stone-600 hover:text-amber-600">About</Link></li> 
      <li><Link to="/stylist-ai" className="font-medium text-stone-600 hover:text-amber-600">AI Stylist</Link></li>
      <li><Link to="/booking" className="btn btn-sm bg-gradient-to-r from-amber-200 to-rose-200 border-none text-stone-800 font-bold ml-4 shadow-sm">Book Now</Link></li>
      
      <li className="ml-2">
        <Link to="/profile" className="btn btn-ghost btn-circle avatar">
            <div className="w-9 rounded-full bg-stone-200 border border-stone-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 m-2 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
        </Link>
      </li>
      
      <li>
        <button onClick={handleLogoutClick} className="btn btn-sm btn-ghost text-red-400 hover:bg-red-50 ml-1">Logout</button>
      </li>
    </>
  );

  // --- LOGIC ---
  const strictPublicPages = ['/', '/login', '/register'];
  const isStrictPublic = strictPublicPages.includes(path);

  let linksToRender;
  if (isStrictPublic) {
    linksToRender = guestLinks;
  } else if (isAuthenticated) {
    linksToRender = userLinks;
  } else {
    linksToRender = guestLinks;
  }

  // --- STYLING ---
  const isTransparent = path === '/' && !isScrolled;
  const navbarClasses = `navbar fixed top-0 w-full z-50 transition-all duration-300 ${
    isTransparent ? 'bg-transparent py-4' : 'bg-stone-50/90 backdrop-blur-md shadow-sm py-2'
  }`;

  return (
    <>
      <div className={navbarClasses}>
        <div className="flex-1">
          <Link to={isAuthenticated ? "/home" : "/"} className={`btn btn-ghost text-2xl font-serif hover:bg-transparent ${isTransparent ? 'text-stone-800' : 'text-stone-800'}`}>
            Looklab
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1 items-center">
            {linksToRender}
          </ul>
        </div>
      </div>

      <AnimatePresence>
        {showLogoutModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowLogoutModal(false)}
                ></motion.div>
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-stone-100 text-center"
                >
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Signing out?</h3>
                    <p className="text-stone-500 text-sm mb-8">Are you sure you want to log out of your account?</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowLogoutModal(false)} className="btn flex-1 bg-stone-100 border-none text-stone-600 hover:bg-stone-200 rounded-xl font-bold">Cancel</button>
                        <button onClick={confirmLogout} className="btn flex-1 bg-red-500 border-none text-white hover:bg-red-600 rounded-xl font-bold">Logout</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;