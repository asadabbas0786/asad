
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePills from "../components/DatePills.jsx";
import { getSlots } from "../api/client";
import amniocentesisImg from "../assets/WorkshopImages/amniocentesis.jpg";
import amnioCvsImg from "../assets/WorkshopImages/amniocvs.jpeg";
import bullEyeImg from "../assets/WorkshopImages/bullEye.png";
import ultrasoundSimulatorImg from "../assets/WorkshopImages/ultrasoundsimulatorvintek.jpg";
import laproscopicSimulatorImg from "../assets/WorkshopImages/vintekworkshop1.jpg";

function cx(...a){ return a.filter(Boolean).join(" "); }
function f12(hhmm="00:00"){
  const [h,m]=(hhmm||"00:00").split(":").map(Number);
  const am=h<12?"AM":"PM";
  const h12=((h+11)%12)+1;
  return `${h12}:${String(m).padStart(2,"0")} ${am}`;
}
const DAY = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function toLocalISO(d = new Date()){
  const tz = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tz * 60_000);
  return local.toISOString().slice(0,10);
}
function addDaysISO(iso, d){
  const [y,m,dd] = iso.split("-").map(Number);
  const base = new Date(y, (m-1), dd);
  base.setDate(base.getDate() + d);
  return toLocalISO(base);
}
function dateOptionsAround(iso){
  return Array.from({ length: 7 }).map((_, i) => {
    const d = addDaysISO(iso, i - 3);
    const obj = new Date(d + "T00:00:00");
    return { iso:d, day:DAY[obj.getDay()], dateNum:obj.getDate() };
  });
}

function isPastSlot(dateISO, startTime, endTime){
  const [y,m,d] = dateISO.split("-").map(Number);
  const [endHh, endMm] = (endTime||"00:00").split(":").map(Number);
  const slotEndDateTime = new Date(y, (m-1), d, endHh, endMm, 0, 0);
  const now = new Date();
  return slotEndDateTime.getTime() < now.getTime();
}


// Company data with workshops
// const companyData = {
//   "1": { 
//     title: "One Simulation",
//     workshops: [
//       { id: 1, name: "Amniocentesis", color: "bg-blue-500", image: amniocentesisImg, venue: "Medical Center, Delhi", centerId: "c1" },
//       { id: 2, name: "Amnio CVS", color: "bg-green-500", image: amnioCvsImg, venue: "Healthcare Hub, Mumbai", centerId: "c2" },
//       { id: 3, name: "Bull", color: "bg-purple-500", image: null, venue: "Training Center, Bangalore", centerId: "c3" },
//       { id: 4, name: "Bull's Eye (Hit the target)", color: "bg-orange-500", image: bullEyeImg, venue: "Medical Institute, Chennai", centerId: "c4" },
//       { id: 5, name: "Scar Ectopic Injection", color: "bg-pink-500", image: null, venue: "Medical Training Hub, Pune", centerId: "c5" },
//       { id: 6, name: "Sonosalpingography", color: "bg-cyan-500", image: null, venue: "Diagnostic Center, Hyderabad", centerId: "c6" },
//       { id: 7, name: "Fibroid Ablation", color: "bg-red-500", image: null, venue: "Surgical Training Center, Kolkata", centerId: "c7" }
//     ]
//   },
//   "2": { 
//     title: "Vintek Medical Corporation",
//     workshops: [
//       { id: 1, name: "Laproscopic Simulator", color: "bg-red-500", image: laproscopicSimulatorImg, venue: "Medical Training Center, Delhi", centerId: "c8" },
//       { id: 2, name: "Robotics Simulator", color: "bg-yellow-500", venue: "Healthcare Hub, Mumbai", centerId: "c9" },
//       { id: 3, name: "Ultrasound Simulator", color: "bg-green-500", image: ultrasoundSimulatorImg, venue: "Advanced Institute, Bangalore", centerId: "c10"  }
//     ]
//   },
//   "3": { 
//     title: "GE",
//     workshops: [
//       { id: 1, name: "Ultrasound Simulator", color: "bg-indigo-500", image: ultrasoundSimulatorImg, venue: "GE Healthcare Center, Delhi" }
//     ]
//   },
//   "4": { 
//     title: "DSS",
//     workshops: [
//       { id: 1, name: "Ultrasound Simulator", color: "bg-indigo-500", image: ultrasoundSimulatorImg, venue: "DSS Training Center, Delhi" }
//     ]
//   },
//   "5": { 
//     title: "LAerdal",
//     workshops: [
//       { id: 1, name: "SimMoM", color: "bg-teal-500", image: null, venue: "Laerdal Training Center, Delhi" },
//       { id: 2, name: "Prompt flex", color: "bg-blue-500", image: null, venue: "Laerdal Medical Hub, Mumbai" },
//       { id: 3, name: "RA Adv Skill Trainer", color: "bg-purple-500", image: null, venue: "Laerdal Institute, Bangalore" },
//       { id: 4, name: "RA Simulator", color: "bg-green-500", image: null, venue: "Laerdal Academy, Chennai" },
//       { id: 5, name: "Simman", color: "bg-orange-500", image: null, venue: "Laerdal Center, Pune" },
//       { id: 6, name: "Megacode Kelly", color: "bg-pink-500", image: null, venue: "Laerdal Emergency Center, Hyderabad" },
//       { id: 7, name: "Clinical Female Pelvic Examination Trainer", color: "bg-indigo-500", image: null, venue: "Laerdal Medical Training, Kolkata" }
//     ]
//   },
//   "6": { 
//     title: "J&J",
//     workshops: [
//       { id: 1, name: "Endotrainers", color: "bg-cyan-500", image: null, venue: "J&J Medical Training Center, Delhi" }
//     ]
//   },
//   "7": { 
//     title: "CRTC - AIIMS",
//     workshops: [
//       { id: 1, name: "BLS", color: "bg-red-500", image: null, venue: "CRTC - AIIMS, New Delhi" }
//     ]
//   }
// };


