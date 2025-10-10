
// // // // // import React, { useEffect, useMemo, useState } from "react";
// // // // // import { useLocation, useNavigate } from "react-router-dom";
// // // // // import {
// // // // //   getSeats,
// // // // //   getSlots,
// // // // //   resolveSlotId,
// // // // //   createBookingSimple
// // // // // } from "../api/client";

// // // // // function cx(...a){ return a.filter(Boolean).join(" "); }
// // // // // function f12(hhmm="00:00"){
// // // // //   const [h,m]=(hhmm||"00:00").split(":").map(Number);
// // // // //   const am=h<12?"AM":"PM";
// // // // //   const h12=((h+11)%12)+1;
// // // // //   return `${h12}:${String(m).padStart(2,"0")} ${am}`;
// // // // // }

// // // // // export default function SeatSelection() {
// // // // //   const { search } = useLocation();
// // // // //   const navigate = useNavigate();
// // // // //   const q = new URLSearchParams(search);

// // // // //   const slotIdRaw   = q.get("slotId") || "";
// // // // //   const start       = q.get("start") || "";
// // // // //   const end         = q.get("end") || "";
// // // // //   const basePrice   = Number(q.get("price") || 0);
// // // // //   const workshopId  = q.get("workshopId") || q.get("centerId") || "c1";
// // // // //   const date        = q.get("date") || new Date().toISOString().slice(0,10);
// // // // //   const workshopTitle = q.get("workshopTitle") || "Workshop";
// // // // //   const companyName = q.get("companyName") || "Workshop";
// // // // //   const movieId = q.get("movieId") || "1";

// // // // //   // UI state
// // // // //   const [selectedTimeSlot, setSelectedTimeSlot] = useState(0);
// // // // //   const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
// // // // //   const [userDetails, setUserDetails] = useState({
// // // // //     name: '',
// // // // //     mobile: '',
// // // // //     email: ''
// // // // //   });

// // // // //   // Backend state
// // // // //   const [resolvedSlotId, setResolvedSlotId] = useState(slotIdRaw);
// // // // //   const [seatsRaw, setSeatsRaw] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [error, setError] = useState("");
// // // // //   const [selected, setSelected] = useState([]);
// // // // //   const [booking, setBooking] = useState(false);
// // // // //   const [times, setTimes] = useState([]);

// // // // //   // Generate 6 time slots of 10 minutes each within the selected hour
// // // // //   const generateTimeSlots = () => {
// // // // //     if (!start) {
// // // // //       console.warn("No start time provided, using default 9:00");
// // // // //       const defaultSlots = [];
// // // // //       for (let i = 0; i < 6; i++) {
// // // // //         const startMin = i * 10;
// // // // //         const endMin = (i + 1) * 10;
// // // // //         const startTime = `09:${String(startMin).padStart(2, '0')}`;
// // // // //         const endTime = `09:${String(endMin).padStart(2, '0')}`;
        
// // // // //         defaultSlots.push({
// // // // //           id: i,
// // // // //           startTime,
// // // // //           endTime,
// // // // //           displayStart: f12(startTime),
// // // // //           displayEnd: f12(endTime),
// // // // //           availableSeats: 10,
// // // // //           bookedSeats: i === 2 ? 3 : Math.floor(Math.random() * 4)
// // // // //         });
// // // // //       }
// // // // //       return defaultSlots;
// // // // //     }
    
// // // // //     const [startHour, startMin] = start.split(':').map(Number);
// // // // //     const slots = [];
    
// // // // //     for (let i = 0; i < 6; i++) {
// // // // //       const slotStartMin = startMin + (i * 10);
// // // // //       const slotEndMin = startMin + ((i + 1) * 10);
      
// // // // //       const slotStartHour = startHour + Math.floor(slotStartMin / 60);
// // // // //       const slotEndHour = startHour + Math.floor(slotEndMin / 60);
      
// // // // //       const finalStartMin = slotStartMin % 60;
// // // // //       const finalEndMin = slotEndMin % 60;
      
// // // // //       const startTime = `${String(slotStartHour).padStart(2, '0')}:${String(finalStartMin).padStart(2, '0')}`;
// // // // //       const endTime = `${String(slotEndHour).padStart(2, '0')}:${String(finalEndMin).padStart(2, '0')}`;
      
// // // // //       slots.push({
// // // // //         id: i,
// // // // //         startTime,
// // // // //         endTime,
// // // // //         displayStart: f12(startTime),
// // // // //         displayEnd: f12(endTime),
// // // // //         availableSeats: 10,
// // // // //         bookedSeats: i === 2 || i === 4 ? 3 : Math.floor(Math.random() * 4)
// // // // //       });
// // // // //     }
    
// // // // //     return slots;
// // // // //   };

// // // // //   const timeSlots = generateTimeSlots();

// // // // //   // If slotId missing (navigated by time only), resolve it
// // // // //   useEffect(() => {
// // // // //     let alive = true;
// // // // //     (async () => {
// // // // //       if (resolvedSlotId) return;
// // // // //       if (!workshopId || !date || !start) return;
// // // // //       try {
// // // // //         const id = await resolveSlotId(workshopId, date, start, end || undefined);
// // // // //         if (!alive) return;
// // // // //         setResolvedSlotId(String(id));
// // // // //       } catch {
// // // // //         if (!alive) return;
// // // // //         setError("Could not resolve showtime. Please go back and pick another time.");
// // // // //       }
// // // // //     })();
// // // // //     return () => { alive = false; };
// // // // //   }, [resolvedSlotId, workshopId, date, start, end]);

// // // // //   // Load seats for the resolved slot
// // // // //   useEffect(() => {
// // // // //     let alive = true;
// // // // //     (async () => {
// // // // //       if (!resolvedSlotId) { setLoading(false); return; }
// // // // //       try {
// // // // //         setLoading(true);
// // // // //         setError("");
// // // // //         const data = await getSeats(resolvedSlotId);
// // // // //         if (!alive) return;
// // // // //         const list = Array.isArray(data?.seats) ? data.seats : [];
// // // // //         setSeatsRaw(list);
// // // // //       } catch (e) {
// // // // //         if (!alive) return;
// // // // //         setError(e?.message || "Failed to load seats");
// // // // //         setSeatsRaw([]);
// // // // //       } finally {
// // // // //         if (alive) setLoading(false);
// // // // //       }
// // // // //     })();
// // // // //     return () => { alive = false; };
// // // // //   }, [resolvedSlotId]);

// // // // //   // Load time chips for same center/date
// // // // //   useEffect(() => {
// // // // //     let alive = true;
// // // // //     (async () => {
// // // // //       try {
// // // // //         const data = await getSlots(workshopId, date);
// // // // //         if (!alive) return;
// // // // //         const list = Array.isArray(data?.slots) ? data.slots : [];
// // // // //         setTimes(list.map(s => ({ id: String(s.id), start:s.start, end:s.end, status:s.status, subtitle:s.subtitle })));
// // // // //       } catch { /* ignore */ }
// // // // //     })();
// // // // //     return () => { alive = false; };
// // // // //   }, [workshopId, date]);

// // // // //   // 🎯 Only first 10 seats (label 1..10), but keep the real seat ids for booking
// // // // //   const seats10 = useMemo(() => {
// // // // //     const sorted = [...seatsRaw].sort((a,b) => Number(a.id) - Number(b.id));
// // // // //     return sorted.slice(0, 10).map((s, i) => ({
// // // // //       ...s,
// // // // //       displayNo: i + 1 // 1..10 in UI
// // // // //     }));
// // // // //   }, [seatsRaw]);

// // // // //   const total = useMemo(() => selected.reduce((sum, id) => {
// // // // //     const seat = seats10.find(s => s.id === id);
// // // // //     return sum + (seat?.price || basePrice || 0);
// // // // //   }, 0), [selected, seats10, basePrice]);

// // // // //   function toggleSeat(id, status) {
// // // // //     if (status !== "AVAILABLE") return;
    
// // // // //     setSelected(prev => {
// // // // //       if (prev.includes(id)) {
// // // // //         // If already selected, deselect it
// // // // //         return prev.filter(x => x !== id);
// // // // //       } else {
// // // // //         // Only allow 1 seat selection per workshop per company
// // // // //         return [id]; // Replace any existing selection with this one
// // // // //       }
// // // // //     });
// // // // //   }

// // // // //   function openUserDetailsPopup() {
// // // // //     if (selected.length === 0 || selectedTimeSlot === null) return;
// // // // //     setShowUserDetailsPopup(true);
// // // // //   }

// // // // //   async function confirmBooking() {
// // // // //     if (!userDetails.name || !userDetails.mobile || !userDetails.email) {
// // // // //       alert('Please fill all required fields');
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       setBooking(true);
// // // // //       setError("");

// // // // //       // Get selected time slot details
// // // // //       const selectedSlot = timeSlots[selectedTimeSlot];
// // // // //       const selectedSeat = seats10.find(s => s.id === selected[0]);

// // // // //       // Create booking payload with backend format
// // // // //       const payload = {
// // // // //         slotId: Number(resolvedSlotId || 0),
// // // // //         name: userDetails.name.trim(),
// // // // //         email: userDetails.email.trim(),
// // // // //         mobile_no: userDetails.mobile.trim(),
// // // // //         seats: selected,
// // // // //         amount_paid: total,
// // // // //         payment_ref: `demo_${Date.now()}`
// // // // //       };

// // // // //       let resp;
// // // // //       if (resolvedSlotId) {
// // // // //         resp = await createBookingSimple(payload);
// // // // //       } else {
// // // // //         // If no backend slot, create mock response
// // // // //         resp = {
// // // // //           bookingId: `BK${Date.now()}`,
// // // // //           total: total,
// // // // //           amount_paid: total
// // // // //         };
// // // // //       }

// // // // //       const bookingId = resp.bookingId ?? resp.id ?? `BK${Date.now()}`;
// // // // //       const params = new URLSearchParams({
// // // // //         bookingId: String(bookingId),
// // // // //         companyName: companyName,
// // // // //         workshopTitle: workshopTitle,
// // // // //         venue: q.get("venue") || "Medical Center, Delhi",
// // // // //         date: date,
// // // // //         startTime: selectedSlot ? selectedSlot.displayStart : f12(start),
// // // // //         endTime: selectedSlot ? selectedSlot.displayEnd : f12(end || start),
// // // // //         seatNumber: selectedSeat ? String(selectedSeat.displayNo) : "1",
// // // // //         amount: String(resp.total ?? resp.amount_paid ?? total),
// // // // //         userName: userDetails.name.trim(),
// // // // //         userMobile: userDetails.mobile.trim(),
// // // // //         userEmail: userDetails.email.trim()
// // // // //       }).toString();

// // // // //       navigate(`/confirmation?${params}`);
// // // // //     } catch (e) {
// // // // //       setError(e?.message || "Could not complete booking");
// // // // //     } finally {
// // // // //       setBooking(false);
// // // // //       setShowUserDetailsPopup(false);
// // // // //     }
// // // // //   }

// // // // //   function goBack(){ navigate(-1); }
// // // // //   function switchTime(t){
// // // // //     const params = new URLSearchParams({
// // // // //       slotId: t.id, start: t.start, end: t.end,
// // // // //       price: String(basePrice), workshopId, date, workshopTitle
// // // // //     }).toString();
// // // // //     navigate(`/select-seats?${params}`, { replace: true });
// // // // //     setSelected([]);
// // // // //     setResolvedSlotId(t.id);
// // // // //   }

// // // // //   if (loading) return (
// // // // //     <div className="min-h-screen bg-white flex items-center justify-center">
// // // // //       <div className="text-center">
// // // // //         <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
// // // // //         <p className="text-gray-600">Loading seats...</p>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // //   if (error) return (
// // // // //     <div className="min-h-screen bg-white flex items-center justify-center">
// // // // //       <div className="text-center max-w-md mx-auto p-6">
// // // // //         <div className="text-red-500 text-4xl mb-4">⚠️</div>
// // // // //         <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Error</h2>
// // // // //         <p className="text-red-600 mb-4">{error}</p>
// // // // //         <button 
// // // // //           onClick={() => window.location.reload()} 
// // // // //           className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
// // // // //         >
// // // // //           Try Again
// // // // //         </button>
// // // // //       </div>
// // // // //     </div>
// // // // //   );

// // // // //   return (
// // // // //     <div className="min-h-screen bg-white">
// // // // //       {/* Header */}
// // // // //       <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
// // // // //         <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
// // // // //           <button onClick={goBack} className="mr-1 rounded px-2 py-1 text-gray-700 hover:bg-gray-100" aria-label="Back">‹</button>
// // // // //           <div className="h-9 w-56 rounded bg-gray-900 text-white grid place-items-center text-sm font-semibold">{companyName}</div>
// // // // //           <div className="flex-1 h-9 min-w-[280px] ml-3 rounded bg-sky-200 text-gray-900 grid place-items-center text-sm font-semibold">
// // // // //             {workshopTitle} 
// // // // //           </div>
// // // // //         </div>
// // // // //       </header>

// // // // //       {/* Main */}
// // // // //       <main className="mx-auto max-w-6xl px-4 py-6">
// // // // //         {/* Time Slots Section */}
// // // // //         <div className="rounded-xl border p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
// // // // //           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
// // // // //             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
// // // // //             Select 10-Minute Time Slot
// // // // //           </h3>
// // // // //           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
// // // // //             {timeSlots.map((slot) => {
// // // // //               const isSelected = selectedTimeSlot === slot.id;
// // // // //               const isFullyBooked = slot.bookedSeats >= slot.availableSeats;
// // // // //               const availableCount = slot.availableSeats - slot.bookedSeats;
              
// // // // //               return (
// // // // //                 <button
// // // // //                   key={slot.id}
// // // // //                   onClick={() => !isFullyBooked && setSelectedTimeSlot(slot.id)}
// // // // //                   disabled={isFullyBooked}
// // // // //                   className={cx(
// // // // //                     "p-4 rounded-lg border-2 transition-all duration-200 text-left",
// // // // //                     isSelected 
// // // // //                       ? "border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105" 
// // // // //                       : isFullyBooked 
// // // // //                         ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
// // // // //                         : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
// // // // //                   )}
// // // // //                 >
// // // // //                   <div className="text-sm font-semibold">
// // // // //                     {slot.displayStart}
// // // // //                   </div>
// // // // //                   <div className="text-xs opacity-75 mt-1">
// // // // //                     to {slot.displayEnd}
// // // // //                   </div>
// // // // //                   <div className={cx(
// // // // //                     "text-xs mt-2 px-2 py-1 rounded-full inline-block",
// // // // //                     isSelected 
// // // // //                       ? "bg-white/20 text-white"
// // // // //                       : isFullyBooked 
// // // // //                         ? "bg-red-100 text-red-600"
// // // // //                         : availableCount <= 3 
// // // // //                           ? "bg-orange-100 text-orange-600"
// // // // //                           : "bg-green-100 text-green-600"
// // // // //                   )}>
// // // // //                     {isFullyBooked ? "FULL" : `${availableCount} seats`}
// // // // //                   </div>
// // // // //                 </button>
// // // // //               );
// // // // //             })}
// // // // //           </div>
// // // // //         </div>

