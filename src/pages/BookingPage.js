import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function BookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date());
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [attachAiLook, setAttachAiLook] = useState(false);
  
  // Dynamic Data States
  const [services, setServices] = useState([]); // <--- NEW: Fetched from DB
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculations
  const totalAmount = selectedService ? selectedService.price : 0;
  const advanceAmount = totalAmount * 0.8; // 80% Advance
  const balanceAmount = totalAmount * 0.2; // 20% Due

  // --- 1. FETCH SERVICES ON LOAD ---
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/services`);
        setServices(res.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  // --- 2. FETCH SLOTS WHEN DATE CHANGES ---
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null); 
      try {
        const dateString = date.toDateString(); 
        const res = await axios.get(`${API_URL}/api/bookings/slots?date=${dateString}`);
        setSlots(res.data);
      } catch (error) {
        console.error("Error fetching slots:", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [date]);

  // --- 3. HANDLE PAYMENT AND BOOKING ---
  const handleBooking = async () => {
    if (!user) {
      alert("Please login to book an appointment.");
      return;
    }

    setIsProcessing(true);

    try {
      // A. Create Razorpay Order
      const orderRes = await axios.post(`${API_URL}/api/bookings/create-order`, {
        amount: advanceAmount
      });

      const { id: order_id, amount, currency } = orderRes.data;

      // B. Open Razorpay Popup (STRICT MODE: Card, Netbanking, UPI Only)
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "LookLab Salon",
        description: `Booking: ${selectedService.name}`,
        order_id: order_id,
        // --- RESTRICT PAYMENT METHODS ---
        config: {
          display: {
            blocks: {
              cards: {
                name: "Pay via Card",
                instruments: [{ method: "card" }],
              },
              netbanking: {
                name: "Netbanking",
                instruments: [{ method: "netbanking" }],
              },
              upi: {
                name: "UPI / QR Code",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: ["block.cards", "block.netbanking", "block.upi"],
            preferences: {
              show_default_blocks: false, // Hides PayLater/Wallets
            },
          },
        },
        // --------------------------------
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${API_URL}/api/bookings/confirm`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: {
                userId: user.id || user._id,
                service: selectedService.name,
                date: date.toDateString(),
                timeSlot: selectedSlot,
                totalAmount: totalAmount,
                advancePaid: advanceAmount
              }
            });

            if (verifyRes.data.success) {
              alert("✅ Booking Confirmed! See you at the salon.");
              navigate('/profile'); 
            }
          } catch (err) {
            console.error(err);
            alert("Payment failed or Slot filled up just now.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: function() { setIsProcessing(false); }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Booking Error:", error);
      alert("Could not initiate booking. Is the backend running?");
      setIsProcessing(false);
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-28 pb-12 px-6 flex flex-col items-center">
      
      {/* PROGRESS HEADER */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-200 -z-10"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-amber-400 -z-10 transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            {[1, 2, 3].map((num) => (
                <div key={num} className={`flex flex-col items-center gap-2 bg-[#F9F8F6] px-2`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= num ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-300 text-stone-400'}`}>
                        {num}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${step >= num ? 'text-stone-800' : 'text-stone-400'}`}>{num === 1 ? 'Service' : num === 2 ? 'Date' : 'Confirm'}</span>
                </div>
            ))}
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 overflow-hidden relative min-h-[650px] flex flex-col">
        <div className="p-8 md:p-12 flex-grow flex flex-col">
            <AnimatePresence mode='wait'>
                
                {/* STEP 1: SELECT SERVICE */}
                {step === 1 && (
                    <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col h-full">
                        <h2 className="text-3xl font-serif font-bold text-stone-900 text-center mb-8">Select Your Treatment</h2>
                        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar max-h-[450px]">
                            {services.length === 0 ? (
                                <p className="text-center text-stone-400">Loading services...</p>
                            ) : (
                                <div className="grid gap-4">
                                    {services.map((service) => (
                                        <div 
                                            key={service._id} // MongoDB uses _id
                                            onClick={() => setSelectedService(service)}
                                            className={`p-5 rounded-2xl cursor-pointer border-2 transition-all group ${
                                                selectedService?._id === service._id 
                                                ? 'border-amber-400 bg-amber-50/50' 
                                                : 'border-stone-100 hover:border-stone-300'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                                                        service.category === 'Cut' ? 'bg-blue-50 text-blue-600' : 
                                                        service.category === 'Color' ? 'bg-purple-50 text-purple-600' : 
                                                        'bg-green-50 text-green-600'
                                                    }`}>{service.category}</span>
                                                    <h3 className="font-bold text-lg text-stone-800">{service.name}</h3>
                                                </div>
                                                <span className={`text-lg font-bold ${selectedService?._id === service._id ? 'text-amber-600' : 'text-stone-800'}`}>₹{service.price}</span>
                                            </div>
                                            <div className="flex justify-between items-end pl-1">
                                                <p className="text-sm text-stone-500 max-w-sm">{service.description}</p>
                                                <span className="text-xs font-bold text-stone-400">{service.duration}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <style>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: #f5f5f4; border-radius: 10px; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 10px; }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a29e; }
                        `}</style>
                    </motion.div>
                )}

                {/* STEP 2: DATE & TIME */}
                {step === 2 && (
                    <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-8">
                        <h2 className="text-3xl font-serif font-bold text-stone-900 text-center">Choose a Time</h2>
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 flex justify-center">
                                <style>{`
                                    .react-calendar { border: none; font-family: 'Times New Roman', serif; width: 100%; }
                                    .react-calendar__tile--active { background: #1c1917 !important; color: white; border-radius: 12px; }
                                    .react-calendar__tile--now { background: #fef3c7; border-radius: 12px; }
                                `}</style>
                                <Calendar onChange={setDate} value={date} minDate={new Date()} className="text-stone-700" />
                            </div>
                            <div className="hidden md:block w-px bg-stone-200"></div>
                            <div className="flex-1">
                                <p className="text-center md:text-left text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
                                    {date.toDateString()}
                                </p>
                                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1">
                                    {loadingSlots ? (
                                        <div className="flex justify-center py-10">
                                            <span className="loading loading-spinner text-amber-500"></span>
                                        </div>
                                    ) : slots.length > 0 ? (
                                        slots.map((slot, index) => {
                                            const isFull = slot.isFull;
                                            const remaining = slot.remaining;

                                            return (
                                                <button
                                                    key={index}
                                                    disabled={isFull}
                                                    onClick={() => setSelectedSlot(slot.time)}
                                                    className={`py-4 px-6 rounded-xl border-2 flex justify-between items-center transition-all ${
                                                        isFull 
                                                        ? 'bg-stone-50 text-stone-300 border-transparent cursor-not-allowed decoration-stone-300 line-through' 
                                                        : selectedSlot === slot.time
                                                            ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                                                            : 'border-stone-200 hover:border-amber-400 text-stone-600'
                                                    }`}
                                                >
                                                    <span className="font-serif text-lg">{slot.time}</span>
                                                    <span className={`text-[10px] uppercase font-bold tracking-wide ${isFull ? 'text-red-300' : 'text-green-600'}`}>
                                                        {isFull ? "Full" : `${remaining} Slots Left`}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <p className="text-center text-stone-400 py-4">No slots available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: CONFIRM */}
                {step === 3 && (
                    <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" className="max-w-md mx-auto space-y-8">
                        <h2 className="text-3xl font-serif font-bold text-stone-900 text-center">Confirm Reservation</h2>
                        <div className="bg-stone-50 p-8 rounded-3xl border border-stone-200 relative">
                            <div className="space-y-4 mb-6 border-b border-stone-200 pb-6 border-dashed">
                                <div className="flex justify-between"><span className="text-stone-500">Service</span><span className="font-bold text-stone-900 text-right w-1/2">{selectedService?.name}</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Date</span><span className="font-bold text-stone-900">{date.toDateString()}</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Time</span><span className="font-bold text-stone-900">{selectedSlot}</span></div>
                            </div>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-stone-500 text-sm">Attach AI Style Goal?</span>
                                <input type="checkbox" className="checkbox checkbox-warning" checked={attachAiLook} onChange={(e) => setAttachAiLook(e.target.checked)} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-stone-400 text-sm"><span>Total Price</span><span className="line-through">₹{totalAmount}</span></div>
                                <div className="flex justify-between text-xl font-bold text-amber-600"><span>Pay Advance (80%)</span><span>₹{advanceAmount}</span></div>
                                <div className="flex justify-between text-stone-400 text-xs mt-1"><span>Due at Salon</span><span>₹{balanceAmount}</span></div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>

        {/* BOTTOM NAV */}
        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-between items-center">
            {step > 1 ? (
                <button onClick={handleBack} className="text-stone-500 font-bold text-sm uppercase tracking-wider hover:text-stone-900">← Back</button>
            ) : <div></div>}
            
            {step < 3 ? (
                <button 
                    onClick={handleNext} 
                    disabled={step === 1 ? !selectedService : !selectedSlot} 
                    className="bg-stone-900 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Next Step
                </button>
            ) : (
                <button 
                    onClick={handleBooking} 
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-10 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100"
                >
                    {isProcessing ? "Processing..." : `Pay ₹${advanceAmount} & Book`}
                </button>
            )}
        </div>

      </div>
    </div>
  );
}

export default BookingPage;