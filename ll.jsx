
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

import amniocentesisImg from '../assets/WorkshopImages/amniocentesis.jpg';
import amnioCvsImg from '../assets/WorkshopImages/amniocvs.jpeg';
import bullEyeImg from '../assets/WorkshopImages/BullsEyeNew.webp';
import ultrasoundSimulatorImg from '../assets/WorkshopImages/ultrasoundsimulatorvintek.jpg';
import laproscopicSimulatorImg from '../assets/WorkshopImages/vintekworkshop1.jpg';
import hysteroscopeImg from '../assets/WorkshopImages/Hysteroscope.png';
import endotrainersImg from '../assets/WorkshopImages/Endotrainers.jpg';
import pphImg from '../assets/WorkshopImages/PPH___.jpg';
import fetalDistressCaesareanImg from '../assets/WorkshopImages/FetalDistress_CaesareanDelivery.jpg';
import colposcopeImg from '../assets/WorkshopImages/Colposcope.jpg';
import usgSimulatorImg from '../assets/WorkshopImages/USG Simulator.png';

// Company Logos
import oneSimLogo from '../assets/Comapny-Logos/One-Sim-Logo.png';
import vintekLogo from '../assets/Comapny-Logos/Vintek Logo.png';
import geLogo from '../assets/Comapny-Logos/GE Logo.jpg';
import storzLogo from '../assets/Comapny-Logos/Storz Logo.jpg';
import laerdalLogo from '../assets/Comapny-Logos/Laerdal Logo.jpg';
import vishalLogo from '../assets/Comapny-Logos/Vishal Logo.jpg';

// Use Vite env var for API base, fallback to localhost:4000
const API_BASE = import.meta.env.VITE_API_URL;

const Home = () => {
  const navigate = useNavigate();

  // Auto-scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Companies - same as before (sorted)
  const companies = useMemo(() => ([
    {
      id: 1,
      title: "One Simulation",
      category: "Healthcare Simulation Company",
      image: null,
      fallbackBg: "bg-gradient-to-br from-blue-400 to-cyan-300",
      logo: oneSimLogo,
      workshops: [
        "Amniocentesis",
        "CVS",
        "Bull's Eye (Hit the target)",
        "Scar Ectopic Injection",
        "Sonosalpingography",
        "Fibroid Ablation",
        "Intrauterine Transfusion",
        "Radiofrequency Ablation",
        "Hysteroscope"
      ]
    },
    {
      id: 2,
      title: "Vintek Medical Corporation",
      category: "Healthcare",
      rating: "4.5",
      image: null,
      fallbackBg: "bg-gradient-to-br from-green-200 to-emerald-100",
      logo: vintekLogo,
      workshops: [
        "Laproscopic Simulator",
        "Robotics Simulator",
        "Ultrasound Simulator",
        "Lapsim",
        "Amniocentasis"
      ]
    },
    {
      id: 3,
      title: "GE",
      category: "Healthcare Technology",
      rating: "4.2",
      image: null,
      fallbackBg: "bg-green-400",
      logo: geLogo,
      workshops: [
        "Ultrasound Simulator"
      ]
    },
    {
      id: 4,
      title: "DSS",
      category: "Healthcare Simulation",
      rating: "4.7",
      image: null,
      fallbackBg: "bg-purple-400",
      logo: null,
      workshops: [
        "Ultrasound Simulator",
        "Twin Birthing"
      ]
    },
    {
      id: 5,
      title: "LAerdal",
      category: "Medical Training",
      rating: "4.8",
      image: null,
      fallbackBg: "bg-yellow-400",
      logo: laerdalLogo,
      workshops: [
        "SimMoM",
        "Prompt flex",
        "RA Adv Skill Trainer",
        "RA Simulator",
        "Simman",
        "Megacode Kelly",
        "Clinical Female Pelvic Examination Trainer",
        "PPH",
        "Shoulder Dystocia",
        "Eclampsia",
        "Amniotic fluid embolism",
        "Postpartum Collapse",
        "Fetal Distress",
        "Caesarean Delivery"
      ]
    },
    {
      id: 6,
      title: "J&J",
      category: "Healthcare Products",
      rating: "4.6",
      image: null,
      fallbackBg: "bg-red-400",
      logo: null,
      workshops: [
        "Endotrainers"
      ]
    },
    {
      id: 7,
      title: "AIIMS",
      category: "Resuscitation Training & Emergency Care",
      rating: "4.9",
      image: null,
      fallbackBg: "bg-indigo-400",
      logo: null,
      workshops: [
        "BLS"
      ]
    },
    {
      id: 8,
      title: "Karl Storz",
      category: "Endoscopy & Surgical Equipment",
      rating: "4.7",
      image: null,
      fallbackBg: "bg-teal-400",
      logo: storzLogo,
      workshops: [
        "Hysteroscope"
      ]
    },
    {
      id: 9,
      title: "Borze",
      category: "Medical Equipment & Training",
      rating: "4.6",
      image: null,
      fallbackBg: "bg-pink-400",
      logo: null,
      workshops: [
        "Hysteroscope",
        "Colposcope"
      ]
    },
    
  ].sort((a, b) => b.title.localeCompare(a.title))), [oneSimLogo, vintekLogo, geLogo, storzLogo, laerdalLogo, vishalLogo]);

  // Local helper for today's date in YYYY-MM-DD
  const todayLocalString = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // ---------- Top workshops: fetch from backend ----------
  const [workshops, setWorkshops] = useState([]);      // items to display in the grid
  const [sameDayWorkshops, setSameDayWorkshops] = useState([]); // if any for today
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);
  const [workshopsError, setWorkshopsError] = useState(null);