// // // // //         <div className="rounded-xl border p-6 bg-gradient-to-b from-gray-50 to-white">
// // // // //           {/* Seat Selection Header */}
// // // // //           <div className="mb-6">
// // // // //             <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
// // // // //               <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
// // // // //               Select Your Seats
// // // // //               {selectedTimeSlot !== null && timeSlots[selectedTimeSlot] && (
// // // // //                 <span className="ml-4 text-sm font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
// // // // //                   {timeSlots[selectedTimeSlot].displayStart} - {timeSlots[selectedTimeSlot].displayEnd}
// // // // //                 </span>
// // // // //               )}
// // // // //             </h3>
// // // // //             <p className="text-sm text-gray-600">Choose your preferred seat for the selected time slot (maximum 1 seat per workshop)</p>
// // // // //           </div>

// // // // //           {/* Legend */}
// // // // //           <div className="mb-6 flex flex-wrap justify-center gap-6 text-sm">
// // // // //             <span className="inline-flex items-center gap-2">
// // // // //               <span className="h-4 w-4 rounded bg-emerald-50 border-2 border-emerald-200"></span> 
// // // // //               Available
// // // // //             </span>
// // // // //             <span className="inline-flex items-center gap-2">
// // // // //               <span className="h-4 w-4 rounded bg-blue-500 border-2 border-blue-600"></span> 
// // // // //               Selected
// // // // //             </span>
// // // // //             <span className="inline-flex items-center gap-2">
// // // // //               <span className="h-4 w-4 rounded bg-red-100 border-2 border-red-200"></span> 
// // // // //               Booked
// // // // //             </span>
// // // // //           </div>

// // // // //           {/* 10 Seats Layout */}
// // // // //           <div className="flex flex-col items-center">
// // // // //             <div className="mb-6 text-center">
// // // // //               <div className="text-sm text-gray-600 mb-2">Available: {seats10.filter(s => s.status === "AVAILABLE").length}/10 seats</div>
// // // // //               <div className="w-full max-w-md h-2 bg-gray-200 rounded-full mx-auto">
// // // // //                 <div 
// // // // //                   className="h-2 bg-emerald-500 rounded-full transition-all duration-300"
// // // // //                   style={{ width: `${(seats10.filter(s => s.status === "AVAILABLE").length / 10) * 100}%` }}
// // // // //                 ></div>
// // // // //               </div>
// // // // //             </div>
            
// // // // //             <div className="grid grid-cols-5 gap-4 max-w-lg mx-auto">
// // // // //               {seats10.map(seat => {
// // // // //                 const isSelected = selected.includes(seat.id);
// // // // //                 const disabled = seat.status !== "AVAILABLE";

// // // // //                 return (
// // // // //                   <button
// // // // //                     key={seat.id}
// // // // //                     onClick={() => toggleSeat(seat.id, seat.status)}
// // // // //                     disabled={disabled}
// // // // //                     className={cx(
// // // // //                       "h-16 w-16 rounded-xl flex flex-col items-center justify-center text-sm font-semibold border-2 transition-all duration-200",
// // // // //                       disabled
// // // // //                         ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
// // // // //                         : isSelected
// // // // //                           ? "bg-blue-500 text-white border-blue-600 shadow-lg transform scale-105"
// // // // //                           : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md hover:scale-105"
// // // // //                     )}
// // // // //                     title={`Seat ${seat.displayNo} • ₹${seat.price || basePrice}`}
// // // // //                   >
// // // // //                     <div className="text-xs opacity-75">Seat</div>
// // // // //                     <div className="text-lg font-bold">{seat.displayNo}</div>
// // // // //                   </button>
// // // // //                 );
// // // // //               })}
// // // // //             </div>
            
// // // // //             <div className="mt-6 text-center text-sm text-gray-500">
// // // // //               Click on an available seat to select it (only 1 seat allowed per workshop)
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>

// // // // //         {/* Booking Summary Card */}
// // // // //         <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border p-6">
// // // // //           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
// // // // //             {/* Booking Details */}
// // // // //             <div className="space-y-2">
// // // // //               <h4 className="font-semibold text-gray-900">Booking Summary</h4>
// // // // //               <div className="space-y-1 text-sm text-gray-600">
// // // // //                 <div className="flex gap-2">
// // // // //                   <span className="font-medium">Company:</span>
// // // // //                   <span>{companyName}</span>
// // // // //                 </div>
// // // // //                 <div className="flex gap-2">
// // // // //                   <span className="font-medium">Workshop:</span>
// // // // //                   <span>{workshopTitle}</span>
// // // // //                 </div>
// // // // //                 {selectedTimeSlot !== null && timeSlots[selectedTimeSlot] && (
// // // // //                   <div className="flex gap-2">
// // // // //                     <span className="font-medium">Time Slot:</span>
// // // // //                     <span className="text-blue-600 font-medium">
// // // // //                       {timeSlots[selectedTimeSlot].displayStart} - {timeSlots[selectedTimeSlot].displayEnd}
// // // // //                     </span>
// // // // //                   </div>
// // // // //                 )}
// // // // //                 <div className="flex gap-2">
// // // // //                   <span className="font-medium">Selected Seat:</span>
// // // // //                   <span className="text-emerald-600 font-medium">
// // // // //                     {selected.length === 0 ? "None" : `Seat ${seats10.find(s => s.id === selected[0])?.displayNo || selected[0].split('-')[1]}`}
// // // // //                   </span>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>

// // // // //             {/* Book Button */}
// // // // //             <div className="flex flex-col items-end gap-2">
// // // // //               <div className="text-right">
// // // // //                 <div className="text-2xl font-bold text-gray-900">₹{total}</div>
// // // // //                 <div className="text-xs text-gray-500">Total Amount</div>
// // // // //               </div>
// // // // //               <button
// // // // //                 className={cx(
// // // // //                   "px-8 py-3 rounded-xl text-white text-base font-semibold border transition-all duration-200",
// // // // //                   selected.length === 0 || booking || selectedTimeSlot === null
// // // // //                     ? "bg-gray-400 border-gray-400 cursor-not-allowed"
// // // // //                     : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 border-transparent shadow-lg hover:shadow-xl transform hover:scale-105"
// // // // //                 )}
// // // // //                 disabled={selected.length === 0 || booking || selectedTimeSlot === null}
// // // // //                 onClick={openUserDetailsPopup}
// // // // //               >
// // // // //                 {booking ? (
// // // // //                   <span className="flex items-center gap-2">
// // // // //                     <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
// // // // //                     Processing...
// // // // //                   </span>
// // // // //                 ) : (
// // // // //                   selected.length === 0 ? "Select a Seat" : "Book Seat"
// // // // //                 )}
// // // // //               </button>
// // // // //               {(selected.length === 0 || selectedTimeSlot === null) && (
// // // // //                 <p className="text-xs text-gray-500 text-center">
// // // // //                   {selectedTimeSlot === null ? "Select a time slot first" : "Select a seat to continue"}
// // // // //                 </p>
// // // // //               )}
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       </main>

// // // // //       <footer className="sticky bottom-0 z-10 border-t bg-white/90 backdrop-blur">
// // // // //         <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
// // // // //           <div className="text-sm">
// // // // //             {selected.length > 0 ? (
// // // // //               <>Selected: <span className="font-semibold">{selected.length}</span> • Total: <span className="font-semibold">₹ {total}</span></>
// // // // //             ) : "Select seats to continue"}
// // // // //           </div>
// // // // //           <div className="flex items-center gap-2">
// // // // //             <button className="px-4 py-2 rounded-lg border" onClick={()=>setSelected([])} disabled={selected.length===0}>Clear</button>
// // // // //             <button className="px-5 py-2 rounded-lg bg-black text-white disabled:opacity-50"
// // // // //               onClick={openUserDetailsPopup}
// // // // //               disabled={selected.length===0 || booking}
// // // // //             >
// // // // //               {booking ? "Booking…" : "Confirm Booking"}
// // // // //             </button>
// // // // //           </div>
// // // // //         </div>
// // // // //       </footer>

// // // // //       {/* User Details Popup */}
// // // // //       {showUserDetailsPopup && (
// // // // //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// // // // //           <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
// // // // //             <div className="flex items-center justify-between mb-6">
// // // // //               <h3 className="text-xl font-semibold text-gray-900">Enter Your Details</h3>
// // // // //               <button 
// // // // //                 onClick={() => setShowUserDetailsPopup(false)}
// // // // //                 className="text-gray-400 hover:text-gray-600 text-2xl"
// // // // //               >
// // // // //                 ×
// // // // //               </button>
// // // // //             </div>

// // // // //             <div className="space-y-4">
// // // // //               <div>
// // // // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // // // //                   Full Name <span className="text-red-500">*</span>
// // // // //                 </label>
// // // // //                 <input
// // // // //                   type="text"
// // // // //                   value={userDetails.name}
// // // // //                   onChange={(e) => setUserDetails(prev => ({...prev, name: e.target.value}))}
// // // // //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// // // // //                   placeholder="Enter your full name"
// // // // //                 />
// // // // //               </div>

// // // // //               <div>
// // // // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // // // //                   Mobile Number <span className="text-red-500">*</span>
// // // // //                 </label>
// // // // //                 <input
// // // // //                   type="tel"
// // // // //                   value={userDetails.mobile}
// // // // //                   onChange={(e) => setUserDetails(prev => ({...prev, mobile: e.target.value}))}
// // // // //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// // // // //                   placeholder="Enter your mobile number"
// // // // //                 />
// // // // //               </div>

// // // // //               <div>
// // // // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // // // //                   Email Address <span className="text-red-500">*</span>
// // // // //                 </label>
// // // // //                 <input
// // // // //                   type="email"
// // // // //                   value={userDetails.email}
// // // // //                   onChange={(e) => setUserDetails(prev => ({...prev, email: e.target.value}))}
// // // // //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// // // // //                   placeholder="Enter your email address"
// // // // //                 />
// // // // //               </div>
// // // // //             </div>

// // // // //             <div className="flex gap-3 mt-6">
// // // // //               <button
// // // // //                 onClick={() => setShowUserDetailsPopup(false)}
// // // // //                 className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
// // // // //               >
// // // // //                 Cancel
// // // // //               </button>
// // // // //               <button
// // // // //                 onClick={confirmBooking}
// // // // //                 disabled={!userDetails.name || !userDetails.mobile || !userDetails.email || booking}
// // // // //                 className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
// // // // //               >
// // // // //                 {booking ? (
// // // // //                   <span className="flex items-center justify-center gap-2">
// // // // //                     <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
// // // // //                     Processing...
// // // // //                   </span>
// // // // //                 ) : (
// // // // //                   'Submit & Book'
// // // // //                 )}
// // // // //               </button>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // import React, { useEffect, useMemo, useState } from "react";
// // // // import { useLocation, useNavigate } from "react-router-dom";
// // // // import {
// // // //   getSeats,
// // // //   getSlots,
// // // //   resolveSlotId,
// // // //   createBookingSimple
// // // // } from "../api/client";

// // // // function cx(...a){ return a.filter(Boolean).join(" "); }
// // // // function f12(hhmm="00:00"){
// // // //   const [h,m]=(hhmm||"00:00").split(":").map(Number);
// // // //   const am=h<12?"AM":"PM";
// // // //   const h12=((h+11)%12)+1;
// // // //   return `${h12}:${String(m).padStart(2,"0")} ${am}`;
// // // // }

// // // // export default function SeatSelection() {
// // // //   const { search } = useLocation();
// // // //   const navigate = useNavigate();
// // // //   const q = new URLSearchParams(search);

// // // //   const slotIdRaw   = q.get("slotId") || "";
// // // //   const start       = q.get("start") || "";
// // // //   const end         = q.get("end") || "";
// // // //   const basePrice   = Number(q.get("price") || 0);
// // // //   const workshopId  = q.get("workshopId") || q.get("centerId") || "c1";
// // // //   const date        = q.get("date") || new Date().toISOString().slice(0,10);
// // // //   const workshopTitle = q.get("workshopTitle") || "Workshop";
// // // //   const companyName = q.get("companyName") || "Company";
// // // //   const movieId = q.get("movieId") || "1";

// // // //   // UI state
// // // //   const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // mini-slot index 0..5
// // // //   const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
// // // //   const [userDetails, setUserDetails] = useState({
// // // //     name: '',
// // // //     mobile: '',
// // // //     email: ''
// // // //   });

// // // //   // Backend state
// // // //   const [resolvedSlotId, setResolvedSlotId] = useState(slotIdRaw);
// // // //   const [error, setError] = useState("");
// // // //   const [booking, setBooking] = useState(false);

// // // //   // (Kept for compatibility; you can still fetch backend slots if needed)
// // // //   const [times, setTimes] = useState([]);

// // // //   // Generate 6 time slots of 10 minutes each within the selected hour
// // // //   const generateTimeSlots = () => {
// // // //     if (!start) {
// // // //       // Fallback if no start time provided
// // // //       const defaultSlots = [];
// // // //       for (let i = 0; i < 6; i++) {
// // // //         const startMin = i * 10;
// // // //         const endMin = (i + 1) * 10;
// // // //         const startTime = `09:${String(startMin).padStart(2, '0')}`;
// // // //         const endTime = `09:${String(endMin).padStart(2, '0')}`;
        
// // // //         defaultSlots.push({
// // // //           id: i,
// // // //           startTime,
// // // //           endTime,
// // // //           displayStart: f12(startTime),
// // // //           displayEnd: f12(endTime),
// // // //           availableSeats: 1,           // one "seat" per mini-slot
// // // //           bookedSeats: 0               // adjust if you track mini-slot occupancy
// // // //         });
// // // //       }
// // // //       return defaultSlots;
// // // //     }
    
// // // //     const [startHour, startMin] = start.split(':').map(Number);
// // // //     const slots = [];
    
// // // //     for (let i = 0; i < 6; i++) {
// // // //       const slotStartMin = startMin + (i * 10);
// // // //       const slotEndMin = startMin + ((i + 1) * 10);
      
// // // //       const slotStartHour = startHour + Math.floor(slotStartMin / 60);
// // // //       const slotEndHour = startHour + Math.floor(slotEndMin / 60);
      
// // // //       const finalStartMin = slotStartMin % 60;
// // // //       const finalEndMin = slotEndMin % 60;
      
// // // //       const startTime = `${String(slotStartHour).padStart(2, '0')}:${String(finalStartMin).padStart(2, '0')}`;
// // // //       const endTime   = `${String(slotEndHour).padStart(2, '0')}:${String(finalEndMin).padStart(2, '0')}`;
      
// // // //       slots.push({
// // // //         id: i,
// // // //         startTime,
// // // //         endTime,
// // // //         displayStart: f12(startTime),
// // // //         displayEnd: f12(endTime),
// // // //         availableSeats: 1,               // one "seat" per 10-min chunk
// // // //         bookedSeats: 0
// // // //       });
// // // //     }
    
// // // //     return slots;
// // // //   };

// // // //   const timeSlots = useMemo(generateTimeSlots, [start]);

// // // //   // If slotId missing (navigated by time only), resolve it
// // // //   useEffect(() => {
// // // //     let alive = true;
// // // //     (async () => {
// // // //       if (resolvedSlotId) return;
// // // //       if (!workshopId || !date || !start) return;
// // // //       try {
// // // //         const id = await resolveSlotId(workshopId, date, start, end || undefined);
// // // //         if (!alive) return;
// // // //         setResolvedSlotId(String(id));
// // // //       } catch {
// // // //         if (!alive) return;
// // // //         setError("Could not resolve showtime. Please go back and pick another time.");
// // // //       }
// // // //     })();
// // // //     return () => { alive = false; };
// // // //   }, [resolvedSlotId, workshopId, date, start, end]);

