import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAreaDetails, clearSelectedArea } from '../../features/parkingSlice';
import { createNewBooking } from '../../features/bookingSlice';
import { FiMapPin, FiUser, FiInfo, FiChevronRight, FiCreditCard } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const AreaDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { selectedArea, slots, loading } = useSelector((state) => state.parking);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [hours, setHours] = useState(1);
  
  // Payment Simulator states
  const [showPayment, setShowPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    dispatch(fetchAreaDetails(id));
    return () => {
      dispatch(clearSelectedArea());
    };
  }, [dispatch, id]);

  const handleSelectSlot = (slot) => {
    if (slot.status !== 'available') return;
    setSelectedSlot(slot);
    setShowPayment(false); // reset payment view
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedSlot || !vehicleNumber || !ownerName) return;
    setShowPayment(true);
  };

  const handlePayAndBook = async () => {
    setIsPaying(true);
    // Simulate API Network Delay
    setTimeout(async () => {
      try {
        const bookingData = {
          areaId: selectedArea._id,
          slotId: selectedSlot._id,
          vehicleDetails: {
            type: vehicleType,
            number: vehicleNumber.toUpperCase(),
            owner: ownerName
          },
          reservedHours: Number(hours)
        };
        const result = await dispatch(createNewBooking(bookingData));
        if (result.meta.requestStatus === 'fulfilled') {
          addToast('Booking created successfully!', 'success');
          navigate(`/bookings/${result.payload._id}`);
        } else {
          addToast(result.payload || 'Booking failed', 'error');
        }
      } catch (err) {
        console.error(err);
      }
      setIsPaying(false);
    }, 1500);
  };

  if (loading || !selectedArea) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const estimatedCost = hours * selectedArea.feePerHour;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 85, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative font-semibold text-xs text-slate-500 dark:text-slate-400"
    >
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/5 blur-3xl rounded-full pointer-events-none animate-float" />

      {/* Navigation Breadcrumbs */}
      <motion.div 
        variants={itemVariants} 
        className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest mb-6"
      >
        <Link to="/explore" className="hover:text-blue-500 transition-colors">Parking Lots</Link>
        <FiChevronRight />
        <span className="text-slate-400 dark:text-slate-300 truncate max-w-[150px]">{selectedArea.name}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Area Info & visual slot matrix */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* structure info */}
          <motion.div 
            variants={itemVariants} 
            className="premium-card p-6 rounded-3xl bg-white dark:bg-zinc-950/80"
          >
            <h1 className="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">{selectedArea.name}</h1>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 font-bold">
              <FiMapPin className="text-blue-500" /> {selectedArea.address}, {selectedArea.city}
            </p>

            <div className="grid grid-cols-3 gap-4 border-t border-slate-200/10 dark:border-zinc-900/30 pt-6 mt-6 font-semibold">
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Fee per Hour</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">₹{selectedArea.feePerHour}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Operating Hours</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedArea.openingTime} - {selectedArea.closingTime}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Vehicles</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {selectedArea.vehicleTypes.join(', ')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Interactive Visual Slot Matrix Grid */}
          <motion.div 
            variants={itemVariants} 
            className="premium-card p-6 rounded-3xl bg-white dark:bg-zinc-950/80"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/10 dark:border-zinc-900/30 pb-4 mb-6 gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Select a Parking Slot</h2>
                <p className="text-xs text-slate-400 mt-1 font-bold">Interactive color-coded real-time slots map</p>
              </div>
              
              {/* Grid Legend */}
              <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-wide">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-green-500/20 border border-green-500 glow-primary" />
                  <span className="text-slate-400">Free</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-amber-500/20 border border-amber-500" />
                  <span className="text-slate-400">Reserved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-red-500/20 border border-red-500" />
                  <span className="text-slate-400">Occupied</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 font-extrabold text-sm tracking-wide">
              {slots.map((slot) => {
                const isSelected = selectedSlot?._id === slot._id;
                let colorClass = 'neon-glow-green';
                
                if (slot.status === 'reserved') {
                  colorClass = 'neon-glow-amber cursor-not-allowed';
                } else if (slot.status === 'occupied') {
                  colorClass = 'neon-glow-red cursor-not-allowed';
                } else if (slot.status === 'expired') {
                  colorClass = 'neon-glow-zinc cursor-not-allowed';
                }

                if (isSelected) {
                  colorClass = 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/30 active:scale-95';
                }

                return (
                  <button
                    key={slot._id}
                    onClick={() => handleSelectSlot(slot)}
                    disabled={slot.status !== 'available'}
                    className={`
                      h-14 border rounded-xl flex flex-col items-center justify-center transition-all duration-300 font-extrabold active:scale-95
                      ${colorClass}
                    `}
                  >
                    <span>{slot.slotId.substring(slot.slotId.lastIndexOf('-') + 1)}</span>
                    {slot.status === 'available' && !isSelected && (
                      <span className="text-[8px] font-black uppercase opacity-75 mt-0.5 tracking-wider">FREE</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right 1 Column: Reservation Details Panel / Payment Simulator */}
        <div className="lg:col-span-1">
          <motion.div 
            variants={itemVariants} 
            className="premium-card p-6 rounded-3xl bg-white dark:bg-zinc-950/80 sticky top-24"
          >
            {!selectedSlot ? (
              <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                <FiInfo className="mx-auto mb-3 text-blue-500 animate-float" size={30} />
                <span>Select an available slot on the left layout grid map to proceed with your booking.</span>
              </div>
            ) : showPayment ? (
              /* Payment Slide-in / High-Fidelity Simulator View */
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans flex items-center gap-2">
                    <FiCreditCard className="text-blue-500" />
                    Payment Checkout
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-bold">Stripe simulated payment gateway</p>
                </div>

                {/* Simulated Realistic Physical Card Vector Card */}
                <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-zinc-950 p-5 text-white flex flex-col justify-between shadow-lg relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-2xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    {/* Golden Chip */}
                    <div className="h-9 w-12 rounded-md bg-gradient-to-br from-amber-300 to-yellow-600 border border-yellow-700/30 flex items-center justify-center opacity-90 shadow-sm" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Visa Debit</span>
                  </div>
                  
                  {/* Card number display */}
                  <div className="text-base font-bold tracking-widest font-mono text-center my-2 text-slate-100">
                    {cardNumber}
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    <div className="flex flex-col gap-0.5 max-w-[150px] truncate">
                      <span>Cardholder</span>
                      <span className="text-white font-bold tracking-wide truncate">{ownerName || 'Amal Raj'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right font-mono">
                      <span>Expires</span>
                      <span className="text-white font-bold">{cardExpiry}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice calculations summary block */}
                <div className="flex flex-col gap-3.5 bg-slate-100/30 dark:bg-zinc-900/20 border border-slate-200/20 dark:border-zinc-900/40 p-4 rounded-2xl text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Structure ID</span>
                    <span className="font-extrabold dark:text-white uppercase">{selectedArea.areaId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Allocated Space</span>
                    <span className="font-extrabold text-blue-500 uppercase">{selectedSlot.slotId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stay Duration</span>
                    <span className="font-extrabold dark:text-white">{hours} Hours</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200/10 dark:border-zinc-900/30 pt-3 text-xs font-extrabold uppercase mt-1">
                    <span className="text-slate-400">Grand Total Paid</span>
                    <span className="text-base text-blue-600 dark:text-blue-400">₹{estimatedCost}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase">Credit Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="glass-input py-2 text-sm bg-slate-50 dark:bg-zinc-900/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase">Expiration</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="glass-input py-2 text-sm text-center bg-slate-50 dark:bg-zinc-900/30 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase">CVC PIN</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="glass-input py-2 text-sm text-center bg-slate-50 dark:bg-zinc-900/30 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mt-2">
                  <button
                    onClick={handlePayAndBook}
                    disabled={isPaying}
                    className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2"
                  >
                    {isPaying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
                        Authorizing stay payment...
                      </>
                    ) : (
                      <>Simulate Secure Booking</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPayment(false)}
                    disabled={isPaying}
                    className="btn-secondary w-full py-2.5 text-xs font-bold uppercase tracking-wider justify-center"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Booking Details Form */
              <form onSubmit={handleProceedToPayment} className="flex flex-col gap-5 text-slate-500 dark:text-slate-400">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Reservation Summary</h3>
                  <p className="text-xs text-slate-400 mt-1 font-bold">Review fees and enter vehicle details</p>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-100/30 dark:bg-zinc-900/20 border border-slate-200/20 dark:border-zinc-900/40 rounded-2xl">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selected Space</span>
                    <span className="font-extrabold text-sm text-slate-800 dark:text-white mt-0.5">{selectedSlot.slotId}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="text-[10px] text-red-500 hover:underline font-extrabold uppercase tracking-wide"
                  >
                    Change Slot
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wide">Vehicle Owner Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                      className="w-full pl-11 glass-input"
                      placeholder="Amal Raj"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wide">Vehicle Type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full glass-input font-bold"
                    >
                      <option value="Car">Car</option>
                      <option value="Bike">Bike</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wide">Plate Number</label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      required
                      className="w-full glass-input uppercase tracking-wider font-bold"
                      placeholder="KL-07-CD-1234"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wide">Reservation Duration</label>
                  <select
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full glass-input font-bold text-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 12, 24].map((h) => (
                      <option key={h} value={h}>{h} {h === 1 ? 'Hour' : 'Hours'}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200/10 dark:border-zinc-900/30 pt-4 mt-2 font-extrabold text-xs uppercase tracking-wide">
                  <span className="text-slate-400">Total Price Estimate:</span>
                  <span className="text-xl text-blue-600 dark:text-blue-400">₹{estimatedCost}</span>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3.5 mt-2 text-xs uppercase tracking-wider font-extrabold shadow-md"
                >
                  Proceed to Payment
                </button>
              </form>
            )}
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};

export default AreaDetails;
