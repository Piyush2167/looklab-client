import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  setMessage('');
  setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setError("User not found or error sending email.");
      setMessage('');
    }finally {
    setLoading(false); 
  }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 font-serif">Reset Password</h2>
        <p className="text-gray-500 mb-6">Enter your email and we'll send you a link to get back into your account.</p>

        {message && <div className="alert alert-success mb-4 text-sm">{message}</div>}
        {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="btn btn-primary w-full bg-stone-900 border-none text-white">{loading ? "Sending Email..." : "Send Link"}</button>
        </form>

        <div className="mt-4">
            <Link to="/login" className="text-sm font-bold text-stone-400 hover:text-stone-900">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;