// // // //   // Load time chips for same center/date (kept for compatibility with your existing flow)
// // // //   useEffect(() => {
// // // //     let alive = true;
// // // //     (async () => {
// // // //       try {
// // // //         const data = await getSlots(workshopId, date);
// // // //         if (!alive) return;
// // // //         const list = Array.isArray(data?.slots) ? data.slots : [];
// // // //         setTimes(list.map(s => ({ id: String(s.id), start:s.start, end:s.end, status:s.status, subtitle:s.subtitle })));
// // // //       } catch { /* ignore */ }
// // // //     })();
// // // //     return () => { alive = false; };
// // // //   }, [workshopId, date]);

// // // //   const total = basePrice || 0;

// // // //   function openUserDetailsPopup() {
// // // //     if (selectedTimeSlot === null) return;
// // // //     setShowUserDetailsPopup(true);
// // // //   }

// // // //   const validEmail = (e) => /\S+@\S+\.\S+/.test(e);
// // // //   const validMobile = (m) => /^[6-9]\d{9}$/.test(m); // India 10-digit rule of thumb

// // // // // async function confirmBooking() {
// // // // //   // --- Inline helpers (self-contained) ---
// // // // //   const normalizeMobile = (m) => (m || "").replace(/[^\d]/g, "");
// // // // //   const isValidIndianMobile = (m) => {
// // // // //     const d = normalizeMobile(m);
// // // // //     if (d.length === 10 && /^[6-9]\d{9}$/.test(d)) return true;           // 10 digits
// // // // //     if (d.length === 11 && d.startsWith("0") && /^[6-9]\d{9}$/.test(d.slice(1))) return true; // 0 + 10
// // // // //     if (d.length === 12 && d.startsWith("91") && /^[6-9]\d{9}$/.test(d.slice(2))) return true; // 91 + 10
// // // // //     return false;
// // // // //   };
// // // // //   const toE164India = (m) => `+91${normalizeMobile(m).slice(-10)}`;
// // // // //   const validEmail = (e) => /\S+@\S+\.\S+/.test((e || "").trim());
// // // // //   const validName = (n) => {
// // // // //     const s = (n || "").trim();
// // // // //     return s.length >= 2 && /[A-Za-z]/.test(s);
// // // // //   };

// // // // //   // --- Validate inputs ---
// // // // //   if (!validName(userDetails.name)) {
// // // // //     alert("Please enter a valid name.");
// // // // //     return;
// // // // //   }
// // // // //   if (!isValidIndianMobile(userDetails.mobile)) {
// // // // //     alert("Please enter a valid Indian mobile number (10 digits, with or without +91/0).");
// // // // //     return;
// // // // //   }
// // // // //   if (!validEmail(userDetails.email)) {
// // // // //     alert("Please enter a valid email address.");
// // // // //     return;
// // // // //   }
// // // // //   if (selectedTimeSlot === null) {
// // // // //     alert("Please select a 10-minute mini-slot");
// // // // //     return;
// // // // //   }

// // // // //   try {
// // // // //     setBooking(true);
// // // // //     setError("");

// // // // //     const selectedSlot = timeSlots[selectedTimeSlot];
// // // // //     const syntheticSeatId = `sub-${selectedTimeSlot}`; // one seat per mini-slot

// // // // //     // Create booking payload with backend format
// // // // //     const payload = {
// // // // //       slotId: Number(resolvedSlotId || 0),
// // // // //       name: userDetails.name.trim(),
// // // // //       email: userDetails.email.trim(),
// // // // //       mobile_no: toE164India(userDetails.mobile), // normalized to +91XXXXXXXXXX
// // // // //       seats: [syntheticSeatId],
// // // // //       amount_paid: total,
// // // // //       payment_ref: `demo_${Date.now()}`,
// // // // //       // Optional: pass exact mini-slot times if your backend wants them
// // // // //       meta: {
// // // // //         subslot_start: selectedSlot.startTime,
// // // // //         subslot_end: selectedSlot.endTime,
// // // // //       },
// // // // //     };

// // // // //     let resp;
// // // // //     if (resolvedSlotId) {
// // // // //       resp = await createBookingSimple(payload);
// // // // //     } else {
// // // // //       // If no backend slot, create mock response (kept behavior)
// // // // //       resp = {
// // // // //         bookingId: `BK${Date.now()}`,
// // // // //         total: total,
// // // // //         amount_paid: total,
// // // // //       };
// // // // //     }

// // // // //     const bookingId = resp.bookingId ?? resp.id ?? `BK${Date.now()}`;
// // // // //     const params = new URLSearchParams({
// // // // //       bookingId: String(bookingId),
// // // // //       companyName: companyName,
// // // // //       workshopTitle: workshopTitle,
// // // // //       venue: q.get("venue") || "Medical Center, Delhi",
// // // // //       date: date,
// // // // //       startTime: selectedSlot.displayStart,
// // // // //       endTime: selectedSlot.displayEnd,
// // // // //       seatNumber: `${selectedSlot.displayStart}–${selectedSlot.displayEnd}`,
// // // // //       amount: String(resp.total ?? resp.amount_paid ?? total),
// // // // //       userName: userDetails.name.trim(),
// // // // //       userMobile: userDetails.mobile.trim(), // show what user entered on confirmation
// // // // //       userEmail: userDetails.email.trim(),
// // // // //     }).toString();

// // // // //     navigate(`/confirmation?${params}`);
// // // // //   } catch (e) {
// // // // //     setError(e?.message || "Could not complete booking");
// // // // //   } finally {
// // // // //     setBooking(false);
// // // // //     setShowUserDetailsPopup(false);
// // // // //   }
// // // // // }
// // // // async function confirmBooking() {
// // // //   // simple checks (keep yours)
// // // //   if (!userDetails.name?.trim() || !userDetails.mobile?.trim() || !userDetails.email?.trim()) {
// // // //     alert('Please fill all required fields');
// // // //     return;
// // // //   }
// // // //   if (selectedTimeSlot === null) {
// // // //     alert('Please select a 10-minute mini-slot');
// // // //     return;
// // // //   }

// // // //   try {
// // // //     setBooking(true);
// // // //     setError("");

// // // //     // 1) get the real seat id that matches the selected mini-slot (1..6)
// // // //     //    assuming you keep a local `seats` array from GET /api/seats/:slotId
// // // //     //    where each item includes: { id, displayNo, status }
// // // //     //    If you named it seats10 earlier, just use that.
// // // //     const selectedChunkIndex = selectedTimeSlot; // 0..5
// // // //     const desiredDisplayNo = selectedChunkIndex + 1; // 1..6
// // // //     const seatsResp = await getSeats(resolvedSlotId);
// // // //     const seats = Array.isArray(seatsResp?.seats) ? seatsResp.seats : [];
// // // //     const seatObj = seats.find(s => s.displayNo === desiredDisplayNo && s.status === "AVAILABLE");
// // // //     if (!seatObj) {
// // // //       alert("That mini-slot was just booked by someone else. Please pick another.");
// // // //       return;
// // // //     }

// // // //     // 2) build payload for booking API (no synthetic seat IDs)
// // // //     const payload = {
// // // //       slotId: Number(resolvedSlotId || 0),
// // // //       name: userDetails.name.trim(),
// // // //       email: userDetails.email.trim(),
// // // //       mobile_no: userDetails.mobile.trim(), // or normalized +91…
// // // //       seatId: Number(seatObj.id),
// // // //       amount_paid: total,
// // // //       payment_ref: `demo_${Date.now()}`,
// // // //     };

// // // //     // 3) call backend
// // // //     const resp = await createBookingSimple(payload); // should return 201

// // // //     // 4) navigate confirmation
// // // //     const selectedSlot = timeSlots[selectedTimeSlot];
// // // //     const bookingId = resp.bookingId ?? resp.id ?? `BK${Date.now()}`;
// // // //     const params = new URLSearchParams({
// // // //       bookingId: String(bookingId),
// // // //       companyName: companyName,
// // // //       workshopTitle: workshopTitle,
// // // //       venue: q.get("venue") || "Medical Center, Delhi",
// // // //       date: date,
// // // //       startTime: selectedSlot.displayStart,
// // // //       endTime: selectedSlot.displayEnd,
// // // //       seatNumber: `${selectedSlot.displayStart}–${selectedSlot.displayEnd}`, // show the 10-min window
// // // //       amount: String(resp.total ?? resp.amount_paid ?? total),
// // // //       userName: userDetails.name.trim(),
// // // //       userMobile: userDetails.mobile.trim(),
// // // //       userEmail: userDetails.email.trim()
// // // //     }).toString();

// // // //     navigate(`/confirmation?${params}`);
// // // //   } catch (e) {
// // // //     // show the exact server message when possible
// // // //     const msg =
// // // //       e?.response?.data?.message ||
// // // //       e?.response?.data?.error ||
// // // //       e?.message ||
// // // //       "Could not complete booking";
// // // //     setError(msg);
// // // //   } finally {
// // // //     setBooking(false);
// // // //     setShowUserDetailsPopup(false);
// // // //   }
// // // // }


// // // //   function goBack(){ navigate(-1); }

// // // //   return (
// // // //     <div className="min-h-screen bg-white">
// // // //       {/* Header */}
// // // //       <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
// // // //         <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
// // // //           <button onClick={goBack} className="mr-1 rounded px-2 py-1 text-gray-700 hover:bg-gray-100" aria-label="Back">‹</button>
// // // //           <div className="h-9 w-56 rounded bg-gray-900 text-white grid place-items-center text-sm font-semibold">{companyName}</div>
// // // //           <div className="flex-1 h-9 min-w-[280px] ml-3 rounded bg-sky-200 text-gray-900 grid place-items-center text-sm font-semibold">
// // // //             {workshopTitle} 
// // // //           </div>
// // // //         </div>
// // // //       </header>

// // // //       {/* Main */}
// // // //       <main className="mx-auto max-w-6xl px-4 py-6">
// // // //         {/* Time Slots Section */}
// // // //         <div className="rounded-xl border p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
// // // //           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
// // // //             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
// // // //             Select 10-Minute Time Slot
// // // //           </h3>
// // // //           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
// // // //             {timeSlots.map((slot, i) => {
// // // //               const isSelected = selectedTimeSlot === i;
// // // //               const isFullyBooked = slot.bookedSeats >= slot.availableSeats;
// // // //               const availableCount = Math.max(0, (slot.availableSeats - slot.bookedSeats));

// // // //               return (
// // // //                 <button
// // // //                   key={slot.id}
// // // //                   onClick={() => !isFullyBooked && setSelectedTimeSlot(i)}
// // // //                   disabled={isFullyBooked}
// // // //                   className={cx(
// // // //                     "p-4 rounded-lg border-2 transition-all duration-200 text-left",
// // // //                     isSelected 
// // // //                       ? "border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105" 
// // // //                       : isFullyBooked 
// // // //                         ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
// // // //                         : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
// // // //                   )}
// // // //                   aria-pressed={isSelected}
// // // //                   aria-disabled={isFullyBooked}
// // // //                   title={`${slot.displayStart} to ${slot.displayEnd}`}
// // // //                 >
// // // //                   <div className="text-sm font-semibold">
// // // //                     {slot.displayStart}
// // // //                   </div>
// // // //                   <div className="text-xs opacity-75 mt-1">
// // // //                     to {slot.displayEnd}
// // // //                   </div>
// // // //                   <div className={cx(
// // // //                     "text-xs mt-2 px-2 py-1 rounded-full inline-block",
// // // //                     isSelected 
// // // //                       ? "bg-white/20 text-white"
// // // //                       : isFullyBooked 
// // // //                         ? "bg-red-100 text-red-600"
// // // //                         : availableCount <= 0 
// // // //                           ? "bg-red-100 text-red-600"
// // // //                           : availableCount <= 1 
// // // //                             ? "bg-orange-100 text-orange-600"
// // // //                             : "bg-green-100 text-green-600"
// // // //                   )}>
// // // //                     {isFullyBooked ? "FULL" : `${availableCount} seat`}
// // // //                   </div>
// // // //                 </button>
// // // //               );
// // // //             })}
// // // //           </div>
// // // //         </div>

// // // //         <div className="rounded-xl border p-6 bg-gradient-to-b from-gray-50 to-white">
// // // //           {/* Selection Header */}
// // // //           <div className="mb-6">
// // // //             <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
// // // //               <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
// // // //               Select Your 10-Minute Mini-Slot
// // // //               {selectedTimeSlot !== null && timeSlots[selectedTimeSlot] && (
// // // //                 <span className="ml-4 text-sm font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
// // // //                   {timeSlots[selectedTimeSlot].displayStart} - {timeSlots[selectedTimeSlot].displayEnd}
// // // //                 </span>
// // // //               )}
// // // //             </h3>
// // // //             <p className="text-sm text-gray-600">Choose one mini-slot within the selected hour (maximum 1 per booking)</p>
// // // //           </div>

// // // //           {/* Legend */}
// // // //           <div className="mb-6 flex flex-wrap justify-center gap-6 text-sm">
// // // //             <span className="inline-flex items-center gap-2">
// // // //               <span className="h-4 w-4 rounded bg-emerald-50 border-2 border-emerald-200"></span> 
// // // //               Available
// // // //             </span>
// // // //             <span className="inline-flex items-center gap-2">
// // // //               <span className="h-4 w-4 rounded bg-blue-500 border-2 border-blue-600"></span> 
// // // //               Selected
// // // //             </span>
// // // //             <span className="inline-flex items-center gap-2">
// // // //               <span className="h-4 w-4 rounded bg-red-100 border-2 border-red-200"></span> 
// // // //               Booked
// // // //             </span>
// // // //           </div>

// // // //           {/* 6 Mini-Slots "Seats" */}
// // // //           <div className="flex flex-col items-center">
// // // //             <div className="mb-6 text-center">
// // // //               <div className="text-sm text-gray-600 mb-2">
// // // //                 Choose one 10-minute mini-slot within the hour
// // // //               </div>
// // // //             </div>
            
// // // //             <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
// // // //               {timeSlots.map((slot, i) => {
// // // //                 const isSelected = selectedTimeSlot === i;
// // // //                 const disabled = slot.bookedSeats >= slot.availableSeats;

// // // //                 return (
// // // //                   <button
// // // //                     key={slot.id}
// // // //                     onClick={() => !disabled && setSelectedTimeSlot(i)}
// // // //                     disabled={disabled}
// // // //                     className={cx(
// // // //                       "h-16 w-24 rounded-xl flex flex-col items-center justify-center text-sm font-semibold border-2 transition-all duration-200",
// // // //                       disabled
// // // //                         ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
// // // //                         : isSelected
// // // //                           ? "bg-blue-500 text-white border-blue-600 shadow-lg transform scale-105"
// // // //                           : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md hover:scale-105"
// // // //                     )}
// // // //                     title={`${slot.displayStart} – ${slot.displayEnd}`}
// // // //                     aria-pressed={isSelected}
// // // //                     aria-disabled={disabled}
// // // //                   >
// // // //                     <div className="text-[11px] opacity-75">Mini-slot</div>
// // // //                     <div className="text-[12px] font-bold text-center leading-tight">
// // // //                       {slot.displayStart.split(" ")[0]}
// // // //                     </div>
// // // //                     <div className="text-[10px] opacity-70 leading-tight">
// // // //                       {slot.displayStart.split(" ")[1]}
// // // //                     </div>
// // // //                   </button>
// // // //                 );
// // // //               })}
// // // //             </div>
            
