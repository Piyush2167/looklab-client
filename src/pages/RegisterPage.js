import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

function RegisterPage() {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [otp, setOtp] = useState(''); 
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); 
  };

  // STEP 1: VALIDATE & SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      
      // 1. Call Backend to Send OTP
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', { 
        email: formData.email 
      });

      console.log("OTP Sent:", res.data);
      setShowOtpModal(true); 

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not send OTP. Email might be invalid.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP & COMPLETE REGISTRATION
  const handleVerifyAndRegister = async () => {
    try {
      setLoading(true);
      
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: otp 
      });

      console.log("Registration Success:", res.data);
      alert("Verification Successful! Please login.");
      navigate('/login'); 

    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Visual Variants
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
      
      {/* LEFT SIDE: Graphic */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative p-10 bg-[url('http://i.pinimg.com/736x/7f/5f/3b/7f5f3b401fdd4a2ae14f900cdbb1260c.jpg')] bg-cover bg-center">
        {/* <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-[2px]"></div> */}
        <motion.div className="text-center relative z-10" initial="hidden" animate="visible" variants={containerVariants}>
          <motion.h1 className="text-5xl font-extrabold mb-4 text-white drop-shadow-lg" variants={itemVariants}>
            Start Your Style Shift
          </motion.h1>
          <motion.p className="text-lg text-purple-50 font-medium drop-shadow-md" variants={itemVariants}>
            Join Looklab and visualize your new era. <br/>Booking is just the beginning.
          </motion.p>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Form */}
      <motion.div className="w-full lg:w-1/2 flex items-center justify-center p-20 bg-white" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Create Account
          </h2>
          
          {error && (
            <div className="alert alert-error shadow-lg mb-6 rounded-lg text-sm py-3 bg-red-50 text-red-600 border border-red-200 px-4">
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* FORM INPUTS */}
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold text-gray-600">Full Name</span></label>
              <input type="text" name="name" placeholder="Your Full Name" className="input input-bordered w-full focus:border-pink-500 focus:ring-1 focus:ring-pink-500" onChange={handleChange} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold text-gray-600">Email</span></label>
              <input type="email" name="email" placeholder="email@example.com" className="input input-bordered w-full focus:border-pink-500 focus:ring-1 focus:ring-pink-500" onChange={handleChange} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold text-gray-600">Password</span></label>
              <input type="password" name="password" placeholder="********" className="input input-bordered w-full focus:border-pink-500 focus:ring-1 focus:ring-pink-500" onChange={handleChange} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold text-gray-600">Confirm Password</span></label>
              <input type="password" name="confirmPassword" placeholder="********" className="input input-bordered w-full focus:border-pink-500 focus:ring-1 focus:ring-pink-500" onChange={handleChange} required />
            </div>

            <div className="form-control pt-6">
              <button type="submit" disabled={loading} className="btn btn-primary w-full text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none hover:shadow-lg disabled:opacity-70">
                {loading ? <span className="loading loading-spinner loading-sm"></span> : "Verify Email & Register"}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">Already a member? <Link to="/login" className="link link-primary font-bold text-purple-600 no-underline hover:underline">Login here</Link></p>
          </div>
        </div>
      </motion.div>

      {/* OTP MODAL */}
      <AnimatePresence>
        {showOtpModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOtpModal(false)}></div>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center border border-purple-100">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✉️</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Verification Code</h3>
                    <p className="text-gray-500 text-sm mb-6">We sent a code to <span className="font-bold text-purple-600">{formData.email}</span></p>

                    <input 
                        type="text" 
                        placeholder="Enter Code" 
                        className="input input-bordered w-full text-center text-xl tracking-widest font-bold mb-6 focus:border-pink-500 focus:ring-pink-500"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />

                    <button onClick={handleVerifyAndRegister} disabled={loading || otp.length < 4} className="btn w-full btn-primary bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none rounded-xl font-bold">
                        {loading ? "Verifying..." : "Confirm & Create Account"}
                    </button>
                    
                    <button onClick={() => setShowOtpModal(false)} className="btn btn-ghost btn-sm mt-4 text-gray-400">Cancel</button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default RegisterPage;