//ASAD
const companyData = {
  "1": { 
    title: "One Simulation",
    workshops: [
      { id: 1, name: "Amniocentesis", color: "bg-blue-500", image: amniocentesisImg, venue: "Medical Center, Delhi", centerId: "c1" },
      { id: 2, name: "Amnio CVS", color: "bg-green-500", image: amnioCvsImg, venue: "Healthcare Hub, Mumbai", centerId: "c2" },
      { id: 3, name: "Bull", color: "bg-purple-500", image: null, venue: "Training Center, Bangalore", centerId: "c3" },
      { id: 4, name: "Bull's Eye (Hit the target)", color: "bg-orange-500", image: bullEyeImg, venue: "Medical Institute, Chennai", centerId: "c4" },
      { id: 5, name: "Scar Ectopic Injection", color: "bg-pink-500", image: null, venue: "Medical Training Hub, Pune", centerId: "c5" },
      { id: 6, name: "Sonosalpingography", color: "bg-cyan-500", image: null, venue: "Diagnostic Center, Hyderabad", centerId: "c6" },
      { id: 7, name: "Fibroid Ablation", color: "bg-red-500", image: null, venue: "Surgical Training Center, Kolkata", centerId: "c7" }
    ]
  },

  "2": { 
    title: "Vintek Medical Corporation",
    workshops: [
      { id: 1, name: "Laproscopic Simulator", color: "bg-red-500", image: laproscopicSimulatorImg, venue: "Medical Training Center, Delhi", centerId: "c8" },
      { id: 2, name: "Robotics Simulator", color: "bg-yellow-500", venue: "Healthcare Hub, Mumbai", centerId: "c9" },
      { id: 3, name: "Ultrasound Simulator", color: "bg-green-500", image: ultrasoundSimulatorImg, venue: "Advanced Institute, Bangalore", centerId: "c10"  }
    ]
  },

  "3": { 
    title: "GE",
    workshops: [
      { id: 1, name: "Ultrasound Simulator", color: "bg-indigo-500", image: ultrasoundSimulatorImg, venue: "GE Healthcare Center, Delhi", centerId: "c11" }
    ]
  },

  "4": { 
    title: "DSS",
    workshops: [
      { id: 1, name: "Ultrasound Simulator", color: "bg-indigo-500", image: ultrasoundSimulatorImg, venue: "DSS Training Center, Delhi", centerId: "c12" }
    ]
  },

  "5": { 
    title: "LAerdal",
    workshops: [
      { id: 1, name: "SimMoM", color: "bg-teal-500", image: null, venue: "Laerdal Training Center, Delhi", centerId: "c13" },
      { id: 2, name: "Prompt flex", color: "bg-blue-500", image: null, venue: "Laerdal Medical Hub, Mumbai", centerId: "c14" },
      { id: 3, name: "RA Adv Skill Trainer", color: "bg-purple-500", image: null, venue: "Laerdal Institute, Bangalore", centerId: "c15" },
      { id: 4, name: "RA Simulator", color: "bg-green-500", image: null, venue: "Laerdal Academy, Chennai", centerId: "c16" },
      { id: 5, name: "Simman", color: "bg-orange-500", image: null, venue: "Laerdal Center, Pune", centerId: "c17" },
      { id: 6, name: "Megacode Kelly", color: "bg-pink-500", image: null, venue: "Laerdal Emergency Center, Hyderabad", centerId: "c18" },
      { id: 7, name: "Clinical Female Pelvic Examination Trainer", color: "bg-indigo-500", image: null, venue: "Laerdal Medical Training, Kolkata", centerId: "c19" }
    ]
  },

  "6": { 
    title: "J&J",
    workshops: [
      { id: 1, name: "Endotrainers", color: "bg-cyan-500", image: null, venue: "J&J Medical Training Center, Delhi", centerId: "c20" }
    ]
  },

  "7": { 
    title: "CRTC - AIIMS",
    workshops: [
      { id: 1, name: "BLS", color: "bg-red-500", image: null, venue: "CRTC - AIIMS, New Delhi", centerId: "c21" }
    ]
  }
};