// // // //             <div className="mt-6 text-center text-sm text-gray-500">
// // // //               Only one 10-minute mini-slot can be booked in this hour.
// // // //             </div>
// // // //           </div>
// // // //         </div>

// // // //         {/* Booking Summary Card */}
// // // //         <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border p-6">
// // // //           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
// // // //             {/* Booking Details */}
// // // //             <div className="space-y-2">
// // // //               <h4 className="font-semibold text-gray-900">Booking Summary</h4>
// // // //               <div className="space-y-1 text-sm text-gray-600">
// // // //                 <div className="flex gap-2">
// // // //                   <span className="font-medium">Company:</span>
// // // //                   <span>{companyName}</span>
// // // //                 </div>
// // // //                 <div className="flex gap-2">
// // // //                   <span className="font-medium">Workshop:</span>
// // // //                   <span>{workshopTitle}</span>
// // // //                 </div>
// // // //                 {selectedTimeSlot !== null && timeSlots[selectedTimeSlot] && (
// // // //                   <div className="flex gap-2">
// // // //                     <span className="font-medium">Time Slot:</span>
// // // //                     <span className="text-blue-600 font-medium">
// // // //                       {timeSlots[selectedTimeSlot].displayStart} - {timeSlots[selectedTimeSlot].displayEnd}
// // // //                     </span>
// // // //                   </div>
// // // //                 )}
// // // //                 <div className="flex gap-2">
// // // //                   <span className="font-medium">Selected 10-min Slot:</span>
// // // //                   <span className="text-emerald-600 font-medium">
// // // //                     {selectedTimeSlot === null
// // // //                       ? "None"
// // // //                       : `${timeSlots[selectedTimeSlot].displayStart} – ${timeSlots[selectedTimeSlot].displayEnd}`}
// // // //                   </span>
// // // //                 </div>
// // // //               </div>
// // // //             </div>

// // // //             {/* Book Button */}
// // // //             <div className="flex flex-col items-end gap-2">
// // // //               <div className="text-right">
// // // //                 <div className="text-2xl font-bold text-gray-900">₹{total}</div>
// // // //                 <div className="text-xs text-gray-500">Total Amount</div>
// // // //               </div>
// // // //               <button
// // // //                 className={cx(
// // // //                   "px-8 py-3 rounded-xl text-white text-base font-semibold border transition-all duration-200",
// // // //                   selectedTimeSlot === null || booking
// // // //                     ? "bg-gray-400 border-gray-400 cursor-not-allowed"
// // // //                     : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 border-transparent shadow-lg hover:shadow-xl transform hover:scale-105"
// // // //                 )}
// // // //                 disabled={selectedTimeSlot === null || booking}
// // // //                 onClick={openUserDetailsPopup}
// // // //               >
// // // //                 {booking ? (
// // // //                   <span className="flex items-center gap-2">
// // // //                     <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
// // // //                     Processing...
// // // //                   </span>
// // // //                 ) : (
// // // //                   selectedTimeSlot === null ? "Select a 10-min Slot" : "Book Slot"
// // // //                 )}
// // // //               </button>
// // // //               {selectedTimeSlot === null && (
// // // //                 <p className="text-xs text-gray-500 text-center">
// // // //                   Select a mini-slot to continue
// // // //                 </p>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </main>

// // // //       <footer className="sticky bottom-0 z-10 border-t bg-white/90 backdrop-blur">
// // // //         <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between" aria-live="polite">
// // // //           <div className="text-sm">
// // // //             {selectedTimeSlot !== null ? (
// // // //               <>Selected: <span className="font-semibold">1</span> • Total: <span className="font-semibold">₹ {total}</span></>
// // // //             ) : "Select a 10-minute mini-slot to continue"}
// // // //           </div>
// // // //           <div className="flex items-center gap-2">
// // // //             <button
// // // //               className="px-4 py-2 rounded-lg border"
// // // //               onClick={()=>setSelectedTimeSlot(null)}
// // // //               disabled={selectedTimeSlot===null}
// // // //             >
// // // //               Clear
// // // //             </button>
// // // //             <button
// // // //               className="px-5 py-2 rounded-lg bg-black text-white disabled:opacity-50"
// // // //               onClick={openUserDetailsPopup}
// // // //               disabled={selectedTimeSlot===null || booking}
// // // //             >
// // // //               {booking ? "Booking…" : "Confirm Booking"}
// // // //             </button>
// // // //           </div>
// // // //         </div>
// // // //       </footer>

// // // //       {/* User Details Popup */}
// // // //       {showUserDetailsPopup && (
// // // //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// // // //           <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
// // // //             <div className="flex items-center justify-between mb-6">
// // // //               <h3 className="text-xl font-semibold text-gray-900">Enter Your Details</h3>
// // // //               <button 
// // // //                 onClick={() => setShowUserDetailsPopup(false)}
// // // //                 className="text-gray-400 hover:text-gray-600 text-2xl"
// // // //               >
// // // //                 ×
// // // //               </button>
// // // //             </div>

// // // //             <div className="space-y-4">
// // // //               <div>
// // // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // // //                   Full Name <span className="text-red-500">*</span>
// // // //                 </label>
// // // //                 <input
// // // //                   type="text"
// // // //                   value={userDetails.name}
// // // //                   onChange={(e) => setUserDetails(prev => ({...prev, name: e.target.value}))}
// // // //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// // // //                   placeholder="Enter your full name"
// // // //                 />
// // // //               </div>

// // // //               <div>
// // // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // // //                   Mobile Number <span className="text-red-500">*</span>
// // // //                 </label>
// // // //                 <input
// // // //                   type="tel"
// // // //                   value={userDetails.mobile}
// // // //                   onChange={(e) => setUserDetails(prev => ({...prev, mobile: e.target.value}))}
// // // //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// // // //                   placeholder="Enter your mobile number"
// // // //                 />
// // // //               </div>

// // // //               <div>
// // // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // // //                   Email Address <span className="text-red-500">*</span>
// // // //                 </label>
// // // //                 <input
// // // //                   type="email"
// // // //                   value={userDetails.email}
// // // //                   onChange={(e) => setUserDetails(prev => ({...prev, email: e.target.value}))}
// // // //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// // // //                   placeholder="Enter your email address"
// // // //                 />
// // // //               </div>
// // // //             </div>

// // // //             <div className="flex gap-3 mt-6">
// // // //               <button
// // // //                 onClick={() => setShowUserDetailsPopup(false)}
// // // //                 className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
// // // //               >
// // // //                 Cancel
// // // //               </button>
// // // //               <button
// // // //                 onClick={confirmBooking}
// // // //                 disabled={!userDetails.name || !userDetails.mobile || !userDetails.email || booking}
// // // //                 className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
// // // //               >
// // // //                 {booking ? (
// // // //                   <span className="flex items-center justify-center gap-2">
// // // //                     <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
// // // //                     Processing...
// // // //                   </span>
// // // //                 ) : (
// // // //                   'Submit & Book'
// // // //                 )}
// // // //               </button>
// // // //             </div>

// // // //             {/* Show any booking error */}
// // // //             {error && (
// // // //               <div className="mt-4 text-sm text-red-600">
// // // //                 {error}
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }
// // // import React, { useEffect, useMemo, useState } from "react";
// // // import { useLocation, useNavigate } from "react-router-dom";
// // // import {
// // //   getSeats,
// // //   getSlots,
// // //   resolveSlotId,
// // //   createBookingSimple
// // // } from "../api/client";

// // // function cx(...a){ return a.filter(Boolean).join(" "); }
// // // function f12(hhmm="00:00"){
// // //   const [h,m]=(hhmm||"00:00").split(":").map(Number);
// // //   const am=h<12?"AM":"PM";
// // //   const h12=((h+11)%12)+1;
// // //   return `${h12}:${String(m).padStart(2,"0")} ${am}`;
// // // }

// // // export default function SeatSelection() {
// // //   const { search } = useLocation();
// // //   const navigate = useNavigate();
// // //   const q = new URLSearchParams(search);

// // //   const slotIdRaw   = q.get("slotId") || "";
// // //   const start       = q.get("start") || "";
// // //   const end         = q.get("end") || "";
// // //   const basePrice   = Number(q.get("price") || 0);
// // //   const workshopId  = q.get("workshopId") || q.get("centerId") || "c1";
// // //   const date        = q.get("date") || new Date().toISOString().slice(0,10);
// // //   const workshopTitle = q.get("workshopTitle") || "Workshop";
// // //   const companyName = q.get("companyName") || "Company";

// // //   // UI state
// // //   const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // mini-slot index 0..5
// // //   const [selectedSeatId, setSelectedSeatId] = useState(null);     // REAL seat id from API
// // //   const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
// // //   const [userDetails, setUserDetails] = useState({ name: "", mobile: "", email: "" });

// // //   // Backend state
// // //   const [resolvedSlotId, setResolvedSlotId] = useState(slotIdRaw);
// // //   const [seatsRaw, setSeatsRaw] = useState([]);   // [{id,displayNo,status,price,...}] from API
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState("");
// // //   const [booking, setBooking] = useState(false);
// // //   const [times, setTimes] = useState([]);

// // //   // Generate 6 time slots of 10 minutes each within the selected hour
// // //   const generateTimeSlots = () => {
// // //     if (!start) {
// // //       const defaultSlots = [];
// // //       for (let i = 0; i < 6; i++) {
// // //         const startMin = i * 10;
// // //         const endMin = (i + 1) * 10;
// // //         const startTime = `09:${String(startMin).padStart(2, '0')}`;
// // //         const endTime = `09:${String(endMin).padStart(2, '0')}`;
// // //         defaultSlots.push({
// // //           id: i,
// // //           startTime,
// // //           endTime,
// // //           displayStart: f12(startTime),
// // //           displayEnd: f12(endTime),
// // //         });
// // //       }
// // //       return defaultSlots;
// // //     }
// // //     const [startHour, startMin] = start.split(':').map(Number);
// // //     const slots = [];
// // //     for (let i = 0; i < 6; i++) {
// // //       const slotStartMin = startMin + (i * 10);
// // //       const slotEndMin = startMin + ((i + 1) * 10);
// // //       const slotStartHour = startHour + Math.floor(slotStartMin / 60);
// // //       const slotEndHour = startHour + Math.floor(slotEndMin / 60);
// // //       const finalStartMin = slotStartMin % 60;
// // //       const finalEndMin = slotEndMin % 60;
// // //       const startTime = `${String(slotStartHour).padStart(2,'0')}:${String(finalStartMin).padStart(2,'0')}`;
// // //       const endTime   = `${String(slotEndHour).padStart(2,'0')}:${String(finalEndMin).padStart(2,'0')}`;
// // //       slots.push({
// // //         id: i,
// // //         startTime,
// // //         endTime,
// // //         displayStart: f12(startTime),
// // //         displayEnd: f12(endTime),
// // //       });
// // //     }
// // //     return slots;
// // //   };
// // //   const timeSlots = useMemo(generateTimeSlots, [start]);

// // //   // Resolve slotId if missing (navigated by time only)
// // //   useEffect(() => {
// // //     let alive = true;
// // //     (async () => {
// // //       if (resolvedSlotId) return;
// // //       if (!workshopId || !date || !start) return;
// // //       try {
// // //         const id = await resolveSlotId(workshopId, date, start, end || undefined);
// // //         if (!alive) return;
// // //         setResolvedSlotId(String(id));
// // //       } catch {
// // //         if (!alive) return;
// // //         setError("Could not resolve showtime. Please go back and pick another time.");
// // //       }
// // //     })();
// // //     return () => { alive = false; };
// // //   }, [resolvedSlotId, workshopId, date, start, end]);

// // //   // Load time chips for same center/date (other hours)
// // //   useEffect(() => {
// // //     let alive = true;
// // //     (async () => {
// // //       try {
// // //         const data = await getSlots(workshopId, date);
// // //         if (!alive) return;
// // //         const list = Array.isArray(data?.slots) ? data.slots : [];
// // //         setTimes(list.map(s => ({ id: String(s.id), start:s.start, end:s.end, status:s.status, subtitle:s.subtitle })));
// // //       } catch { /* ignore */ }
// // //     })();
// // //     return () => { alive = false; };
// // //   }, [workshopId, date]);

// // //   // Load seats for this slot -> DB truth for BOOKED/AVAILABLE
// // //   useEffect(() => {
// // //     let alive = true;
// // //     (async () => {
// // //       if (!resolvedSlotId) { setLoading(false); return; }
// // //       try {
// // //         setLoading(true);
// // //         setError("");
// // //         const data = await getSeats(resolvedSlotId);
// // //         if (!alive) return;
// // //         const list = Array.isArray(data?.seats) ? data.seats : [];
// // //         setSeatsRaw(list);
// // //       } catch (e) {
// // //         if (!alive) return;
// // //         setError(e?.message || "Failed to load seats");
// // //         setSeatsRaw([]);
// // //       } finally {
// // //         if (alive) setLoading(false);
// // //       }
// // //     })();
// // //     return () => { alive = false; };
// // //   }, [resolvedSlotId]);

// // //   // Map mini-slot index (0..5) -> seat info from DB
// // //   const miniSeatStatus = useMemo(() => {
// // //     const byIndex = {};
// // //     const sorted = [...seatsRaw].sort((a, b) => {
// // //       const ai = (a.displayNo ?? a.col_number ?? 0);
// // //       const bi = (b.displayNo ?? b.col_number ?? 0);
// // //       return ai - bi;
// // //     });
// // //     sorted.slice(0, 6).forEach((s, idx) => {
// // //       byIndex[idx] = {
// // //         id: Number(s.id),
// // //         status: s.status, // "AVAILABLE" | "BOOKED"
// // //         displayNo: s.displayNo ?? s.col_number ?? (idx + 1),
// // //         price: s.price ?? basePrice
// // //       };
// // //     });
// // //     return byIndex;
// // //   }, [seatsRaw, basePrice]);

// // //   // If selection becomes invalid (seat turns BOOKED), clear it
// // //   useEffect(() => {
// // //     if (selectedTimeSlot != null) {
// // //       const info = miniSeatStatus[selectedTimeSlot];
// // //       if (info && info.status !== "AVAILABLE") {
// // //         setSelectedTimeSlot(null);
// // //         setSelectedSeatId(null);
// // //       }
// // //     }
// // //   }, [miniSeatStatus, selectedTimeSlot]);

// // //   const total = selectedTimeSlot != null
// // //     ? (miniSeatStatus[selectedTimeSlot]?.price ?? basePrice)
// // //     : basePrice || 0;

// // //   function openUserDetailsPopup() {
// // //     if (selectedTimeSlot == null || !selectedSeatId) return;
// // //     setShowUserDetailsPopup(true);
// // //   }

// // //   const validEmail  = (e) => /\S+@\S+\.\S+/.test((e||"").trim());
// // //   const validMobile = (m) => /^[6-9]\d{9}$/.test(String(m||"").replace(/[^\d]/g,"").slice(-10));
// // //   const validName   = (n) => String(n||"").trim().length >= 2;

// // //   async function confirmBooking() {
// // //     if (!validName(userDetails.name) || !validMobile(userDetails.mobile) || !validEmail(userDetails.email)) {
// // //       alert('Please enter a valid name, 10-digit mobile, and email.');
// // //       return;
// // //     }
// // //     if (selectedTimeSlot === null || !selectedSeatId) {
// // //       alert('Please select a 10-minute mini-slot');
// // //       return;
// // //     }

