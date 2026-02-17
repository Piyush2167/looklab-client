import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// --- CUSTOM NOTIFICATION COMPONENT (Floating Toast) ---
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-10 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-md ${
        type === 'success' 
          ? 'bg-stone-900/95 text-white border-stone-700' 
          : 'bg-red-50/95 text-red-600 border-red-100'
      }`}
    >
      <span className="text-2xl">{type === 'success' ? '✨' : '⚠️'}</span>
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider opacity-70">{type === 'success' ? 'Success' : 'Error'}</h4>
        <p className="text-sm font-bold">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100">✕</button>
    </motion.div>
  );
};

function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [notification, setNotification] = useState(null); // { message, type }
  const [userProfile, setUserProfile] = useState({ 
    name: "", email: "", phone: "", joined: "", visits: 0, profileImage: null 
  });

  const [gallery, setGallery] = useState([]); 
  const [ledger, setLedger] = useState([]);   
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gallery');

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [fileObject, setFileObject] = useState(null); 

  // Helper
  const showToast = (msg, type = 'success') => setNotification({ message: msg, type });

  // --- 1. FETCH DATA ON LOAD ---
  useEffect(() => {
    if (!authUser) return;

    const fetchData = async () => {
      try {
        const userId = authUser.id || authUser._id;
        const profileRes = await axios.get(`${API_URL}/api/user/${userId}`);
        setUserProfile(profileRes.data);
        const ledgerRes = await axios.get(`${API_URL}/api/user/${userId}/ledger`);
        setLedger(ledgerRes.data);
        const galleryRes = await axios.get(`${API_URL}/api/user/${userId}/gallery`);
        setGallery(galleryRes.data);
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser]);

  // --- 2. HANDLE EDIT PROFILE ---
  const handleEditClick = () => {
    setEditForm({ 
        name: userProfile.name, 
        phone: userProfile.phone || "", 
        tempImage: userProfile.profileImage 
    });
    setIsEditing(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileObject(file); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, tempImage: reader.result }); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('phone', editForm.phone);
    if (fileObject) {
        formData.append('profileImage', fileObject);
    }

    try {
        const userId = authUser.id || authUser._id;
        const res = await axios.put(`${API_URL}/api/user/${userId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        setUserProfile(prev => ({ 
            ...prev, 
            name: res.data.name, 
            phone: res.data.phone, 
            profileImage: res.data.profileImage 
        }));
        
        setIsEditing(false);
        showToast("Profile Updated Successfully!");
    } catch (error) {
        console.error("Failed to update profile", error);
        showToast("Failed to save changes.", "error");
    }
  };

  // --- 3. HANDLE BALANCE PAYMENT ---
  const handlePayBalance = async (booking) => {
    try {
        const bookingId = booking._id || booking.id;
        if (!bookingId) return showToast("Invalid Booking ID", "error");

        const total = booking.totalAmount || booking.total || 0;
        const paid = booking.advancePaid || booking.paid || 0;
        const balanceAmount = total - paid;

        if (balanceAmount <= 0) {
            showToast("No balance due!", "error");
            return;
        }

        const orderRes = await axios.post(`${API_URL}/api/bookings/create-order`, {
            amount: balanceAmount
        });

        const { id: order_id, amount, currency } = orderRes.data;

        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID,
            amount: amount,
            currency: currency,
            name: "LookLab Salon",
            description: "Balance Payment",
            order_id: order_id,
            config: {
                display: {
                  blocks: {
                    upi: { name: "Pay via UPI / QR", instruments: [{ method: "upi" }] },
                    cards: { name: "Pay via Card", instruments: [{ method: "card" }] },
                    netbanking: { name: "Netbanking", instruments: [{ method: "netbanking" }] },
                  },
                  sequence: ["block.upi", "block.cards", "block.netbanking"],
                  preferences: { show_default_blocks: false },
                },
            },
            handler: async function (response) {
                try {
                    const verifyRes = await axios.post(`${API_URL}/api/bookings/confirm-balance`, {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        bookingId: bookingId
                    });

                    if (verifyRes.data.success) {
                        showToast("Payment Successful! Booking Closed.");
                        setTimeout(() => window.location.reload(), 2000); 
                    }
                } catch (err) {
                    showToast("Payment Verification Failed", "error");
                }
            },
            theme: { color: "#000000" }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

    } catch (error) {
        console.error("Balance Payment Error:", error);
        showToast("Could not start payment.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6]">
        <span className="loading loading-spinner loading-lg text-stone-400"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-28 pb-12 px-6 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* TOAST NOTIFICATION RENDERER */}
        <AnimatePresence>
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}
        </AnimatePresence>

        {/* --- 1. PROFILE HEADER CARD --- */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-stone-100 mb-12 flex flex-col md:flex-row items-center gap-10">
          
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 border-2 border-amber-200 bg-white">
                <div className="w-full h-full rounded-full bg-stone-100 flex items-center justify-center overflow-hidden">
                    {userProfile.profileImage ? (
                        <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    )}
                </div>
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">{userProfile.name || "Welcome!"}</h1>
            <p className="text-stone-500 font-medium">{userProfile.email}</p>
            <p className="text-stone-400 text-sm mb-4">{userProfile.phone || "Add your phone number"}</p>
            <div className="inline-flex gap-4 text-sm font-bold tracking-widest text-stone-400 uppercase">
                <span>Joined {userProfile.joined ? new Date(userProfile.joined).getFullYear() : "..."}</span>
                <span>•</span>
                <span>{userProfile.visits || 0} Visits</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={handleEditClick} className="btn btn-outline border-stone-300 text-stone-600 hover:bg-stone-900 hover:text-white rounded-full px-8">Edit Profile</button>
            <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-ghost text-red-400 hover:bg-red-50 rounded-full px-8">Sign Out</button>
          </div>
        </div>

        {/* --- 2. TABS --- */}
        <div className="flex justify-center mb-10">
            <div className="bg-white p-1 rounded-full shadow-sm border border-stone-200 inline-flex">
                <button onClick={() => setActiveTab('gallery')} className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'gallery' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}>Style Vault</button>
                <button onClick={() => setActiveTab('ledger')} className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'ledger' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}>My Ledger</button>
            </div>
        </div>

        {/* --- 3. CONTENT AREA --- */}
        <div className="min-h-[400px]">
            {/* GALLERY TAB */}
            {activeTab === 'gallery' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gallery.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-stone-400"><p>No styles saved yet. Visit the AI Stylist to create one!</p></div>
                    ) : (
                        gallery.map((item) => (
                            <div key={item.id} className="group bg-white p-3 rounded-[2rem] shadow-sm border border-stone-100 hover:shadow-xl transition-all cursor-pointer">
                                <div className="relative h-64 rounded-[1.5rem] overflow-hidden mb-4">
                                    <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                </div>
                                <div className="px-2 pb-2">
                                    <h3 className="font-serif font-bold text-xl text-stone-800">{item.name}</h3>
                                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">{item.date}</p>
                                </div>
                            </div>
                        ))
                    )}
                </motion.div>
            )}

            {/* LEDGER TAB */}
            {activeTab === 'ledger' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
                    {ledger.length === 0 ? (
                        <div className="text-center py-12 text-stone-400"><p>No appointment history found.</p></div>
                    ) : (
                        ledger.map((apt) => {
                            const total = apt.totalAmount || apt.total || 0;
                            const paid = apt.advancePaid || apt.paid || 0;
                            const balance = total - paid;
                            const displayDate = new Date(apt.date);

                            return (
                                <div key={apt._id} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center min-w-[90px]">
                                            <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider">{displayDate.getDate()}</span>
                                            <span className="block text-xl font-serif font-bold text-stone-800">{displayDate.toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-stone-800">{apt.service}</h3>
                                            <p className="text-stone-500 text-sm mt-1">{apt.timeSlot}</p>
                                            <div className="mt-2">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${apt.status === 'Completed' ? 'bg-green-100 text-green-700' : apt.status === 'Service Done' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right w-full md:w-auto flex flex-col items-end">
                                        <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">Paid Amount</p>
                                        <p className="text-lg font-bold text-green-600">₹{paid}</p>
                                        
                                        {/* CONDITIONAL BUTTON */}
                                        {apt.status === 'Service Done' ? (
                                            <button onClick={() => handlePayBalance(apt)} className="mt-4 bg-stone-900 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform">
                                                Pay Balance: ₹{balance}
                                            </button>
                                        ) : apt.status === 'Completed' ? (
                                            <div className="mt-2 text-green-600 font-bold text-sm">Fully Paid ✅</div>
                                        ) : (
                                            <div className="mt-2 text-stone-300 font-bold text-sm">Due: ₹{balance}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </motion.div>
            )}
        </div>
      </div>

      {/* --- 4. EDIT MODAL --- */}
      <AnimatePresence>
        {isEditing && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsEditing(false)}
                ></motion.div>

                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl overflow-hidden"
                >
                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Update Profile</h2>
                    
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-stone-100 mb-4 overflow-hidden border-2 border-dashed border-amber-300 relative group cursor-pointer">
                                {editForm.tempImage ? (
                                    <img src={editForm.tempImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                                        <span className="text-xs font-bold">+ PHOTO</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                            </div>
                            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Tap to Change Photo</span>
                        </div>

                        <div className="form-control">
                            <label className="label text-xs font-bold text-stone-500 uppercase">Full Name</label>
                            <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="input input-bordered bg-stone-50 border-stone-200 focus:border-amber-400 w-full" />
                        </div>

                        <div className="form-control">
                            <label className="label text-xs font-bold text-stone-500 uppercase">Phone Number</label>
                            <input type="text" value={editForm.phone || ""} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="input input-bordered bg-stone-50 border-stone-200 focus:border-amber-400 w-full" />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost flex-1">Cancel</button>
                            <button type="submit" className="btn bg-stone-900 text-white hover:bg-stone-700 flex-1">Save Changes</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default ProfilePage;