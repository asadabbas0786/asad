import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import c1 from '../assets/CollageImageOnesim/c1.webp';
import c2 from '../assets/CollageImageOnesim/c2.webp';
import c3 from '../assets/CollageImageOnesim/c3.webp';
import c4 from '../assets/CollageImageOnesim/c4.webp';
import c5 from '../assets/CollageImageOnesim/c5.webp';

const Home = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [oneSimImageIndex, setOneSimImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' or 'grid'
  const [cardsPerView, setCardsPerView] = useState(4); // Number of cards visible at once
  const [isMobile, setIsMobile] = useState(false);

  // One Simulation images array
  const oneSimImages = [c1, c2, c3, c4, c5];

  // Auto-scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Update cardsPerView based on screen size
  useEffect(() => {
    const updateCardsPerView = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) {
        setCardsPerView(1); // Mobile: 1 card at a time
      } else {
        setCardsPerView(4); // Desktop: 4 cards at a time
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Auto-rotate One Simulation images
  useEffect(() => {
    const timer = setInterval(() => {
      setOneSimImageIndex((prev) => (prev + 1) % oneSimImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(timer);
  }, [oneSimImages.length]);

  // Company data with images and details
  const companies = [
    {
      id: 1,
      title: "One Simulation",
      category: "Healthcare Simulation Company",
      // rating: "4.8",
      image: "/OneSimBgOverLayImage.png", // Image path in public folder - same as hero section main poster
      fallbackBg: "bg-white"
    },
    {
      id: 2,
      title: "Vintek Medical Corporation",
      category: "Healthcare",
      rating: "4.5",
      image: null, // Add image path when available
      fallbackBg: "bg-blue-400"
    },
    {
      id: 3,
      title: "GE",
      category: "Healthcare Technology",
      rating: "4.2",
      image: null, // Add image path when available
      fallbackBg: "bg-green-400"
    },
    {
      id: 4,
      title: "DSS",
      category: "Healthcare Simulation",
      rating: "4.7",
      image: null, // Add image path when available
      fallbackBg: "bg-purple-400"
    },
    {
      id: 5,
      title: "LAerdal",
      category: "Medical Training",
      rating: "4.8",
      image: null, // Add image path when available
      fallbackBg: "bg-yellow-400"
    },
    {
      id: 6,
      title: "J&J",
      category: "Healthcare Products",
      rating: "4.6",
      image: null, // Add image path when available
      fallbackBg: "bg-red-400"
    },
    {
      id: 7,
      title: "CRTC - AIIMS",
      category: "Resuscitation Training & Emergency Care",
      rating: "4.9",
      image: null, // Add image path when available
      fallbackBg: "bg-indigo-400"
    },
    {
      id: 8,
      title: "NN Recusc",
      category: "Neonatal Resuscitation",
      rating: "4.5",
      image: null, // Add image path when available
      fallbackBg: "bg-teal-400"
    },
    {
      id: 9,
      title: "Hysteroscopy",
      category: "Gynecological Procedures",
      rating: "4.4",
      image: null, // Add image path when available
      fallbackBg: "bg-pink-400"
    },
    {
      id: 10,
      title: "Colposcopy",
      category: "Cervical Examination",
      rating: "4.6",
      image: null, // Add image path when available
      fallbackBg: "bg-orange-400"
    }
  ];

  const handleCardClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    
    // Scroll to the card on mobile
    const container = document.querySelector('.carousel-container');
    if (container && window.innerWidth < 640) {
      const cardWidth = 280 + 16; // card width + gap
      container.scrollTo({
        left: newIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, companies.length - cardsPerView);
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    setCurrentIndex(newIndex);
    
    // Scroll to the card on mobile
    const container = document.querySelector('.carousel-container');
    if (container && window.innerWidth < 640) {
      const cardWidth = 280 + 16; // card width + gap
      container.scrollTo({
        left: newIndex * cardWidth,
        behavior: 'smooth'
      });
    }
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
      
      {/* Additional content sections can be added here */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Recommended Companies</h2>
              <button
                onClick={() => setViewMode(viewMode === 'carousel' ? 'grid' : 'carousel')}
                className="text-red-500 hover:text-red-600 font-medium transition-colors duration-200 flex items-center gap-1 text-sm"
              >
                <span>{viewMode === 'carousel' ? 'See All' : 'Show Less'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className={`${viewMode === 'carousel' ? 'flex' : 'hidden'} space-x-2`}>
              {/* Previous Button - visible on all screens */}
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`p-1.5 sm:p-2 rounded-full transition-colors duration-200 ${
                  currentIndex === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-800 hover:bg-gray-100 shadow-lg'
                }`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Next Button - visible on all screens */}
              <button
                onClick={handleNext}
                disabled={currentIndex >= Math.max(0, companies.length - cardsPerView)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors duration-200 ${
                  currentIndex >= Math.max(0, companies.length - cardsPerView)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-800 hover:bg-gray-100 shadow-lg'
                }`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="relative overflow-hidden">
            {viewMode === 'grid' ? (
              /* Grid View - All Cards */
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
                  <div className="relative w-full h-48 sm:h-80 overflow-hidden">
                    {company.id === 1 ? (
                      // One Simulation carousel
                      <div className="relative w-full h-full">
                        <img 
                          src={oneSimImages[oneSimImageIndex]} 
                          alt={`${company.title} Image ${oneSimImageIndex + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          key={oneSimImageIndex}
                        />
                        
                        {/* Carousel indicators */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {oneSimImages.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === oneSimImageIndex 
                                  ? 'bg-white scale-125' 
                                  : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                        
                        {/* Carousel navigation arrows */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOneSimImageIndex((prev) => (prev - 1 + oneSimImages.length) % oneSimImages.length);
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOneSimImageIndex((prev) => (prev + 1) % oneSimImages.length);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    ) : company.image ? (
                      <img 
                        src={company.image} 
                        alt={`${company.title} Logo`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full ${company.fallbackBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                        <span className="text-white text-lg font-bold">{company.title}</span>
                      </div>
                    )}
                    
                    {/* Premium overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>
                    
                    {/* One Simulation Logo Overlay - Right Top */}
                    {company.id === 1 && (
                      <div className="absolute -top-1 sm:-top-2 right-1 sm:right-2 z-20">
                        <img 
                          src="/OneSimLogo.png" 
                          alt="One Simulation Logo" 
                          className="w-12 h-12 sm:w-24 sm:h-24 object-contain hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    {/* Corner decorations for other companies */}
                    {company.id !== 1 && (
                      <>
                        <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute bottom-4 left-4 w-4 h-4 bg-gradient-to-br from-pink-400 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </>
                    )}
                    
                    {/* Hover overlay with icon */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content section with premium styling */}
                  <div className="p-3 sm:p-6 bg-gradient-to-b from-white to-gray-50">
                    <h3 className="font-bold text-sm sm:text-xl text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                      {company.title}
                    </h3>
                    <p className="text-gray-600 mb-2 sm:mb-3 font-medium text-xs sm:text-base line-clamp-1">{company.category}</p>
                    
                    {/* Premium action indicator */}
                    <div className="flex items-center text-xs sm:text-sm text-blue-600 font-semibold group-hover:text-purple-600 transition-colors duration-300">
                      <span>Explore Workshops</span>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              /* Carousel View - Horizontal scroll for all screens */
              <div className="carousel-container overflow-x-auto no-scrollbar touch-pan-x snap-x snap-mandatory">
                <div 
                  className="flex gap-4 sm:gap-6 sm:transition-transform sm:duration-300 sm:ease-in-out" 
                  style={{ transform: !isMobile ? `translateX(-${currentIndex * (100 / cardsPerView)}%)` : 'none' }}
                >
                  {companies.map((company) => (
                    <div 
                      key={company.id} 
                      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-2 flex-shrink-0 border border-gray-100 snap-start"
                      style={{ width: '280px', minWidth: '280px' }}
                      onClick={() => handleCardClick(company.id)}
                    >
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Image section */}
                        <div className="relative w-full h-64 sm:h-80 overflow-hidden">
                          {company.id === 1 ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={oneSimImages[oneSimImageIndex]} 
                                alt={company.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              {/* Carousel indicators */}
                              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {oneSimImages.map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                      index === oneSimImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                              {/* Image navigation */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOneSimImageIndex((prev) => (prev - 1 + oneSimImages.length) % oneSimImages.length);
                                }}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOneSimImageIndex((prev) => (prev + 1) % oneSimImages.length);
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                          ) : company.image ? (
                            <img src={company.image} alt={company.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className={`w-full h-full ${company.fallbackBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                              <span className="text-white text-lg font-bold">{company.title}</span>
                            </div>
                          )}
                          
                          {/* One Simulation Logo */}
                          {company.id === 1 && (
                            <div className="absolute -top-2 right-2 z-20">
                              <img src="/OneSimLogo.png" alt="One Simulation Logo" className="w-24 h-24 object-contain hover:scale-110 transition-transform duration-300" />
                            </div>
                          )}
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* Content section */}
                        <div className="p-4 sm:p-6 bg-gradient-to-b from-white to-gray-50">
                          <h3 className="font-bold text-base sm:text-xl text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                            {company.title}
                          </h3>
                          <p className="text-gray-600 mb-2 sm:mb-3 font-medium text-sm line-clamp-1">{company.category}</p>
                          
                          <div className="flex items-center text-xs sm:text-sm text-blue-600 font-semibold group-hover:text-purple-600 transition-colors duration-300">
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
            )}
          </div>
        </section>

        
      </div>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Home;