// // //     try {
// // //       setBooking(true);
// // //       setError("");

// // //       // Build payload with the captured seat id (DB truth)
// // //       const payload = {
// // //         slotId: Number(resolvedSlotId || 0),
// // //         name: userDetails.name.trim(),
// // //         email: userDetails.email.trim(),
// // //         mobile_no: userDetails.mobile.trim(),
// // //         seats: [Number(selectedSeatId)],  // send REAL seat id array
// // //         amount_paid: total,
// // //         payment_ref: `demo_${Date.now()}`
// // //       };

// // //       const resp = await createBookingSimple(payload); // expects 201

// // //       const bookingId = resp.bookingId ?? resp.id ?? `BK${Date.now()}`;
// // //       const slot = timeSlots[selectedTimeSlot];
// // //       const params = new URLSearchParams({
// // //         bookingId: String(bookingId),
// // //         companyName,
// // //         workshopTitle,
// // //         venue: q.get("venue") || "Medical Center, Delhi",
// // //         date,
// // //         startTime: slot.displayStart,
// // //         endTime: slot.displayEnd,
// // //         seatNumber: `${slot.displayStart}–${slot.displayEnd}`,
// // //         amount: String(resp.total ?? resp.amount_paid ?? total),
// // //         userName: userDetails.name.trim(),
// // //         userMobile: userDetails.mobile.trim(),
// // //         userEmail: userDetails.email.trim()
// // //       }).toString();

// // //       navigate(`/confirmation?${params}`);
// // //     } catch (e) {
// // //       const msg =
// // //         e?.response?.data?.message ||
// // //         e?.response?.data?.error ||
// // //         e?.message ||
// // //         "Seat got taken. Please pick another mini-slot.";
// // //       alert(msg);

// // //       // Refresh from DB so UI shows latest BOOKED/AVAILABLE
// // //       try {
// // //         const data = await getSeats(resolvedSlotId);
// // //         const list = Array.isArray(data?.seats) ? data.seats : [];
// // //         setSeatsRaw(list);
// // //       } catch {}
// // //     } finally {
// // //       setBooking(false);
// // //       setShowUserDetailsPopup(false);
// // //     }
// // //   }

// // //   function goBack(){ navigate(-1); }
// // //   function switchTime(t){
// // //     const params = new URLSearchParams({
// // //       slotId: t.id, start: t.start, end: t.end,
// // //       price: String(basePrice), workshopId, date, workshopTitle, companyName
// // //     }).toString();
// // //     navigate(`/select-seats?${params}`, { replace: true });
// // //     setResolvedSlotId(t.id);
// // //     setSelectedTimeSlot(null);
// // //     setSelectedSeatId(null);
// // //   }

// // //   if (loading) return (
// // //     <div className="min-h-screen bg-white flex items-center justify-center">
// // //       <div className="text-center">
// // //         <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
// // //         <p className="text-gray-600">Loading seats...</p>
// // //       </div>
// // //     </div>
// // //   );
// // //   if (error && !showUserDetailsPopup) return (
// // //     <div className="min-h-screen bg-white flex items-center justify-center">
// // //       <div className="text-center max-w-md mx-auto p-6">
// // //         <div className="text-red-500 text-4xl mb-4">⚠️</div>
// // //         <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Error</h2>
// // //         <p className="text-red-600 mb-4">{error}</p>
// // //         <button 
// // //           onClick={() => window.location.reload()} 
// // //           className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
// // //         >
// // //           Try Again
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );

// // //   return (
// // //     <div className="min-h-screen bg-white">
// // //       {/* Header */}
// // //       <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
// // //         <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
// // //           <button onClick={goBack} className="mr-1 rounded px-2 py-1 text-gray-700 hover:bg-gray-100" aria-label="Back">‹</button>
// // //           <div className="h-9 w-56 rounded bg-gray-900 text-white grid place-items-center text-sm font-semibold">{companyName}</div>
// // //           <div className="flex-1 h-9 min-w-[280px] ml-3 rounded bg-sky-200 text-gray-900 grid place-items-center text-sm font-semibold">
// // //             {workshopTitle}
// // //           </div>
// // //         </div>
// // //       </header>

// // //       {/* Main */}
// // //       <main className="mx-auto max-w-6xl px-4 py-6">
// // //         {/* Other hour slots for the same day */}
// // //         {times?.length > 0 && (
// // //           <div className="mb-6">
// // //             <div className="text-sm text-gray-600 mb-2">Other times on {date}</div>
// // //             <div className="flex flex-wrap gap-2">
// // //               {times.map(t => (
// // //                 <button
// // //                   key={t.id}
// // //                   onClick={() => switchTime(t)}
// // //                   className={cx(
// // //                     "px-3 py-2 rounded-lg border text-sm",
// // //                     String(t.id) === String(resolvedSlotId)
// // //                       ? "bg-blue-600 text-white border-blue-600"
// // //                       : "bg-white hover:bg-blue-50 border-gray-200"
// // //                   )}
// // //                 >
// // //                   {f12(t.start)}–{f12(t.end)}
// // //                 </button>
// // //               ))}
// // //             </div>
// // //           </div>
// // //         )}

// // //         {/* 10-minute mini-slots (DB-driven availability) */}
// // //         <div className="rounded-xl border p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
// // //           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
// // //             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
// // //             Select 10-Minute Time Slot
// // //           </h3>
// // //           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
// // //             {timeSlots.map((slot, i) => {
// // //               const info = miniSeatStatus[i];            // db seat mapped to mini-slot i
// // //               const isBooked = info && info.status !== "AVAILABLE";
// // //               const isSelected = selectedTimeSlot === i;

// // //               return (
// // //                 <button
// // //                   key={slot.id}
// // //                   onClick={() => {
// // //                     if (!info || info.status !== "AVAILABLE") return;
// // //                     setSelectedTimeSlot(i);
// // //                     setSelectedSeatId(Number(info.id)); // capture REAL seat id now
// // //                   }}
// // //                   disabled={isBooked}
// // //                   className={cx(
// // //                     "p-4 rounded-lg border-2 transition-all duration-200 text-left",
// // //                     isSelected 
// // //                       ? "border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105" 
// // //                       : isBooked
// // //                         ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
// // //                         : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
// // //                   )}
// // //                   title={isBooked ? "This 10-minute slot is already booked" : `${slot.displayStart} - ${slot.displayEnd}`}
// // //                 >
// // //                   <div className="text-sm font-semibold">{slot.displayStart}</div>
// // //                   <div className="text-xs opacity-75 mt-1">to {slot.displayEnd}</div>
// // //                   <div className={cx(
// // //                     "text-xs mt-2 px-2 py-1 rounded-full inline-block",
// // //                     isSelected 
// // //                       ? "bg-white/20 text-white"
// // //                       : isBooked 
// // //                         ? "bg-red-100 text-red-600"
// // //                         : "bg-green-100 text-green-600"
// // //                   )}>
// // //                     {isBooked ? "BOOKED" : "AVAILABLE"}
// // //                   </div>
// // //                 </button>
// // //               );
// // //             })}
// // //           </div>
// // //         </div>

// // //         {/* Booking Summary Card */}
// // //         <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border p-6">
// // //           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
// // //             {/* Booking Details */}
// // //             <div className="space-y-2">
// // //               <h4 className="font-semibold text-gray-900">Booking Summary</h4>
// // //               <div className="space-y-1 text-sm text-gray-600">
// // //                 <div className="flex gap-2">
// // //                   <span className="font-medium">Company:</span>
// // //                   <span>{companyName}</span>
// // //                 </div>
// // //                 <div className="flex gap-2">
// // //                   <span className="font-medium">Workshop:</span>
// // //                   <span>{workshopTitle}</span>
// // //                 </div>
// // //                 {selectedTimeSlot !== null && timeSlots[selectedTimeSlot] && (
// // //                   <div className="flex gap-2">
// // //                     <span className="font-medium">Time Slot:</span>
// // //                     <span className="text-blue-600 font-medium">
// // //                       {timeSlots[selectedTimeSlot].displayStart} - {timeSlots[selectedTimeSlot].displayEnd}
// // //                     </span>
// // //                   </div>
// // //                 )}
// // //               </div>
// // //             </div>

// // //             {/* Book Button */}
// // //             <div className="flex flex-col items-end gap-2">
// // //               <div className="text-right">
// // //                 <div className="text-2xl font-bold text-gray-900">₹{total}</div>
// // //                 <div className="text-xs text-gray-500">Total Amount</div>
// // //               </div>
// // //               <button
// // //                 className={cx(
// // //                   "px-8 py-3 rounded-xl text-white text-base font-semibold border transition-all duration-200",
// // //                   selectedTimeSlot === null || booking
// // //                     ? "bg-gray-400 border-gray-400 cursor-not-allowed"
// // //                     : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 border-transparent shadow-lg hover:shadow-xl transform hover:scale-105"
// // //                 )}
// // //                 disabled={selectedTimeSlot === null || booking}
// // //                 onClick={openUserDetailsPopup}
// // //               >
// // //                 {booking ? (
// // //                   <span className="flex items-center gap-2">
// // //                     <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
// // //                     Processing...
// // //                   </span>
// // //                 ) : (
// // //                   selectedTimeSlot === null ? "Select a 10-min Slot" : "Book Slot"
// // //                 )}
// // //               </button>
// // //               {selectedTimeSlot === null && (
// // //                 <p className="text-xs text-gray-500 text-center">
// // //                   Select a mini-slot to continue
// // //                 </p>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </main>

// // //       <footer className="sticky bottom-0 z-10 border-t bg-white/90 backdrop-blur">
// // //         <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between" aria-live="polite">
// // //           <div className="text-sm">
// // //             {selectedTimeSlot !== null ? (
// // //               <>Selected: <span className="font-semibold">1</span> • Total: <span className="font-semibold">₹ {total}</span></>
// // //             ) : "Select a 10-minute mini-slot to continue"}
// // //           </div>
// // //           <div className="flex items-center gap-2">
// // //             <button
// // //               className="px-4 py-2 rounded-lg border"
// // //               onClick={() => { setSelectedTimeSlot(null); setSelectedSeatId(null); }}
// // //               disabled={selectedTimeSlot===null}
// // //             >
// // //               Clear
// // //             </button>
// // //             <button
// // //               className="px-5 py-2 rounded-lg bg-black text-white disabled:opacity-50"
// // //               onClick={openUserDetailsPopup}
// // //               disabled={selectedTimeSlot===null || booking}
// // //             >
// // //               {booking ? "Booking…" : "Confirm Booking"}
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </footer>

// // //       {/* User Details Popup */}
// // //       {showUserDetailsPopup && (
// // //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// // //           <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
// // //             <div className="flex items-center justify-between mb-6">
// // //               <h3 className="text-xl font-semibold text-gray-900">Enter Your Details</h3>
// // //               <button 
// // //                 onClick={() => setShowUserDetailsPopup(false)}
// // //                 className="text-gray-400 hover:text-gray-600 text-2xl"
// // //               >
// // //                 ×
// // //               </button>
// // //             </div>

// // //             <div className="space-y-4">
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Full Name <span className="text-red-500">*</span>
// // //                 </label>
// // //                 <input
// // //                   type="text"
// // //                   value={userDetails.name}
// // //                   onChange={(e) => setUserDetails(prev => ({...prev, name: e.target.value}))}
// // //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// // //                   placeholder="Enter your full name"
// // //                 />
// // //               </div>

// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Mobile Number <span className="text-red-500">*</span>
// // //                 </label>
// // //                 <input
// // //                   type="tel"
// // //                   value={userDetails.mobile}
// // //                   onChange={(e) => setUserDetails(prev => ({...prev, mobile: e.target.value}))}
// // //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// // //                   placeholder="Enter your mobile number"
// // //                 />
// // //               </div>

// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Email Address <span className="text-red-500">*</span>
// // //                 </label>
// // //                 <input
// // //                   type="email"
// // //                   value={userDetails.email}
// // //                   onChange={(e) => setUserDetails(prev => ({...prev, email: e.target.value}))}
// // //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// // //                   placeholder="Enter your email address"
// // //                 />
// // //               </div>
// // //             </div>

// // //             <div className="flex gap-3 mt-6">
// // //               <button
// // //                 onClick={() => setShowUserDetailsPopup(false)}
// // //                 className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
// // //               >
// // //                 Cancel
// // //               </button>
// // //               <button
// // //                 onClick={confirmBooking}
// // //                 disabled={
// // //                   !validName(userDetails.name) ||
// // //                   !validMobile(userDetails.mobile) ||
// // //                   !validEmail(userDetails.email) ||
// // //                   booking
// // //                 }
// // //                 className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
// // //               >
// // //                 {booking ? (
// // //                   <span className="flex items-center justify-center gap-2">
// // //                     <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
// // //                     Processing...
// // //                   </span>
// // //                 ) : (
// // //                   'Submit & Book'
// // //                 )}
// // //               </button>
// // //             </div>

// // //             {/* Show any booking error */}
// // //             {error && (
// // //               <div className="mt-4 text-sm text-red-600">
// // //                 {error}
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }
// // import React, { useEffect, useMemo, useState } from "react";
// // import { useLocation, useNavigate } from "react-router-dom";
// // import {
// //   getSeats,
// //   resolveSlotId,
// //   createBookingSimple
// // } from "../api/client";

// // function cx(...a){ return a.filter(Boolean).join(" "); }
// // function f12(hhmm="00:00"){
// //   const [h,m]=(hhmm||"00:00").split(":").map(Number);
// //   const am=h<12?"AM":"PM";
// //   const h12=((h+11)%12)+1;
// //   return `${h12}:${String(m).padStart(2,"0")} ${am}`;
// // }

// // export default function SeatSelection() {
// //   const { search } = useLocation();
// //   const navigate = useNavigate();
// //   const q = new URLSearchParams(search);

// //   const slotIdRaw   = q.get("slotId") || "";
// //   const start       = q.get("start") || "";
// //   const end         = q.get("end") || "";
// //   const basePrice   = Number(q.get("price") || 0);
// //   const workshopId  = q.get("workshopId") || q.get("centerId") || "c1";
// //   const date        = q.get("date") || new Date().toISOString().slice(0,10);
// //   const workshopTitle = q.get("workshopTitle") || "Workshop";
// //   const companyName = q.get("companyName") || "Company";

// //   // UI state
// //   const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // mini-slot index 0..5
// //   const [selectedSeatId, setSelectedSeatId] = useState(null);     // REAL seat id from API
// //   const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
// //   const [userDetails, setUserDetails] = useState({ name: "", mobile: "", email: "" });

// //   // Backend state
// //   const [resolvedSlotId, setResolvedSlotId] = useState(slotIdRaw);
// //   const [seatsRaw, setSeatsRaw] = useState([]);   // [{id,displayNo,status,price,...}] from API
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [booking, setBooking] = useState(false);