// useEffect(() => {
//   const ac = new AbortController();
//   setLoadingWorkshops(true);
//   setWorkshopsError(null);

//   const fetchWorkshops = async () => {
//     try {
//       console.log("🔍 Fetching same-day workshops...");

//       // 1️⃣ Try same-day available workshops
//       const res = await fetch(
//         `${API_BASE}/api/workshops/sameday?date=${todayLocalString}&available=true&limit=5`,
//         {
//           method: 'GET',
//           headers: { Accept: 'application/json' },
//           signal: ac.signal
//         }
//       );

//       console.log("✅ Same-day response status:", res.status);

//       if (!res.ok) throw new Error(`sameday status ${res.status}`);

//       const data = await res.json();
//       console.log("📦 Same-day data received:", JSON.stringify(data, null, 2));

//       if (Array.isArray(data) && data.length > 0) {
//         setSameDayWorkshops(data);
//         setWorkshops(data);
//         setLoadingWorkshops(false);
//         console.log("✅ Loaded same-day workshops:", data);
//         return;
//       }

//       // 2️⃣ Fallback → fetch top overall
//       console.log("⚠️ No same-day workshops found, fetching top overall...");
//       const res2 = await fetch(`${API_BASE}/api/workshops/top?limit=5`, {
//         method: 'GET',
//         headers: { Accept: 'application/json' },
//         signal: ac.signal
//       });

//       console.log("✅ Top response status:", res2.status);
//       if (!res2.ok) throw new Error(`top status ${res2.status}`);

//       const topData = await res2.json();
//       console.log("📦 Top workshops data:", JSON.stringify(topData, null, 2));

//       setSameDayWorkshops([]);
//       setWorkshops(Array.isArray(topData) ? topData : []);
//       setLoadingWorkshops(false);

//       console.log("ℹ️ Fallback data used:", topData);
//     } catch (err) {
//       if (ac.signal.aborted) return;
//       console.error("❌ Workshops fetch error:", err);
//       setWorkshopsError(err.message || 'Failed to load workshops');
//       setLoadingWorkshops(false);
//     }
//   };