// Map your centers → nice titles (now includes c4-c7)
// const CENTERS = [
//   { id: "c1", title: "Amniocentesis", color: "bg-blue-500", venue: "Medical Center, Delhi" },
//   { id: "c2", title: "Amnio CVS", color: "bg-green-500", venue: "Healthcare Hub, Mumbai" },
//   { id: "c3", title: "Bull", color: "bg-purple-500", venue: "Training Center, Bangalore" },
//   { id: "c4", title: "Bull's Eye (Hit the target)", color: "bg-orange-500", venue: "Medical Institute, Chennai" },
//   { id: "c5", title: "Scar Ectopic Injection", color: "bg-pink-500", venue: "Medical Training Hub, Pune" },
//   { id: "c6", title: "Sonosalpingography", color: "bg-cyan-500", venue: "Diagnostic Center, Hyderabad" },
//   { id: "c7", title: "Fibroid Ablation", color: "bg-red-500", venue: "Surgical Training Center, Kolkata" },

//   // ✅ Correct entries for Vintek Medical Corporation
//   { id: "c8", title: "Laproscopic Simulator", color: "bg-red-500", venue: "Medical Training Center, Delhi" },
//   { id: "c9", title: "Robotics Simulator", color: "bg-yellow-500", venue: "Healthcare Hub, Mumbai" },
//   { id: "c10", title: "Ultrasound Simulator", color: "bg-green-500", venue: "Advanced Institute, Bangalore" },
// ];
//Asad
const CENTERS = [
  // 🩺 One Simulation
  { id: "c1",  title: "Amniocentesis",                       color: "bg-blue-500",   venue: "Medical Center, Delhi" },
  { id: "c2",  title: "Amnio CVS",                           color: "bg-green-500",  venue: "Healthcare Hub, Mumbai" },
  { id: "c3",  title: "Bull",                                color: "bg-purple-500", venue: "Training Center, Bangalore" },
  { id: "c4",  title: "Bull's Eye (Hit the target)",          color: "bg-orange-500", venue: "Medical Institute, Chennai" },
  { id: "c5",  title: "Scar Ectopic Injection",               color: "bg-pink-500",   venue: "Medical Training Hub, Pune" },
  { id: "c6",  title: "Sonosalpingography",                   color: "bg-cyan-500",   venue: "Diagnostic Center, Hyderabad" },
  { id: "c7",  title: "Fibroid Ablation",                     color: "bg-red-500",    venue: "Surgical Training Center, Kolkata" },

  // 🏥 Vintek Medical Corporation
  { id: "c8",  title: "Laproscopic Simulator",                color: "bg-red-500",    venue: "Medical Training Center, Delhi" },
  { id: "c9",  title: "Robotics Simulator",                   color: "bg-yellow-500", venue: "Healthcare Hub, Mumbai" },
  { id: "c10", title: "Ultrasound Simulator",                 color: "bg-green-500",  venue: "Advanced Institute, Bangalore" },

  // ⚙️ GE
  { id: "c11", title: "Ultrasound Simulator",                 color: "bg-indigo-500", venue: "GE Healthcare Center, Delhi" },

  // 🧬 DSS
  { id: "c12", title: "Ultrasound Simulator",                 color: "bg-indigo-500", venue: "DSS Training Center, Delhi" },

  // 🧡 Laerdal
  { id: "c13", title: "SimMoM",                               color: "bg-teal-500",   venue: "Laerdal Training Center, Delhi" },
  { id: "c14", title: "Prompt flex",                          color: "bg-blue-500",   venue: "Laerdal Medical Hub, Mumbai" },
  { id: "c15", title: "RA Adv Skill Trainer",                 color: "bg-purple-500", venue: "Laerdal Institute, Bangalore" },
  { id: "c16", title: "RA Simulator",                         color: "bg-green-500",  venue: "Laerdal Academy, Chennai" },
  { id: "c17", title: "Simman",                               color: "bg-orange-500", venue: "Laerdal Center, Pune" },
  { id: "c18", title: "Megacode Kelly",                       color: "bg-pink-500",   venue: "Laerdal Emergency Center, Hyderabad" },
  { id: "c19", title: "Clinical Female Pelvic Examination Trainer", color: "bg-indigo-500", venue: "Laerdal Medical Training, Kolkata" },

  // 🧪 J&J
  { id: "c20", title: "Endotrainers",                         color: "bg-cyan-500",   venue: "J&J Medical Training Center, Delhi" },

  // 🏫 CRTC - AIIMS
  { id: "c21", title: "BLS",                                  color: "bg-red-500",    venue: "CRTC - AIIMS, New Delhi" }
];