// //   // Generate 6 time slots of 10 minutes each within the selected hour
// //   const generateTimeSlots = () => {
// //     if (!start) {
// //       const defaultSlots = [];
// //       for (let i = 0; i < 6; i++) {
// //         const startMin = i * 10;
// //         const endMin = (i + 1) * 10;
// //         const startTime = `09:${String(startMin).padStart(2, '0')}`;
// //         const endTime = `09:${String(endMin).padStart(2, '0')}`;
// //         defaultSlots.push({
// //           id: i,
// //           startTime,
// //           endTime,
// //           displayStart: f12(startTime),
// //           displayEnd: f12(endTime),
// //         });
// //       }
// //       return defaultSlots;
// //     }
// //     const [startHour, startMin] = start.split(':').map(Number);
// //     const slots = [];
// //     for (let i = 0; i < 6; i++) {
// //       const slotStartMin = startMin + (i * 10);
// //       const slotEndMin = startMin + ((i + 1) * 10);
// //       const slotStartHour = startHour + Math.floor(slotStartMin / 60);
// //       const slotEndHour = startHour + Math.floor(slotEndMin / 60);
// //       const finalStartMin = slotStartMin % 60;
// //       const finalEndMin = slotEndMin % 60;
// //       const startTime = `${String(slotStartHour).padStart(2,'0')}:${String(finalStartMin).padStart(2,'0')}`;
// //       const endTime   = `${String(slotEndHour).padStart(2,'0')}:${String(finalEndMin).padStart(2,'0')}`;
// //       slots.push({
// //         id: i,
// //         startTime,
// //         endTime,
// //         displayStart: f12(startTime),
// //         displayEnd: f12(endTime),
// //       });
// //     }
// //     return slots;
// //   };
// //   const timeSlots = useMemo(generateTimeSlots, [start]);

// //   // Resolve slotId if missing (navigated by time only)
// //   useEffect(() => {
// //     let alive = true;
// //     (async () => {
// //       if (resolvedSlotId) return;
// //       if (!workshopId || !date || !start) return;
// //       try {
// //         const id = await resolveSlotId(workshopId, date, start, end || undefined);
// //         if (!alive) return;
// //         setResolvedSlotId(String(id));
// //       } catch {
// //         if (!alive) return;
// //         setError("Could not resolve showtime. Please go back and pick another time.");
// //       }
// //     })();
// //     return () => { alive = false; };
// //   }, [resolvedSlotId, workshopId, date, start, end]);

// //   // Load seats for this slot -> DB truth for BOOKED/AVAILABLE
// //   useEffect(() => {
// //     let alive = true;
// //     (async () => {
// //       if (!resolvedSlotId) { setLoading(false); return; }
// //       try {
// //         setLoading(true);
// //         setError("");
// //         const data = await getSeats(resolvedSlotId);
// //         if (!alive) return;
// //         const list = Array.isArray(data?.seats) ? data.seats : [];
// //         setSeatsRaw(list);
// //       } catch (e) {
// //         if (!alive) return;
// //         setError(e?.message || "Failed to load seats");
// //         setSeatsRaw([]);
// //       } finally {
// //         if (alive) setLoading(false);
// //       }
// //     })();
// //     return () => { alive = false; };
// //   }, [resolvedSlotId]);

// //   // Map mini-slot index (0..5) -> seat info from DB
// //   const miniSeatStatus = useMemo(() => {
// //     const byIndex = {};
// //     const sorted = [...seatsRaw].sort((a, b) => {
// //       const ai = (a.displayNo ?? a.col_number ?? 0);
// //       const bi = (b.displayNo ?? b.col_number ?? 0);
// //       return ai - bi;
// //     });
// //     sorted.slice(0, 6).forEach((s, idx) => {
// //       byIndex[idx] = {
// //         id: Number(s.id),
// //         status: s.status, // "AVAILABLE" | "BOOKED"
// //         displayNo: s.displayNo ?? s.col_number ?? (idx + 1),
// //         price: s.price ?? basePrice
// //       };
// //     });
// //     return byIndex;
// //   }, [seatsRaw, basePrice]);

// //   // If selection becomes invalid (seat turns BOOKED), clear it
// //   useEffect(() => {
// //     if (selectedTimeSlot != null) {
// //       const info = miniSeatStatus[selectedTimeSlot];
// //       if (info && info.status !== "AVAILABLE") {
// //         setSelectedTimeSlot(null);
// //         setSelectedSeatId(null);
// //       }
// //     }
// //   }, [miniSeatStatus, selectedTimeSlot]);

// //   const total = selectedTimeSlot != null
// //     ? (miniSeatStatus[selectedTimeSlot]?.price ?? basePrice)
// //     : basePrice || 0;

// //   function openUserDetailsPopup() {
// //     if (selectedTimeSlot == null || !selectedSeatId) return;
// //     setShowUserDetailsPopup(true);
// //   }

// //   const validEmail  = (e) => /\S+@\S+\.\S+/.test((e||"").trim());
// //   const validMobile = (m) => /^[6-9]\d{9}$/.test(String(m||"").replace(/[^\d]/g,"").slice(-10));
// //   const validName   = (n) => String(n||"").trim().length >= 2;

// //   async function confirmBooking() {
// //     if (!validName(userDetails.name) || !validMobile(userDetails.mobile) || !validEmail(userDetails.email)) {
// //       alert('Please enter a valid name, 10-digit mobile, and email.');
// //       return;
// //     }
// //     if (selectedTimeSlot === null || !selectedSeatId) {
// //       alert('Please select a 10-minute mini-slot');
// //       return;
// //     }

// //     try {
// //       setBooking(true);
// //       setError("");

// //       // Build payload with the captured seat id (DB truth)
// //       const payload = {
// //         slotId: Number(resolvedSlotId || 0),
// //         name: userDetails.name.trim(),
// //         email: userDetails.email.trim(),
// //         mobile_no: userDetails.mobile.trim(),
// //         seats: [Number(selectedSeatId)],  // send REAL seat id array
// //         amount_paid: total,
// //         payment_ref: `demo_${Date.now()}`
// //       };

// //       const resp = await createBookingSimple(payload); // expects 201

// //       const bookingId = resp.bookingId ?? resp.id ?? `BK${Date.now()}`;
// //       const slot = timeSlots[selectedTimeSlot];
// //       const params = new URLSearchParams({
// //         bookingId: String(bookingId),
// //         companyName,
// //         workshopTitle,
// //         venue: q.get("venue") || "Medical Center, Delhi",
// //         date,
// //         startTime: slot.displayStart,
// //         endTime: slot.displayEnd,
// //         seatNumber: `${slot.displayStart}–${slot.displayEnd}`,
// //         amount: String(resp.total ?? resp.amount_paid ?? total),
// //         userName: userDetails.name.trim(),
// //         userMobile: userDetails.mobile.trim(),
// //         userEmail: userDetails.email.trim()
// //       }).toString();

// //       navigate(`/confirmation?${params}`);
// //     } catch (e) {
// //       const msg =
// //         e?.response?.data?.message ||
// //         e?.response?.data?.error ||
// //         e?.message ||
// //         "Seat got taken. Please pick another mini-slot.";
// //       alert(msg);

// //       // Refresh from DB so UI shows latest BOOKED/AVAILABLE
// //       try {
// //         const data = await getSeats(resolvedSlotId);
// //         const list = Array.isArray(data?.seats) ? data.seats : [];
// //         setSeatsRaw(list);
// //       } catch {}
// //     } finally {
// //       setBooking(false);
// //       setShowUserDetailsPopup(false);
// //     }
// //   }

// //   function goBack(){ navigate(-1); }

// //   if (loading) return (
// //     <div className="min-h-screen bg-white flex items-center justify-center">
// //       <div className="text-center">
// //         <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
// //         <p className="text-gray-600">Loading seats...</p>
// //       </div>
// //     </div>
// //   );
// //   if (error && !showUserDetailsPopup) return (
// //     <div className="min-h-screen bg-white flex items-center justify-center">
// //       <div className="text-center max-w-md mx-auto p-6">
// //         <div className="text-red-500 text-4xl mb-4">⚠️</div>
// //         <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Error</h2>
// //         <p className="text-red-600 mb-4">{error}</p>
// //         <button 
// //           onClick={() => window.location.reload()} 
// //           className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
// //         >
// //           Try Again
// //         </button>
// //       </div>
// //     </div>
// //   );

// //   return (
// //     <div className="min-h-screen bg-white">
// //       {/* Header */}
// //       <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
// //         <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
// //           <button onClick={goBack} className="mr-1 rounded px-2 py-1 text-gray-700 hover:bg-gray-100" aria-label="Back">‹</button>
// //           <div className="h-9 w-56 rounded bg-gray-900 text-white grid place-items-center text-sm font-semibold">{companyName}</div>
// //           <div className="flex-1 h-9 min-w-[280px] ml-3 rounded bg-sky-200 text-gray-900 grid place-items-center text-sm font-semibold">
// //             {workshopTitle}
// //           </div>
// //         </div>
// //       </header>

// //       {/* Main */}
// //       <main className="mx-auto max-w-6xl px-4 py-6">
// //         {/* 10-minute mini-slots (DB-driven availability) */}
// //         <div className="rounded-xl border p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
// //           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
// //             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
// //             Select 10-Minute Time Slot
// //           </h3>
// //           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
// //             {timeSlots.map((slot, i) => {
// //               const info = miniSeatStatus[i];            // db seat mapped to mini-slot i
// //               const isBooked = info && info.status !== "AVAILABLE";
// //               const isSelected = selectedTimeSlot === i;

// //               return (
// //                 <button
// //                   key={slot.id}
// //                   onClick={() => {
// //                     if (!info || info.status !== "AVAILABLE") return;
// //                     setSelectedTimeSlot(i);
// //                     setSelectedSeatId(Number(info.id)); // capture REAL seat id now
// //                   }}
// //                   disabled={isBooked}
// //                   className={cx(
// //                     "p-4 rounded-lg border-2 transition-all duration-200 text-left",
// //                     isSelected 
// //                       ? "border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105" 
// //                       : isBooked
// //                         ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
// //                         : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
// //                   )}
// //                   title={isBooked ? "This 10-minute slot is already booked" : `${slot.displayStart} - ${slot.displayEnd}`}
// //                 >
// //                   <div className="text-sm font-semibold">{slot.displayStart}</div>
// //                   <div className="text-xs opacity-75 mt-1">to {slot.displayEnd}</div>
// //                   <div className={cx(
// //                     "text-xs mt-2 px-2 py-1 rounded-full inline-block",
// //                     isSelected 
// //                       ? "bg-white/20 text-white"
// //                       : isBooked 
// //                         ? "bg-red-100 text-red-600"
// //                         : "bg-green-100 text-green-600"
// //                   )}>
// //                     {isBooked ? "BOOKED" : "AVAILABLE"}
// //                   </div>
// //                 </button>
// //               );
// //             })}
// //           </div>
// //         </div>

// //         {/* Booking Summary Card */}
// //         <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border p-6">
// //           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
// //             {/* Booking Details */}
// //             <div className="space-y-2">
// //               <h4 className="font-semibold text-gray-900">Booking Summary</h4>
// //               <div className="space-y-1 text-sm text-gray-600">
// //                 <div className="flex gap-2">
// //                   <span className="font-medium">Company:</span>
// //                   <span>{companyName}</span>
// //                 </div>
// //                 <div className="flex gap-2">
// //                   <span className="font-medium">Workshop:</span>
// //                   <span>{workshopTitle}</span>
// //                 </div>
// //                 {selectedTimeSlot !== null && timeSlots[selectedTimeSlot] && (
// //                   <div className="flex gap-2">
// //                     <span className="font-medium">Time Slot:</span>
// //                     <span className="text-blue-600 font-medium">
// //                       {timeSlots[selectedTimeSlot].displayStart} - {timeSlots[selectedTimeSlot].displayEnd}
// //                     </span>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>

// //             {/* Book Button */}
// //             <div className="flex flex-col items-end gap-2">
// //               <div className="text-right">
// //                 <div className="text-2xl font-bold text-gray-900">₹{total}</div>
// //                 <div className="text-xs text-gray-500">Total Amount</div>
// //               </div>
// //               <button
// //                 className={cx(
// //                   "px-8 py-3 rounded-xl text-white text-base font-semibold border transition-all duration-200",
// //                   selectedTimeSlot === null || booking
// //                     ? "bg-gray-400 border-gray-400 cursor-not-allowed"
// //                     : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 border-transparent shadow-lg hover:shadow-xl transform hover:scale-105"
// //                 )}
// //                 disabled={selectedTimeSlot === null || booking}
// //                 onClick={openUserDetailsPopup}
// //               >
// //                 {booking ? (
// //                   <span className="flex items-center gap-2">
// //                     <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
// //                     Processing...
// //                   </span>
// //                 ) : (
// //                   selectedTimeSlot === null ? "Select a 10-min Slot" : "Book Slot"
// //                 )}
// //               </button>
// //               {selectedTimeSlot === null && (
// //                 <p className="text-xs text-gray-500 text-center">
// //                   Select a mini-slot to continue
// //                 </p>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </main>

// //       <footer className="sticky bottom-0 z-10 border-t bg-white/90 backdrop-blur">
// //         <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between" aria-live="polite">
// //           <div className="text-sm">
// //             {selectedTimeSlot !== null ? (
// //               <>Selected: <span className="font-semibold">1</span> • Total: <span className="font-semibold">₹ {total}</span></>
// //             ) : "Select a 10-minute mini-slot to continue"}
// //           </div>
// //           <div className="flex items-center gap-2">
// //             <button
// //               className="px-4 py-2 rounded-lg border"
// //               onClick={() => { setSelectedTimeSlot(null); setSelectedSeatId(null); }}
// //               disabled={selectedTimeSlot===null}
// //             >
// //               Clear
// //             </button>
// //             <button
// //               className="px-5 py-2 rounded-lg bg-black text-white disabled:opacity-50"
// //               onClick={openUserDetailsPopup}
// //               disabled={selectedTimeSlot===null || booking}
// //             >
// //               {booking ? "Booking…" : "Confirm Booking"}
// //             </button>
// //           </div>
// //         </div>
// //       </footer>

// //       {/* User Details Popup */}
// //       {showUserDetailsPopup && (
// //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// //           <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
// //             <div className="flex items-center justify-between mb-6">
// //               <h3 className="text-xl font-semibold text-gray-900">Enter Your Details</h3>
// //               <button 
// //                 onClick={() => setShowUserDetailsPopup(false)}
// //                 className="text-gray-400 hover:text-gray-600 text-2xl"
// //               >
// //                 ×
// //               </button>
// //             </div>

// //             <div className="space-y-4">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Full Name <span className="text-red-500">*</span>
// //                 </label>
// //                 <input
// //                   type="text"
// //                   value={userDetails.name}
// //                   onChange={(e) => setUserDetails(prev => ({...prev, name: e.target.value}))}
// //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// //                   placeholder="Enter your full name"
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Mobile Number <span className="text-red-500">*</span>
// //                 </label>
// //                 <input
// //                   type="tel"
// //                   value={userDetails.mobile}
// //                   onChange={(e) => setUserDetails(prev => ({...prev, mobile: e.target.value}))}
// //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// //                   placeholder="Enter your mobile number"
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Email Address <span className="text-red-500">*</span>
// //                 </label>
// //                 <input
// //                   type="email"
// //                   value={userDetails.email}
// //                   onChange={(e) => setUserDetails(prev => ({...prev, email: e.target.value}))}
// //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
// //                   placeholder="Enter your email address"
// //                 />
// //               </div>
// //             </div>