//   fetchWorkshops();
//   return () => ac.abort();
// }, [todayLocalString]);





  // ---------- Static fallback topWorkshops (kept for reference; not used if backend returns) ----------
  

  useEffect(() => {
  const ac = new AbortController();
  setLoadingWorkshops(true);
  setWorkshopsError(null);

  const fetchWorkshops = async () => {
    try {
      console.log("🔍 Fetching same-day workshops...");
      console.log("API_BASE ->", API_BASE);

      // 1️⃣ Try same-day available workshops
      const res = await fetch(
        `${API_BASE}/api/workshops/sameday?date=${todayLocalString}&available=true&limit=5`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: ac.signal
        }
      );

      console.log("✅ Same-day response status:", res.status);
      // check content type before json()
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // grab raw text so we can inspect HTML / error page
        const text = await res.text();
        throw new Error(`Expected JSON but got ${contentType || 'unknown'}: ${text.slice(0, 200)}${text.length > 200 ? '…' : ''}`);
      }

      if (!res.ok) throw new Error(`sameday status ${res.status}`);

      const data = await res.json();
      console.log("📦 Same-day data received:", JSON.stringify(data, null, 2));

      if (ac.signal.aborted) return;

      if (Array.isArray(data) && data.length > 0) {
        setSameDayWorkshops(data);
        setWorkshops(data);
        setLoadingWorkshops(false);
        console.log("✅ Loaded same-day workshops:", data);
        return;
      }

      // 2️⃣ Fallback → fetch top overall
      console.log("⚠️ No same-day workshops found, fetching top overall...");
      const res2 = await fetch(`${API_BASE}/api/workshops/top?limit=5`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: ac.signal
      });

      console.log("✅ Top response status:", res2.status);
      const contentType2 = res2.headers.get('content-type') || '';
      if (!contentType2.includes('application/json')) {
        const text = await res2.text();
        throw new Error(`Expected JSON but got ${contentType2 || 'unknown'}: ${text.slice(0,200)}${text.length > 200 ? '…' : ''}`);
      }

      if (!res2.ok) throw new Error(`top status ${res2.status}`);

      const topData = await res2.json();
      console.log("📦 Top workshops data:", JSON.stringify(topData, null, 2));

      if (ac.signal.aborted) return;

      setSameDayWorkshops([]);
      setWorkshops(Array.isArray(topData) ? topData : []);
      setLoadingWorkshops(false);

      console.log("ℹ️ Fallback data used:", topData);
    } catch (err) {
      if (err.name === 'AbortError' || ac.signal.aborted) return;
      console.error("❌ Workshops fetch error:", err);
      setWorkshopsError(err.message || 'Failed to load workshops');
      setLoadingWorkshops(false);
    }
  };

  fetchWorkshops();
  return () => ac.abort();
}, [todayLocalString]);

  
  
  const staticTopWorkshops = useMemo(() => ([
    {
      id: 1,
      name: "Amniocentesis",
      company: "One Simulation",
      companyId: 1,
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
      image: amniocentesisImg
    },
    {
      id: 2,
      name: "Ultrasound Simulator",
      company: "Vintek Medical Corporation",
      companyId: 2,
      color: "bg-gradient-to-br from-green-500 to-green-700",
      image: usgSimulatorImg
    },
    {
      id: 3,
      name: "CVS",
      company: "One Simulation",
      companyId: 1,
      color: "bg-gradient-to-br from-green-500 to-green-700",
      image: amnioCvsImg
    },
    {
      id: 4,
      name: "Bull's Eye (Hit the target)",
      company: "One Simulation",
      companyId: 1,
      color: "bg-gradient-to-br from-purple-500 to-purple-700",
      image: bullEyeImg
    },
    {
      id: 5,
      name: "Laproscopic Simulator",
      company: "Vintek Medical Corporation",
      companyId: 2,
      color: "bg-gradient-to-br from-orange-500 to-orange-700",
      image: laproscopicSimulatorImg
    },
    {
      id: 6,
      name: "Hysteroscope",
      company: "One Simulation",
      companyId: 1,
      color: "bg-gradient-to-br from-amber-500 to-amber-700",
      image: hysteroscopeImg
    },
    {
      id: 7,
      name: "PPH",
      company: "LAerdal",
      companyId: 5,
      color: "bg-gradient-to-br from-red-500 to-red-700",
      image: pphImg
    },
    {
      id: 8,
      name: "Endotrainers",
      company: "J&J",
      companyId: 6,
      color: "bg-gradient-to-br from-cyan-500 to-cyan-700",
      image: endotrainersImg
    }
  ]), []);

  // Map workshop.id -> company id per your rules