export default function WorkshopSlots(){
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const date = params.get("date") || toLocalISO(new Date());
  const movieId = params.get("movieId") || "1";
  const [data, setData] = useState({}); // { c1:[...], c2:[...], ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHurryUp, setShowHurryUp] = useState(false);

  const companyName = companyData[movieId]?.title || "Workshop";
  const companyWorkshops = companyData[movieId]?.workshops || [];

  const dates = useMemo(() => dateOptionsAround(date), [date]);

  // Show hurry up popup after 5-7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHurryUp(true);
    }, Math.random() * 2000 + 5000); // Random between 5-7 seconds

    return () => clearTimeout(timer);
  }, []);

  // Remove auto hide - popup will only hide on dismiss click

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const perCenter = {};
        for (const c of CENTERS) {
          try {
            const res = await getSlots(c.id, date);
            perCenter[c.id] = Array.isArray(res?.slots) ? res.slots : [];
          } catch {
            perCenter[c.id] = [];
          }
        }
        if (!alive) return;
        setData(perCenter);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load showtimes");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [date]);

  function gotoDate(iso){
    const next = new URLSearchParams(params);
    next.set("date", iso);
    setParams(next, { replace:true });
  }

  function goBack(){ 
    navigate(-1); 
  }

  function openSeats(slot, workshop){
    // All times are clickable; we pass backend slot.id to SeatSelection
    const q = new URLSearchParams({
      slotId: String(slot.id),
      start: String(slot.start ?? ""),
      end: String(slot.end ?? ""),
      price: String(slot.price ?? ""),
      date,
      workshopId: String(workshop.centerId ?? ""),
      workshopTitle: String(workshop.title ?? workshop.name ?? companyName),
      companyName: String(companyName),
      movieId: String(movieId),
    }).toString();
    navigate(`/select-seats?${q}`);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hurry Up Popup */}
      {showHurryUp && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 md:p-4 max-w-xs mx-auto sm:mx-0">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Hurry Up!</h4>
                <p className="text-xs text-gray-600 mb-2">
                  Seats are filling up fast. Book now!
                </p>
                <button
                  onClick={() => setShowHurryUp(false)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Dismiss
                </button>
              </div>
              
              <button
                onClick={() => setShowHurryUp(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-2 sm:px-4 py-3">
          {/* Mobile: Stacked layout */}
          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex items-center gap-2">
              <button onClick={goBack} className="rounded p-2 text-gray-700 hover:bg-gray-100" aria-label="Back">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1 h-10 rounded bg-gray-900 text-white grid place-items-center px-3">
                <span className="font-semibold text-sm truncate">{companyName}</span>
              </div>
            </div>
            <div className="h-10 rounded bg-cyan-800 text-white grid place-items-center px-3">
              <span className="text-xs sm:text-sm font-semibold text-center">Date and time selection for workshop</span>
            </div>
          </div>

          {/* Desktop: Horizontal layout */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={goBack} className="mr-1 rounded px-2 py-1 text-gray-700 hover:bg-gray-100" aria-label="Back">‹</button>
            <div className="h-10 w-56 rounded bg-gray-900 text-white grid place-items-center">
              <span className="font-semibold">{companyName}</span>
            </div>
            <div className="flex-1 h-10 min-w-[280px] ml-3 rounded bg-cyan-800 text-white grid place-items-center text-sm font-semibold">
              Date and time selection for workshop 
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-2 sm:px-4 pb-4">
          <DatePills options={dates} activeISO={date} onChange={gotoDate} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-2 sm:px-4 py-3 md:py-5">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3 md:space-y-4">
            {Array.from({ length: 4 }).map((_,i)=>(
              <div key={i} className="rounded-xl border border-gray-200 p-3 md:p-4 flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="h-28 w-full sm:w-56 rounded-xl bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap gap-2 md:gap-3">
                    {Array.from({ length: 10 }).map((_,j)=>(
                      <div key={j} className="h-8 sm:h-10 w-24 sm:w-28 rounded-lg bg-gray-200 animate-pulse" />
                    ))}
                  </div>
                  <div className="h-3 w-44 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {companyWorkshops.map(workshop => {
              // Find corresponding CENTERS data for backend slots
              const center = CENTERS.find(c => c.title === workshop.name);
              const slots = center ? (data[center.id] || []) : [];
              
              return (
                <section key={workshop.id} className="mb-3 md:mb-4 rounded-xl border border-gray-200">
                  <div className="p-3 md:p-4 flex flex-col sm:flex-row gap-3 md:gap-4">
                    {/* Left workshop card with image placeholder */}
                    <div className="shrink-0 w-full sm:w-56 rounded-xl h-28 overflow-hidden bg-gray-100 border">
                      {/* Image section */}
                      <div className="w-full h-16 relative">
                        {workshop.image ? (
                          <img 
                            src={workshop.image} 
                            alt={workshop.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={cx(
                            "w-full h-full grid place-items-center text-white text-xs font-medium",
                            workshop.color
                          )}>
                            Workshop Image
                          </div>
                        )}
                      </div>
                      
                      {/* Workshop details */}
                      <div className="px-3 py-1">
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
                          {workshop.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                          {workshop.venue || "Medical Center, Delhi"}
                        </div>
                      </div>
                    </div>

                    {/* Time chips */}
                    <div className="flex-1">
                      {slots.length ? (
                        <div className="flex flex-wrap gap-2">
                          {slots
                            .filter((slot) => {
                              // Filter out times after 6:00 PM (18:00)
                              const [startHour] = (slot.start || "00:00").split(":").map(Number);
                              const isAfter6PM = startHour >= 18;
                              
                              return !isAfter6PM; // Only show times before 6:00 PM (show all past slots too)
                            })
                            .map((slot) => {
                              // Check if slot is in the past (based on end time)
                              const isPastTimeSlot = isPastSlot(date, slot.start, slot.end);
                              
                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={isPastTimeSlot ? undefined : () => openSeats(slot, {...workshop, centerId: center?.id, title: workshop.name})}
                                  disabled={isPastTimeSlot}
                                  className={cx(
                                    "relative rounded-lg border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition",
                                    isPastTimeSlot 
                                      ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                                      : "hover:shadow-sm focus-visible:ring-2 focus-visible:ring-black bg-white border-emerald-600"
                                  )}
                                  title={isPastTimeSlot ? "This time slot has passed" : "Select this time"}
                                >
                                  <div className="leading-none">
                                    {f12(slot.start)} – {f12(slot.end)}
                                  </div>
                                </button>
                              );
                            })}
                          {/* Commented out times after 6:00 PM - can be uncommented later */}
                          {/* {slots
                            .filter((slot) => {
                              const [startHour] = (slot.start || "00:00").split(":").map(Number);
                              return startHour >= 18; // Times after 6:00 PM
                            })
                            .map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => openSeats(slot, {...workshop, centerId: center?.id, title: workshop.name})}
                              className={cx(
                                "relative rounded-lg border px-4 py-2 text-sm font-medium transition",
                                "hover:shadow-sm focus-visible:ring-2 focus-visible:ring-black",
                                "bg-white border-emerald-600"
                              )}
                              title="Select this time"
                            >
                              <div className="leading-none">
                                {f12(slot.start)} – {f12(slot.end)}
                              </div>
                            </button>
                          ))} */}
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm text-gray-600 py-2 sm:py-3">No showtimes on this date.</div>
                      )}

                      {/* <div className="mt-2 text-xs text-gray-500">
                        Cancellation available
                      </div> */}
                    </div>
                  </div>
                </section>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}