// //             <div className="flex gap-3 mt-6">
// //               <button
// //                 onClick={() => setShowUserDetailsPopup(false)}
// //                 className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={confirmBooking}
// //                 disabled={
// //                   !/^\S.{0,}$/.test(userDetails.name) ||
// //                   !/^[6-9]\d{9}$/.test(String(userDetails.mobile||"").replace(/[^\d]/g,"").slice(-10)) ||
// //                   !/\S+@\S+\.\S+/.test((userDetails.email||"").trim()) ||
// //                   booking
// //                 }
// //                 className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
// //               >
// //                 {booking ? (
// //                   <span className="flex items-center justify-center gap-2">
// //                     <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
// //                     Processing...
// //                   </span>
// //                 ) : (
// //                   'Submit & Book'
// //                 )}
// //               </button>
// //             </div>

// //             {/* Show any booking error */}
// //             {error && (
// //               <div className="mt-4 text-sm text-red-600">
// //                 {error}
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   getSeats,
//   resolveSlotId,
//   createBookingSimple
// } from "../api/client";

// function cx(...a){ return a.filter(Boolean).join(" "); }
// function f12(hhmm="00:00"){
//   const [h,m]=(hhmm||"00:00").split(":").map(Number);
//   const am=h<12?"AM":"PM";
//   const h12=((h+11)%12)+1;
//   return `${h12}:${String(m).padStart(2,"0")} ${am}`;
// }

// export default function SeatSelection() {
//   const { search } = useLocation();
//   const navigate = useNavigate();
//   const q = new URLSearchParams(search);

//   const slotIdRaw   = q.get("slotId") || "";
//   const start       = q.get("start") || "";
//   const end         = q.get("end") || "";
//   const basePrice   = Number(q.get("price") || 0);
//   const workshopId  = q.get("workshopId") || q.get("centerId") || "c1";
//   const date        = q.get("date") || new Date().toISOString().slice(0,10);
//   const workshopTitle = q.get("workshopTitle") || "Workshop";
//   const companyName = q.get("companyName") || "Company";

//   // UI state
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // mini-slot index 0..5
//   const [selectedSeatId, setSelectedSeatId] = useState(null);     // REAL seat id from API
//   const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
//   const [userDetails, setUserDetails] = useState({ name: "", mobile: "", email: "" });

//   // Backend state
//   const [resolvedSlotId, setResolvedSlotId] = useState(slotIdRaw);
//   const [seatsRaw, setSeatsRaw] = useState([]);   // [{id,displayNo,status,price,...}] from API
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [booking, setBooking] = useState(false);

//   // ---------- Validators (shared by UI + submit) ----------
//   const onlyDigits   = (s) => String(s || "").replace(/[^\d]/g, "");
//   const validName    = (n) => String(n || "").trim().length >= 2;
//   const validMobile  = (m) => /^[6-9]\d{9}$/.test(onlyDigits(m).slice(-10)); // India 10-digit starting 6–9
//   const validEmail   = (e) => /\S+@\S+\.\S+/.test(String(e || "").trim());

//   const isNameValid   = validName(userDetails.name);
//   const isMobileValid = validMobile(userDetails.mobile);
//   const isEmailValid  = validEmail(userDetails.email);
//   const canSubmit     = isNameValid && isMobileValid && isEmailValid && !booking && selectedTimeSlot !== null && !!selectedSeatId;

//   // ---------- Build 6×10min mini-slots from the hour ----------
//   const generateTimeSlots = () => {
//     if (!start) {
//       const defaultSlots = [];
//       for (let i = 0; i < 6; i++) {
//         const startMin = i * 10;
//         const endMin = (i + 1) * 10;
//         const startTime = `09:${String(startMin).padStart(2, '0')}`;
//         const endTime = `09:${String(endMin).padStart(2, '0')}`;
//         defaultSlots.push({
//           id: i,
//           startTime,
//           endTime,
//           displayStart: f12(startTime),
//           displayEnd: f12(endTime),
//         });
//       }
//       return defaultSlots;
//     }
//     const [startHour, startMin] = start.split(':').map(Number);
//     const slots = [];
//     for (let i = 0; i < 6; i++) {
//       const slotStartMin = startMin + (i * 10);
//       const slotEndMin = startMin + ((i + 1) * 10);
//       const slotStartHour = startHour + Math.floor(slotStartMin / 60);
//       const slotEndHour = startHour + Math.floor(slotEndMin / 60);
//       const finalStartMin = slotStartMin % 60;
//       const finalEndMin = slotEndMin % 60;
//       const startTime = `${String(slotStartHour).padStart(2,'0')}:${String(finalStartMin).padStart(2,'0')}`;
//       const endTime   = `${String(slotEndHour).padStart(2,'0')}:${String(finalEndMin).padStart(2,'0')}`;
//       slots.push({
//         id: i,
//         startTime,
//         endTime,
//         displayStart: f12(startTime),
//         displayEnd: f12(endTime),
//       });
//     }
//     return slots;
//   };
//   const timeSlots = useMemo(generateTimeSlots, [start]);

//   // ---------- Resolve slotId if missing ----------
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       if (resolvedSlotId) return;
//       if (!workshopId || !date || !start) return;
//       try {
//         const id = await resolveSlotId(workshopId, date, start, end || undefined);
//         if (!alive) return;
//         setResolvedSlotId(String(id));
//       } catch {
//         if (!alive) return;
//         setError("Could not resolve showtime. Please go back and pick another time.");
//       }
//     })();
//     return () => { alive = false; };
//   }, [resolvedSlotId, workshopId, date, start, end]);

//   // ---------- Load seats for this slot (DB truth) ----------
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       if (!resolvedSlotId) { setLoading(false); return; }
//       try {
//         setLoading(true);
//         setError("");
//         const data = await getSeats(resolvedSlotId);
//         if (!alive) return;
//         const list = Array.isArray(data?.seats) ? data.seats : [];
//         setSeatsRaw(list);
//       } catch (e) {
//         if (!alive) return;
//         setError(e?.message || "Failed to load seats");
//         setSeatsRaw([]);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [resolvedSlotId]);

//   // ---------- Map mini-slot index (0..5) -> seat info from DB ----------
//   const miniSeatStatus = useMemo(() => {
//     const byIndex = {};
//     const sorted = [...seatsRaw].sort((a, b) => {
//       const ai = (a.displayNo ?? a.col_number ?? 0);
//       const bi = (b.displayNo ?? b.col_number ?? 0);
//       return ai - bi;
//     });
//     sorted.slice(0, 6).forEach((s, idx) => {
//       byIndex[idx] = {
//         id: Number(s.id),
//         status: s.status, // "AVAILABLE" | "BOOKED"
//         displayNo: s.displayNo ?? s.col_number ?? (idx + 1),
//         price: s.price ?? basePrice
//       };
//     });
//     return byIndex;
//   }, [seatsRaw, basePrice]);

//   // Clear selection if it becomes invalid
//   useEffect(() => {
//     if (selectedTimeSlot != null) {
//       const info = miniSeatStatus[selectedTimeSlot];
//       if (!info || info.status !== "AVAILABLE") {
//         setSelectedTimeSlot(null);
//         setSelectedSeatId(null);
//       }
//     }
//   }, [miniSeatStatus, selectedTimeSlot]);

//   const total = selectedTimeSlot != null
//     ? (miniSeatStatus[selectedTimeSlot]?.price ?? basePrice)
//     : basePrice || 0;

//   function openUserDetailsPopup() {
//     if (selectedTimeSlot == null || !selectedSeatId) return;
//     setShowUserDetailsPopup(true);
//   }

//   // ---------- Submit ----------
//   async function confirmBooking() {
//     if (!validName(userDetails.name) || !validMobile(userDetails.mobile) || !validEmail(userDetails.email)) {
//       alert('Please enter a valid name, 10-digit mobile, and email.');
//       return;
//     }
//     if (selectedTimeSlot === null || !selectedSeatId) {
//       alert('Please select a 10-minute mini-slot');
//       return;
//     }

//     try {
//       setBooking(true);
//       setError("");

//       const payload = {
//         slotId: Number(resolvedSlotId),
//         name: userDetails.name.trim(),
//         email: userDetails.email.trim(),
//         mobile_no: userDetails.mobile.trim(),
//         seats: [Number(selectedSeatId)],  // REAL seat id
//         amount_paid: total,
//         payment_ref: `demo_${Date.now()}`
//       };

//       const resp = await createBookingSimple(payload); // expects 201

//       const bookingId = resp.bookingId ?? resp.id ?? `BK${Date.now()}`;
//       const slot = timeSlots[selectedTimeSlot];
//       const params = new URLSearchParams({
//         bookingId: String(bookingId),
//         companyName,
//         workshopTitle,
//         venue: q.get("venue") || "Medical Center, Delhi",
//         date,
//         startTime: slot.displayStart,
//         endTime: slot.displayEnd,
//         seatNumber: `${slot.displayStart}–${slot.displayEnd}`,
//         amount: String(resp.total ?? resp.amount_paid ?? total),
//         userName: userDetails.name.trim(),
//         userMobile: userDetails.mobile.trim(),
//         userEmail: userDetails.email.trim()
//       }).toString();

//       navigate(`/confirmation?${params}`);
//     } catch (e) {
//       const msg =
//         e?.response?.data?.message ||
//         e?.response?.data?.error ||
//         e?.message ||
//         "Seat got taken. Please pick another mini-slot.";
//       alert(msg);

//       // Refresh from DB so UI shows latest BOOKED/AVAILABLE
//       try {
//         const data = await getSeats(resolvedSlotId);
//         const list = Array.isArray(data?.seats) ? data.seats : [];
//         setSeatsRaw(list);
//       } catch {}
//     } finally {
//       setBooking(false);
//       setShowUserDetailsPopup(false);
//     }
//   }

//   function goBack(){ navigate(-1); }

//   if (loading) return (
//     <div className="min-h-screen bg-white flex items-center justify-center">
//       <div className="text-center">
//         <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
//         <p className="text-gray-600">Loading seats...</p>
//       </div>
//     </div>
//   );
//   if (error && !showUserDetailsPopup) return (
//     <div className="min-h-screen bg-white flex items-center justify-center">
//       <div className="text-center max-w-md mx-auto p-6">
//         <div className="text-red-500 text-4xl mb-4">⚠️</div>
//         <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Error</h2>
//         <p className="text-red-600 mb-4">{error}</p>
//         <button 
//           onClick={() => window.location.reload()} 
//           className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
//         >
//           Try Again
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header */}
//       <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
//         <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
//           <button onClick={goBack} className="mr-1 rounded px-2 py-1 text-gray-700 hover:bg-gray-100" aria-label="Back">‹</button>
//           <div className="h-9 w-56 rounded bg-gray-900 text-white grid place-items-center text-sm font-semibold">{companyName}</div>
//           <div className="flex-1 h-9 min-w-[280px] ml-3 rounded bg-sky-200 text-gray-900 grid place-items-center text-sm font-semibold">
//             {workshopTitle}
//           </div>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="mx-auto max-w-6xl px-4 py-6">
//         {/* Ads Section */}
//         <div className="w-full h-32 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
//           <div className="text-white text-center">
//             <h3 className="text-xl font-bold mb-2">Advertisement Space</h3>
//             <p className="text-sm opacity-90">Ads will run here</p>
//           </div>
//         </div>

//         {/* 10-minute mini-slots (DB-driven availability) */}
//         <div className="rounded-xl border p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
//             Select 10-Minute Time Slot
//           </h3>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
//             {timeSlots.map((slot, i) => {
//               const info = miniSeatStatus[i];            // db seat mapped to mini-slot i
//               const isBooked = info && info.status !== "AVAILABLE";
//               const isSelected = selectedTimeSlot === i;

//               return (
//                 <button
//                   key={slot.id}
//                   onClick={() => {
//                     if (!info || info.status !== "AVAILABLE") return;
//                     setSelectedTimeSlot(i);
//                     setSelectedSeatId(Number(info.id)); // capture REAL seat id now
//                   }}
//                   disabled={isBooked}
//                   className={cx(
//                     "p-4 rounded-lg border-2 transition-all duration-200 text-left",
//                     isSelected 
//                       ? "border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105" 
//                       : isBooked
//                         ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
//                         : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
//                   )}
//                   title={isBooked ? "This 10-minute slot is already booked" : `${slot.displayStart} - ${slot.displayEnd}`}
//                 >
//                   <div className="text-sm font-semibold">{slot.displayStart}</div>
//                   <div className="text-xs opacity-75 mt-1">to {slot.displayEnd}</div>
//                   <div className={cx(
//                     "text-xs mt-2 px-2 py-1 rounded-full inline-block",
//                     isSelected 
//                       ? "bg-white/20 text-white"
//                       : isBooked 
//                         ? "bg-red-100 text-red-600"
//                         : "bg-green-100 text-green-600"
//                   )}>
//                     {isBooked ? "BOOKED" : "AVAILABLE"}
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Booking Summary Card */}
//         <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border p-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             {/* Booking Details */}
//             <div className="space-y-2">
//               <h4 className="font-semibold text-gray-900">Booking Summary</h4>
//               <div className="space-y-1 text-sm text-gray-600">
//                 <div className="flex gap-2">
//                   <span className="font-medium">Company:</span>
//                   <span>{companyName}</span>
//                 </div>
//                 <div className="flex gap-2">
//                   <span className="font-medium">Workshop:</span>
//                   <span>{workshopTitle}</span>
//                 </div>
//                 {selectedTimeSlot !== null && timeSlots[selectedTimeSlot] && (
//                   <div className="flex gap-2">
//                     <span className="font-medium">Time Slot:</span>
//                     <span className="text-blue-600 font-medium">
//                       {timeSlots[selectedTimeSlot].displayStart} - {timeSlots[selectedTimeSlot].displayEnd}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Book Button */}
//             <div className="flex flex-col items-end gap-2">
//               <div className="text-right">
//                 <div className="text-2xl font-bold text-gray-900">₹{}</div>
//                 <div className="text-xs text-gray-500">Total Amount</div>
//               </div>
//               <button
//                 className={cx(
//                   "px-8 py-3 rounded-xl text-white text-base font-semibold border transition-all duration-200",
//                   selectedTimeSlot === null || booking
//                     ? "bg-gray-400 border-gray-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 border-transparent shadow-lg hover:shadow-xl transform hover:scale-105"
//                 )}
//                 disabled={selectedTimeSlot === null || booking}
//                 onClick={openUserDetailsPopup}
//               >
//                 {booking ? (
//                   <span className="flex items-center gap-2">
//                     <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
//                     Processing...
//                   </span>
//                 ) : (
//                   selectedTimeSlot === null ? "Select a 10-min Slot" : "Book Slot"
//                 )}
//               </button>
//               {selectedTimeSlot === null && (
//                 <p className="text-xs text-gray-500 text-center">
//                   Select a mini-slot to continue
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>

//       <footer className="sticky bottom-0 z-10 border-t bg-white/90 backdrop-blur">
//         <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between" aria-live="polite">
//           <div className="text-sm">
//             {selectedTimeSlot !== null ? (
//               <>Selected: <span className="font-semibold">1</span> • Total: <span className="font-semibold">₹ {total}</span></>
//             ) : "Select a 10-minute mini-slot to continue"}
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               className="px-4 py-2 rounded-lg border"
//               onClick={() => { setSelectedTimeSlot(null); setSelectedSeatId(null); }}
//               disabled={selectedTimeSlot===null}
//             >
//               Clear
//             </button>
//             <button
//               className="px-5 py-2 rounded-lg bg-black text-white disabled:opacity-50"
//               onClick={openUserDetailsPopup}
//               disabled={selectedTimeSlot===null || booking}
//             >
//               {booking ? "Booking…" : "Confirm Booking"}
//             </button>
//           </div>
//         </div>
//       </footer>