const mapWorkshopToCompany = useCallback((workshopId) => {
  if (workshopId >= 1 && workshopId <= 6) return 1;     // One Simulation (c1-c6)
  if (workshopId >= 7 && workshopId <= 9) return 2;     // Vintek (c7-c9)
  if (workshopId === 10) return 3;                      // GE (c10)
  if (workshopId === 11) return 4;                      // DSS (c11)
  if (workshopId >= 12 && workshopId <= 18) return 5;  // Laerdal (c12-c18)
  if (workshopId === 19) return 6;                      // J&J (c19)
  if (workshopId === 20) return 7;                      // AIIMS (c20)
  if (workshopId === 21) return 5;                      // Laerdal - PPH (c21)
  if (workshopId === 22) return 5;                      // Laerdal - Shoulder Dystocia (c22)
  if (workshopId === 23) return 5;                      // Laerdal - Eclampsia (c23)
  if (workshopId === 24) return 5;                      // Laerdal - Amniotic fluid embolism (c24)
  if (workshopId === 25) return 5;                      // Laerdal - Postpartum Collapse (c25)
  if (workshopId === 26) return 5;                      // Laerdal - Fetal Distress (c26)
  if (workshopId === 27) return 5;                      // Laerdal - Caesarean Delivery (c27)
  if (workshopId === 28) return 4;                      // DSS - Twin Birthing (c28)
  if (workshopId === 29) return 2;                      // Vintek - Lapsim (c29)
  if (workshopId === 30) return 2;                      // Vintek - Amniocentasis (c30)
  if (workshopId === 31) return 1;                      // One Simulation - Intrauterine Transfusion (c31)
  if (workshopId === 32) return 1;                      // One Simulation - Radiofrequency Ablation (c32)
  if (workshopId === 33) return 1;                      // One Simulation - Hysteroscope (c33)
  if (workshopId === 34) return 8;                      // Karl Storz - Hysteroscope (c34)
  if (workshopId === 35) return 9;                      // Borze - Hysteroscope (c35)
  if (workshopId === 36) return 9;                      // Borze - Colposcope (c36)
  return 1; // fallback
}, []);


  // ---------- Handlers ----------
  const handleCardClick = useCallback((movieId) => {
    navigate(`/movie/${movieId}`);
  }, [navigate]);

  const handleWorkshopClick = useCallback((companyId) => {
    navigate(`/movie/${companyId}`);
  }, [navigate]);

  const handleKeyActivate = (e, fn) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  // Helper to resolve image src from backend item or fallback to static
  const getImageSrc = (w) => {
    // backend returns imageUrl (may be empty or just base URL)
    if (w?.imageUrl && !w.imageUrl.endsWith('4000') && !w.imageUrl.endsWith('4000/')) {
      return w.imageUrl;
    }
    if (w?.image) return w.image;
    return null; // return null if no image
  };

  // Helper to check if workshop has a valid image
  const hasValidImage = (workshop) => {
    // Check if imageUrl exists and is not just the base URL
    const hasImageUrl = workshop?.imageUrl && 
                        !workshop.imageUrl.endsWith('4000') && 
                        !workshop.imageUrl.endsWith('4000/');
    return Boolean(hasImageUrl || workshop?.image);
  };

  // Helper to get gradient colors based on workshop id
  const getGradientColors = (workshopId) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-pink-500 to-rose-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-blue-600',
      'from-yellow-500 to-orange-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-blue-600',
    ];
    return gradients[(workshopId - 1) % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />
      
      {/* Taglines Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
            Step Into the Future of Medical Training – Only at <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">AICOG 2026</span>
          </h2>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 mb-8">
            First-Ever Mega Simulation Workshops – Experience. Engage. Excel.
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto"></div>
        </div>
      </div>
      
      {/* Popular Picks Section (fetched from backend) */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Popular Picks
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {sameDayWorkshops.length > 0
                    ? `Showing workshops scheduled for today — ${todayLocalString}`
                    : (loadingWorkshops ? 'Loading...' : (workshopsError ? 'Failed to load workshops' : 'Most booked workshops - Book your spot now!'))}
                </p>
              </div>
            </div>
          </div>

          {loadingWorkshops ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl h-44" />
              ))}
            </div>
          ) : workshopsError ? (
            <div className="text-red-600">Error: {workshopsError}</div>
          ) : workshops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 max-w-md text-center shadow-lg">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Workshops Available</h3>
                <p className="text-gray-600 mb-4">
                  {sameDayWorkshops.length === 0 
                    ? "No workshops are scheduled for today. Check back later or explore our companies below!" 
                    : "All workshops are fully booked. Check back later for availability!"}
                </p>
                <button
                  onClick={() => document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md"
                >
                  <span>Explore Companies</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {workshops.map((workshop) => {
                // derive displayName by stripping any " — date time" suffix (backend returns "Name — YYYY-MM-DD HH:MM")
                const displayName = typeof workshop.name === 'string' ? workshop.name.split(' — ')[0] : workshop.name;

                return (
                <button
                  key={workshop.id}
                  type="button"
                  onClick={() => handleWorkshopClick(mapWorkshopToCompany(workshop.id))}
                  className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100 text-left"
                  aria-label={`Open workshop ${displayName}`}
                >
                  <div className="h-32 sm:h-40 relative overflow-hidden">
                    {hasValidImage(workshop) ? (
                      <>
                        <img
                          src={getImageSrc(workshop)}
                          alt={`${displayName} — ${workshop.company}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getGradientColors(workshop.id)} flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-500`}>
                        <h3 className="text-white text-base sm:text-lg font-bold text-center leading-tight">
                          {displayName}
                        </h3>
                      </div>
                    )}

                    {/* Bookings badge */}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                      <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span className="text-xs font-bold text-gray-700">{workshop.bookings ?? 0}</span>
                    </div>
                  </div>

                  <div className="p-3 md:p-4 bg-white">
                    <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-tight">
                      {displayName}
                    </h3>
                    
                    {/* Book Now */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-xs text-blue-600 font-semibold group-hover:text-purple-600 transition-colors duration-300">
                        <span>Book Now</span>
                        <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500">{workshop.bookings ?? 0} booked</span>
                    </div>
                  </div>
                </button>
              )})}
            </div>
          )}
        </section>
      </div>
      
      {/* Companies Section */}
      <div id="companies-section" className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Companies</h2>
          </div>
          
          <div className="relative">
            {/* Grid View - All Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {companies.map((company) => (
                <div 
                  key={company.id} 
                  className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-2 border border-gray-100"
                  onClick={() => handleCardClick(company.id)}
                >
                  {/* Glow effect behind card */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Image section with premium styling */} 
                  <div className="relative w-full h-40 sm:h-56 overflow-hidden">
                    {company.image ? (
                      <img 
                        src={company.image} 
                        alt={`${company.title} Logo`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full ${company.fallbackBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                        {/* Fallback background - no text here anymore, just gradient */}
                      </div>
                    )}
                    
                    {/* Premium overlay gradient - darker for logo visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20 group-hover:from-black/70 transition-all duration-500"></div>
                    
                    {/* Company Logo - Direct on gradient, centered and LARGE */}
                    {company.logo && (
                      <img 
                        src={company.logo} 
                        alt={`${company.title} Logo`} 
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-44 h-44 sm:w-64 sm:h-64 object-contain drop-shadow-[0_20px_35px_rgba(255,255,255,0.8)] group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    
                    {/* If no logo, show company title in center */}
                    {!company.logo && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-2xl">
                        <span className="text-gray-900 text-xl sm:text-3xl font-bold">{company.title}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content section with premium styling - Fixed height */}
                  <div className="p-3 sm:p-4 bg-gradient-to-b from-white to-gray-50 h-44 sm:h-48 flex flex-col">
                    
                    {/* Workshops List - Show only 3 */}
                    {company.workshops && company.workshops.length > 0 ? (
                      <div className="w-full flex-1 flex flex-col">
                        <div className="text-xs font-semibold text-gray-700 mb-2 text-center">Available Workshops</div>
                        <div className="space-y-2">
                          {company.workshops.slice(0, 3).map((workshop, index) => (
                            <div 
                              key={index} 
                              className="flex items-start text-xs text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <svg className="w-3 h-3 mr-2 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="flex-1">{workshop}</span>
                            </div>
                          ))}
                          {company.workshops.length > 3 && (
                            <div className="text-xs text-gray-500 text-center pt-1">
                              +{company.workshops.length - 3} more workshops
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex-1 flex items-center justify-center">
                        <p className="text-xs text-gray-500 italic">No workshops available</p>
                      </div>
                    )}
                    
                    {/* Premium action indicator */}
                    <div className="flex items-center justify-center text-xs sm:text-sm text-blue-600 font-semibold group-hover:text-purple-600 transition-colors duration-300 pt-3 border-t border-gray-200 mt-auto">
                      <span>Explore Workshops</span>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
              </div>
          </div>
        </section>

        
      </div>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Home;
