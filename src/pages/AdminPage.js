import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- CUSTOM NOTIFICATION COMPONENT ---
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 100 }}
      className={`fixed top-10 right-10 z-[100] px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 border bg-white ${
        type === 'success' ? 'border-green-200 text-green-700' : 'border-red-200 text-red-600'
      }`}
    >
      <span className="text-xl">{type === 'success' ? '✅' : '⚠️'}</span>
      <p className="font-bold text-sm">{message}</p>
    </motion.div>
  );
};

function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  
  // --- DATA STATES ---
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // --- SERVICE MODAL STATES ---
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // Null = Add Mode, Object = Edit Mode
  const [serviceForm, setServiceForm] = useState({ category: 'Cut', name: '', price: '', duration: '60 min', description: '' });

  const showToast = (msg, type = 'success') => setNotification({ message: msg, type });

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const bookingsRes = await axios.get('http://localhost:5000/api/admin/bookings');
      setBookings(bookingsRes.data);
      const servicesRes = await axios.get('http://localhost:5000/api/services');
      setServices(servicesRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading admin data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- STATS CALCULATION ---
  const totalRevenue = bookings.reduce((acc, curr) => {
      const total = curr.totalAmount || curr.total || 0;
      const advance = curr.advancePaid || curr.paid || 0;
      const actualPaid = curr.status === 'Completed' ? total : advance;
      return acc + actualPaid;
  }, 0);

  const pendingBalance = bookings.reduce((acc, curr) => {
      if (curr.status === 'Completed') return acc; 
      const total = curr.totalAmount || curr.total || 0;
      const advance = curr.advancePaid || curr.paid || 0;
      return acc + (total - advance);
  }, 0);
  
  const stats = [
    { label: "Total Revenue", value: `₹${totalRevenue}`, icon: "💰" },
    { label: "Total Bookings", value: bookings.length, icon: "📅" },
    { label: "Due at Salon", value: `₹${pendingBalance}`, icon: "⏳" },
  ];

  // --- BOOKING HANDLERS ---
  const handleMarkComplete = async (id) => {
    if (!window.confirm("Is the service done? This will allow the client to pay the balance.")) return;
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status: "Service Done" });
      showToast("Service Marked Done! Payment unlocked.");
      fetchData(); 
    } catch (err) {
      showToast("Error updating status.", "error");
    }
  };

  // --- SERVICE HANDLERS ---
  const openAddServiceModal = () => {
      setEditingService(null);
      setServiceForm({ category: 'Cut', name: '', price: '', duration: '60 min', description: '' });
      setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (service) => {
      setEditingService(service);
      setServiceForm(service);
      setIsServiceModalOpen(true);
  };

  const handleDeleteService = async (id) => {
      if(!window.confirm("Are you sure you want to delete this service?")) return;
      try {
          await axios.delete(`http://localhost:5000/api/services/${id}`);
          showToast("Service Deleted Successfully");
          fetchData();
      } catch (err) { showToast("Failed to delete service", "error"); }
  };

  const handleSaveService = async (e) => {
      e.preventDefault();
      try {
          if (editingService) {
              // Edit Mode
              await axios.put(`http://localhost:5000/api/services/${editingService._id}`, serviceForm);
              showToast("Service Updated!");
          } else {
              // Add Mode
              await axios.post(`http://localhost:5000/api/services`, serviceForm);
              showToast("New Service Added!");
          }
          setIsServiceModalOpen(false);
          fetchData();
      } catch (err) {
          showToast("Failed to save service", "error");
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] text-stone-500 font-bold">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex font-sans">
      
      <AnimatePresence>
        {notification && (
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
        )}
      </AnimatePresence>

      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-stone-900 text-stone-400 flex flex-col fixed h-full z-20">
        <div className="p-8">
            <h1 className="text-2xl font-serif text-white font-bold tracking-wide">Looklab<span className="text-amber-500">.</span></h1>
            <p className="text-xs uppercase tracking-widest mt-2">Owner Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
            {[
                { id: 'dashboard', label: 'Overview', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
                { id: 'schedule', label: 'Master Schedule', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5' },
                { id: 'services', label: 'Service Menu', icon: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125-1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.25 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m0 0h-7.5m3.75-1.5v1.5' },
            ].map((item) => (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        activeTab === item.id 
                        ? 'bg-amber-500 text-white shadow-lg' 
                        : 'hover:bg-stone-800 hover:text-white'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className="font-bold">{item.label}</span>
                </button>
            ))}
        </nav>
        <div className="p-8">
            <button className="text-stone-500 hover:text-white text-sm font-bold flex items-center gap-2">← Exit Panel</button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 ml-64 p-12">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Daily Overview</h2>
                <div className="grid grid-cols-3 gap-6 mb-12">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-2xl">{stat.icon}</div>
                            <div>
                                <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold text-stone-800">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <h3 className="text-xl font-bold text-stone-800 mb-4">Recent Bookings</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 text-stone-400 text-xs uppercase font-bold">
                            <tr><th className="p-4">Customer</th><th className="p-4">Service</th><th className="p-4">Amount</th><th className="p-4">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {bookings.slice(0, 5).map(b => (
                                <tr key={b._id}>
                                    <td className="p-4 font-bold text-stone-800">{b.user?.name || "Guest"}</td>
                                    <td className="p-4 text-stone-600">{b.service}</td>
                                    <td className="p-4 text-green-600 font-bold">₹{b.advancePaid || b.paid || 0}</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">{b.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        )}

        {/* MASTER SCHEDULE */}
        {activeTab === 'schedule' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">All Appointments</h2>
                <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 text-stone-400 text-xs uppercase tracking-wider font-bold">
                            <tr><th className="p-6">Date & Time</th><th className="p-6">Client</th><th className="p-6">Service</th><th className="p-6">Contact</th><th className="p-6">Payment</th><th className="p-6 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {bookings.map((apt) => {
                                const total = apt.totalAmount || apt.total || 0;
                                const advance = apt.advancePaid || apt.paid || 0;
                                const isCompleted = apt.status === 'Completed';
                                const displayedPaid = isCompleted ? total : advance;
                                const due = total - displayedPaid;

                                return (
                                    <tr key={apt._id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold text-stone-900">{apt.date}</div>
                                            <div className="text-xs text-amber-600 font-bold bg-amber-50 inline-block px-2 py-1 rounded mt-1">{apt.timeSlot}</div>
                                        </td>
                                        <td className="p-6 font-medium text-stone-700">{apt.user?.name || "Unknown"}</td>
                                        <td className="p-6 text-stone-500">{apt.service}</td>
                                        <td className="p-6">
                                            <div className="text-sm">{apt.user?.email}</div>
                                            <div className="text-xs text-stone-400">{apt.user?.phone}</div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded border border-green-100">Paid ₹{displayedPaid}</span>
                                            {due > 0 && <div className="text-[10px] text-stone-400 mt-1">Due: ₹{due}</div>}
                                        </td>
                                        <td className="p-6 text-right">
                                            {(apt.status === 'Scheduled' || apt.status === 'Confirmed') && (
                                                <button onClick={() => handleMarkComplete(apt._id)} className="btn btn-sm bg-stone-900 text-white border-none hover:bg-stone-700">Mark Service Done</button>
                                            )}
                                            {apt.status === 'Service Done' && <span className="text-blue-600 font-bold text-xs">Waiting for Balance</span>}
                                            {apt.status === 'Completed' && <span className="text-green-600 font-bold text-xs">✅ Completed</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                            {bookings.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-stone-400">No bookings found yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        )}

        {/* SERVICES (UPDATED WITH ADD/EDIT/DELETE) */}
        {activeTab === 'services' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-serif font-bold text-stone-900">Service Menu</h2>
                    <button onClick={openAddServiceModal} className="btn bg-stone-900 text-white hover:bg-stone-700 border-none rounded-xl px-6 shadow-lg">
                        + Add New Service
                    </button>
                </div>

                {services.length === 0 ? (
                    <div className="text-center text-stone-400 py-10">No services found in database.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((service) => (
                            <div key={service._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex justify-between items-center group hover:shadow-md transition-all">
                                {/* Service Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {service.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-800 text-lg">{service.name}</h3>
                                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                                            Price: ₹{service.price} {/* Advance Removed */}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions (NOW FUNCTIONAL) */}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditServiceModal(service)} className="btn btn-sm btn-circle btn-ghost text-stone-500 hover:bg-stone-100">✏️</button>
                                    <button onClick={() => handleDeleteService(service._id)} className="btn btn-sm btn-circle btn-ghost text-red-400 hover:bg-red-50">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        )}

      </div>

      {/* --- ADD/EDIT SERVICE MODAL --- */}
      <AnimatePresence>
        {isServiceModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsServiceModalOpen(false)}
                ></motion.div>

                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl overflow-hidden"
                >
                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">{editingService ? "Edit Service" : "Add Service"}</h2>
                    
                    <form onSubmit={handleSaveService} className="space-y-4">
                        <div className="form-control">
                            <label className="label text-xs font-bold text-stone-500 uppercase">Service Name</label>
                            <input type="text" required value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} className="input input-bordered w-full" />
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="form-control flex-1">
                                <label className="label text-xs font-bold text-stone-500 uppercase">Price (₹)</label>
                                <input type="number" required value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} className="input input-bordered w-full" />
                            </div>
                            <div className="form-control flex-1">
                                <label className="label text-xs font-bold text-stone-500 uppercase">Duration</label>
                                <input type="text" placeholder="e.g. 60 min" value={serviceForm.duration} onChange={e => setServiceForm({...serviceForm, duration: e.target.value})} className="input input-bordered w-full" />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label text-xs font-bold text-stone-500 uppercase">Category</label>
                            <select value={serviceForm.category} onChange={e => setServiceForm({...serviceForm, category: e.target.value})} className="select select-bordered w-full">
                                <option>Cut</option>
                                <option>Color</option>
                                <option>Treatment</option>
                                <option>Spa</option>
                            </select>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setIsServiceModalOpen(false)} className="btn btn-ghost flex-1">Cancel</button>
                            <button type="submit" className="btn bg-stone-900 text-white flex-1">Save</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default AdminPage;