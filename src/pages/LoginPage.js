import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import Auth Context

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from context

  // --- STATES ---
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Call Backend Login API
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      console.log("Login Success:", res.data);

      // 2. SAVE TO LOCAL STORAGE (This fixes the Navbar issue)
      // We save the token AND the user object so AuthContext can find it on refresh
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // 3. Update Global Auth State
      login(res.data.user); 

      // 4. Redirect to Dashboard
      navigate('/home');

    } catch (err) {
      console.error(err);
      // Show specific error from backend (e.g., "Invalid password")
      setError(err.response?.data?.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  // --- ANIMATIONS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* LEFT SIDE: Animated Graphic / Slogan */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative p-10 bg-[url('http://i.pinimg.com/736x/7f/5f/3b/7f5f3b401fdd4a2ae14f900cdbb1260c.jpg')] bg-cover bg-center">
        
        {/* Purple/Pink Gradient Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-pink-900/80 z-10 backdrop-blur-[2px]"></div>
         */}

        <motion.div
          className="text-center relative z-20 text-white"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-5xl font-extrabold mb-4 drop-shadow-lg"
            variants={itemVariants}
          >
            Welcome Back, Icon.
          </motion.h1>
          <motion.p 
            className="text-lg text-purple-100 font-medium drop-shadow-md"
            variants={itemVariants}
          >
            Log in to manage your appointments and style goals.
          </motion.p>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "tween", duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                Login to Looklab
            </h2>
            <p className="text-gray-500 font-medium">Enter your details below</p>
          </div>
          
          {/* Error Message Display */}
          {error && (
            <div className="alert alert-error shadow-lg mb-6 rounded-lg text-sm py-3 bg-red-50 text-red-600 border border-red-200 px-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold text-gray-600">Email</span></label>
              <input 
                type="email" 
                name="email"
                placeholder="email@example.com" 
                className="input input-bordered w-full focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold text-gray-600">Password</span></label>
              <input 
                type="password" 
                name="password"
                placeholder="********" 
                className="input input-bordered w-full focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                onChange={handleChange}
                required
              />
              <label className="label">
                <Link to="#" className="label-text-alt link link-hover font-bold text-pink-600">Forgot password?</Link>
              </label>
            </div>

            {/* Submit Button */}
            <div className="form-control pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary w-full text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none transition-all duration-300 hover:shadow-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <span className="loading loading-spinner loading-sm"></span> : "Login"}
              </button>
            </div>
          
          </form>

          <div className="text-center mt-8">
            <Link to="/forgot-password" className="label-text-alt link link-hover font-bold text-pink-600">
                Forgot password?
            </Link>
            <p className="text-sm text-gray-600">Don't have an account? <Link to="/register" className="link link-primary font-bold text-purple-600 no-underline hover:underline">Register here</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;