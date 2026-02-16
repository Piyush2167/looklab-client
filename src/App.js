import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // <--- 1. Import useLocation

// ... Import your Navbar and Pages ...
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AiStylistPage from './pages/AiStylistPage'; 
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage'; // <--- Admin Page
import Footer from './components/Footer';
import ForgotPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';

import ScrollToTop from './components/ScrollToTop'; 

function App() {
  const location = useLocation(); // <--- 2. Get current URL

  // Check if we are on the Admin Panel
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen" data-theme="light">
      
      <ScrollToTop />

      {/* 3. Only show Navbar if NOT on Admin Page */}
      {!isAdminRoute && <Navbar />}
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/home" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/stylist-ai" element={<AiStylistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/footer" element={<Footer />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Route */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      
    </div>
  );
}

export default App;