//       {/* User Details Popup */}
//       {showUserDetailsPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-xl font-semibold text-gray-900">Enter Your Details</h3>
//               <button 
//                 onClick={() => setShowUserDetailsPopup(false)}
//                 className="text-gray-400 hover:text-gray-600 text-2xl"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Full Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={userDetails.name}
//                   onChange={(e) => setUserDetails(prev => ({...prev, name: e.target.value}))}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                   placeholder="Enter your full name"
//                 />
//                 {userDetails.name && !isNameValid && (
//                   <p className="mt-1 text-xs text-red-600">Enter at least 2 characters.</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Mobile Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="tel"
//                   value={userDetails.mobile}
//                   onChange={(e) => setUserDetails(prev => ({...prev, mobile: e.target.value}))}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                   placeholder="Enter your mobile number"
//                 />
//                 {userDetails.mobile && !isMobileValid && (
//                   <p className="mt-1 text-xs text-red-600">Enter a 10-digit Indian mobile (starts 6–9).</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   value={userDetails.email}
//                   onChange={(e) => setUserDetails(prev => ({...prev, email: e.target.value}))}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                   placeholder="Enter your email address"
//                 />
//                 {userDetails.email && !isEmailValid && (
//                   <p className="mt-1 text-xs text-red-600">Enter a valid email (e.g., name@example.com).</p>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => setShowUserDetailsPopup(false)}
//                 className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={confirmBooking}
//                 disabled={!canSubmit}
//                 className={
//                   "flex-1 px-4 py-3 rounded-lg font-medium " +
//                   (canSubmit
//                     ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600"
//                     : "bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none")
//                 }
//               >
//                 {booking ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
//                     Processing...
//                   </span>
//                 ) : (
//                   "Submit & Book"
//                 )}
//               </button>
//             </div>

//             {error && (
//               <div className="mt-4 text-sm text-red-600">
//                 {error}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getSeats,
  resolveSlotId,
  createBookingSimple
} from "../api/client";

function cx(...a){ return a.filter(Boolean).join(" "); }
function f12(hhmm="00:00"){
  const [h,m]=(hhmm||"00:00").split(":").map(Number);
  const am=h<12?"AM":"PM";
  const h12=((h+11)%12)+1;
  return `${h12}:${String(m).padStart(2,"0")} ${am}`;
}

export default function SeatSelection() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const q = new URLSearchParams(search);

  const slotIdRaw   = q.get("slotId") || "";
  const start       = q.get("start") || "";
  const end         = q.get("end") || "";
  const basePrice   = Number(q.get("price") || 0);
  const workshopId  = q.get("workshopId") || q.get("centerId") || "c1";
  const date        = q.get("date") || new Date().toISOString().slice(0,10);
  const workshopTitle = q.get("workshopTitle") || "Workshop";
  const companyName = q.get("companyName") || "Company";

  // UI state
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // mini-slot index 0..3
  const [selectedSeatId, setSelectedSeatId] = useState(null);     // REAL seat id from API
  const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: "", mobile: "", email: "" });

  // Backend state
  const [resolvedSlotId, setResolvedSlotId] = useState(slotIdRaw);
  const [seatsRaw, setSeatsRaw] = useState([]);   // [{id,displayNo,status,price,...}] from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);

  // ---------- Validators (shared by UI + submit) ----------
  const onlyDigits   = (s) => String(s || "").replace(/[^\d]/g, "");
  const validName    = (n) => String(n || "").trim().length >= 2;
  const validMobile  = (m) => /^[6-9]\d{9}$/.test(onlyDigits(m).slice(-10)); // India 10-digit starting 6–9
  const validEmail   = (e) => /\S+@\S+\.\S+/.test(String(e || "").trim());

  const isNameValid   = validName(userDetails.name);
  const isMobileValid = validMobile(userDetails.mobile);
  const isEmailValid  = validEmail(userDetails.email);
  const canSubmit     = isNameValid && isMobileValid && isEmailValid && !booking && selectedTimeSlot !== null && !!selectedSeatId;

  // ---------- Build 4×15min mini-slots from the hour ----------
  const generateTimeSlots = () => {
    if (!start) {
      const defaultSlots = [];
      for (let i = 0; i < 4; i++) {
        const startMin = i * 15;
        const endMin = (i + 1) * 15;
        const startTime = `09:${String(startMin).padStart(2, '0')}`;
        const endTime = `09:${String(endMin).padStart(2, '0')}`;
        defaultSlots.push({
          id: i,
          startTime,
          endTime,
          displayStart: f12(startTime),
          displayEnd: f12(endTime),
        });
      }
      return defaultSlots;
    }
    const [startHour, startMin] = start.split(':').map(Number);
    const slots = [];
    for (let i = 0; i < 4; i++) {
      const slotStartMin = startMin + (i * 15);
      const slotEndMin = startMin + ((i + 1) * 15);
      const slotStartHour = startHour + Math.floor(slotStartMin / 60);
      const slotEndHour = startHour + Math.floor(slotEndMin / 60);
      const finalStartMin = slotStartMin % 60;
      const finalEndMin = slotEndMin % 60;
      const startTime = `${String(slotStartHour).padStart(2,'0')}:${String(finalStartMin).padStart(2,'0')}`;
      const endTime   = `${String(slotEndHour).padStart(2,'0')}:${String(finalEndMin).padStart(2,'0')}`;
      slots.push({
        id: i,
        startTime,
        endTime,
        displayStart: f12(startTime),
        displayEnd: f12(endTime),
      });
    }
    return slots;
  };
  const timeSlots = useMemo(generateTimeSlots, [start]);

  // ---------- Resolve slotId if missing ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      if (resolvedSlotId) return;
      if (!workshopId || !date || !start) return;
      try {
        const id = await resolveSlotId(workshopId, date, start, end || undefined);
        if (!alive) return;
        setResolvedSlotId(String(id));
      } catch {
        if (!alive) return;
        setError("Could not resolve showtime. Please go back and pick another time.");
      }
    })();
    return () => { alive = false; };
  }, [resolvedSlotId, workshopId, date, start, end]);

  // ---------- Load seats for this slot (DB truth) ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!resolvedSlotId) { setLoading(false); return; }
      try {
        setLoading(true);
        setError("");
        const data = await getSeats(resolvedSlotId);
        if (!alive) return;
        const list = Array.isArray(data?.seats) ? data.seats : [];
        setSeatsRaw(list);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load seats");
        setSeatsRaw([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [resolvedSlotId]);

  // ---------- Map mini-slot index (0..3) -> seat info from DB ----------
  const miniSeatStatus = useMemo(() => {
    const byIndex = {};
    const sorted = [...seatsRaw].sort((a, b) => {
      const ai = (a.displayNo ?? a.col_number ?? 0);
      const bi = (b.displayNo ?? b.col_number ?? 0);
      return ai - bi;
    });
    // only first 4 seats map to 4 mini-slots
    sorted.slice(0, 4).forEach((s, idx) => {
      byIndex[idx] = {
        id: Number(s.id),
        status: s.status, // "AVAILABLE" | "BOOKED"
        displayNo: s.displayNo ?? s.col_number ?? (idx + 1),
        price: s.price ?? basePrice
      };
    });
    return byIndex;
  }, [seatsRaw, basePrice]);

  // Clear selection if it becomes invalid
  useEffect(() => {
    if (selectedTimeSlot != null) {
      const info = miniSeatStatus[selectedTimeSlot];
      if (!info || info.status !== "AVAILABLE") {
        setSelectedTimeSlot(null);
        setSelectedSeatId(null);
      }
    }
  }, [miniSeatStatus, selectedTimeSlot]);

  const total = selectedTimeSlot != null
    ? (miniSeatStatus[selectedTimeSlot]?.price ?? basePrice)
    : basePrice || 0;

  function openUserDetailsPopup() {
    if (selectedTimeSlot == null || !selectedSeatId) return;
    setShowUserDetailsPopup(true);
  }

  // ---------- Submit ----------
  async function confirmBooking() {
    if (!validName(userDetails.name) || !validMobile(userDetails.mobile) || !validEmail(userDetails.email)) {
      alert('Please enter a valid name, 10-digit mobile, and email.');
      return;
    }
    if (selectedTimeSlot === null || !selectedSeatId) {
      alert('Please select a 15-minute mini-slot');
      return;
    }

    try {
      setBooking(true);
      setError("");

      const payload = {
        slotId: Number(resolvedSlotId || 0),
        name: userDetails.name.trim(),
        email: userDetails.email.trim(),
        mobile_no: userDetails.mobile.trim(),
        seats: [Number(selectedSeatId)],  // REAL seat id
        amount_paid: total,
        payment_ref: `demo_${Date.now()}`
      };

      const resp = await createBookingSimple(payload); // expects 201

      const bookingId = resp.bookingId ?? resp.id ?? `BK${Date.now()}`;
      const slot = timeSlots[selectedTimeSlot];
      const params = new URLSearchParams({
        bookingId: String(bookingId),
        companyName,
        workshopTitle,
        venue: q.get("venue") || "Medical Center, Delhi",
        date,
        startTime: slot.displayStart,
        endTime: slot.displayEnd,
        seatNumber: `${slot.displayStart}–${slot.displayEnd}`,
        amount: String(resp.total ?? resp.amount_paid ?? total),
        userName: userDetails.name.trim(),
        userMobile: userDetails.mobile.trim(),
        userEmail: userDetails.email.trim()
      }).toString();

      navigate(`/confirmation?${params}`);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Seat got taken. Please pick another mini-slot.";
      alert(msg);

      // Refresh from DB so UI shows latest BOOKED/AVAILABLE
      try {
        const data = await getSeats(resolvedSlotId);
        const list = Array.isArray(data?.seats) ? data.seats : [];
        setSeatsRaw(list);
      } catch {}
    } finally {
      setBooking(false);
      setShowUserDetailsPopup(false);
    }
  }

  function goBack(){ navigate(-1); }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading seats...</p>
      </div>
    </div>
  );
  if (error && !showUserDetailsPopup) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <button onClick={goBack} className="mr-1 rounded px-2 py-1 text-gray-700 hover:bg-gray-100" aria-label="Back">‹</button>
          <div className="h-9 w-56 rounded bg-gray-900 text-white grid place-items-center text-sm font-semibold">{companyName}</div>
          <div className="flex-1 h-9 min-w-[280px] ml-3 rounded bg-sky-200 text-gray-900 grid place-items-center text-sm font-semibold">
            {workshopTitle}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Ads Section */}
        <div className="w-full h-32 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <div className="text-white text-center">
            <h3 className="text-xl font-bold mb-2">Advertisement Space</h3>
            <p className="text-sm opacity-90">Ads will run here</p>
          </div>
        </div>

        {/* 15-minute mini-slots (DB-driven availability) */}
        <div className="rounded-xl border p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Select 15-Minute Time Slot
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {timeSlots.map((slot, i) => {
              const info = miniSeatStatus[i];            // db seat mapped to mini-slot i
              const isBooked = info && info.status !== "AVAILABLE";
              const isSelected = selectedTimeSlot === i;

              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    if (!info || info.status !== "AVAILABLE") return;
                    setSelectedTimeSlot(i);
                    setSelectedSeatId(Number(info.id)); // capture REAL seat id now
                  }}
                  disabled={isBooked}
                  className={cx(
                    "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                    isSelected 
                      ? "border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105" 
                      : isBooked
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                  )}
                  title={isBooked ? "This 15-minute slot is already booked" : `${slot.displayStart} - ${slot.displayEnd}`}
                >
                  <div className="text-sm font-semibold">{slot.displayStart}</div>
                  <div className="text-xs opacity-75 mt-1">to {slot.displayEnd}</div>
                  <div className={cx(
                    "text-xs mt-2 px-2 py-1 rounded-full inline-block",
                    isSelected 
                      ? "bg-white/20 text-white"
                      : isBooked 
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                  )}>
                    {isBooked ? "BOOKED" : "AVAILABLE"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking Summary Card */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Booking Details */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Booking Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex gap-2">
                  <span className="font-medium">Company:</span>
                  <span>{companyName}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">Workshop:</span>
                  <span>{workshopTitle}</span>
                </div>
                {selectedTimeSlot !== null && timeSlots[selectedTimeSlot] && (
                  <div className="flex gap-2">
                    <span className="font-medium">Time Slot:</span>
                    <span className="text-blue-600 font-medium">
                      {timeSlots[selectedTimeSlot].displayStart} - {timeSlots[selectedTimeSlot].displayEnd}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Book Button */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">₹{total}</div>
                <div className="text-xs text-gray-500">Total Amount</div>
              </div>
              <button
                className={cx(
                  "px-8 py-3 rounded-xl text-white text-base font-semibold border transition-all duration-200",
                  selectedTimeSlot === null || booking
                    ? "bg-gray-400 border-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 border-transparent shadow-lg hover:shadow-xl transform hover:scale-105"
                )}
                disabled={selectedTimeSlot === null || booking}
                onClick={openUserDetailsPopup}
              >
                {booking ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </span>
                ) : (
                  selectedTimeSlot === null ? "Select a 15-min Slot" : "Book Slot"
                )}
              </button>
              {selectedTimeSlot === null && (
                <p className="text-xs text-gray-500 text-center">
                  Select a mini-slot to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 border-t bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between" aria-live="polite">
          <div className="text-sm">
            {selectedTimeSlot !== null ? (
              <>Selected: <span className="font-semibold">1</span> • Total: <span className="font-semibold">₹ {total}</span></>
            ) : "Select a 15-minute mini-slot to continue"}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-lg border"
              onClick={() => { setSelectedTimeSlot(null); setSelectedSeatId(null); }}
              disabled={selectedTimeSlot===null}
            >
              Clear
            </button>
            <button
              className="px-5 py-2 rounded-lg bg-black text-white disabled:opacity-50"
              onClick={openUserDetailsPopup}
              disabled={selectedTimeSlot===null || booking}
            >
              {booking ? "Booking…" : "Confirm Booking"}
            </button>
          </div>
        </div>
      </footer>

      {/* User Details Popup */}
      {showUserDetailsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Enter Your Details</h3>
              <button 
                onClick={() => setShowUserDetailsPopup(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userDetails.name}
                  onChange={(e) => setUserDetails(prev => ({...prev, name: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your full name"
                />
                {userDetails.name && !isNameValid && (
                  <p className="mt-1 text-xs text-red-600">Enter at least 2 characters.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={userDetails.mobile}
                  onChange={(e) => setUserDetails(prev => ({...prev, mobile: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your mobile number"
                />
                {userDetails.mobile && !isMobileValid && (
                  <p className="mt-1 text-xs text-red-600">Enter a 10-digit Indian mobile (starts 6–9).</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={userDetails.email}
                  onChange={(e) => setUserDetails(prev => ({...prev, email: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your email address"
                />
                {userDetails.email && !isEmailValid && (
                  <p className="mt-1 text-xs text-red-600">Enter a valid email (e.g., name@example.com).</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUserDetailsPopup(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBooking}
                disabled={!canSubmit}
                className={
                  "flex-1 px-4 py-3 rounded-lg font-medium " +
                  (canSubmit
                    ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none")
                }
              >
                {booking ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </span>
                ) : (
                  "Submit & Book"
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
