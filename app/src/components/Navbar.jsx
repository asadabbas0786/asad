import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConferenceLogo from '../assets/Logo/Conference__Logo.png';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Delhi-NCR');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();

  // Company data for search
  const companies = [
    { id: 1, name: "One Simulation", category: "Healthcare Simulation Company", fallbackBg: "bg-white" },
    { id: 2, name: "Vintek Medical Corporation", category: "Healthcare", fallbackBg: "bg-blue-400" },
    { id: 3, name: "GE", category: "Healthcare Technology", fallbackBg: "bg-green-400" },
    { id: 4, name: "DSS", category: "Healthcare Simulation", fallbackBg: "bg-purple-400" },
    { id: 5, name: "Laerdal", category: "Medical Training", fallbackBg: "bg-yellow-400" },
    { id: 6, name: "J&J", category: "Healthcare Products", fallbackBg: "bg-red-400" },
    { id: 7, name: "CRTC - AIIMS", category: "Resuscitation Training & Emergency Care", fallbackBg: "bg-indigo-400" },
    { id: 8, name: "NN Recusc", category: "Neonatal Resuscitation", fallbackBg: "bg-teal-400" },
    { id: 9, name: "Hysteroscopy", category: "Gynecological Procedures", fallbackBg: "bg-pink-400" },
    { id: 10, name: "Colposcopy", category: "Cervical Examination", fallbackBg: "bg-orange-400" }
  ];

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
    setSelectedIndex(-1); // Reset selection when typing
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // If an item is selected with arrow keys, navigate to it
    if (selectedIndex >= 0 && selectedIndex < filteredCompanies.length) {
      const selectedCompany = filteredCompanies[selectedIndex];
      navigate(`/movie/${selectedCompany.id}`);
      setSearchQuery('');
      setShowSearchResults(false);
      setSelectedIndex(-1);
      return;
    }

    // Otherwise, find first matching company
    if (searchQuery.trim()) {
      const matchedCompany = companies.find(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchedCompany) {
        navigate(`/movie/${matchedCompany.id}`);
        setSearchQuery('');
        setShowSearchResults(false);
        setSelectedIndex(-1);
      }
    }
  };

  const handleCompanySelect = (companyId) => {
    navigate(`/movie/${companyId}`);
    setSearchQuery('');
    setShowSearchResults(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSearchResults || filteredCompanies.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCompanies.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCompanies.length - 1
        );
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button 
                onClick={handleLogoClick}
                className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
              >
                <img 
                  src={ConferenceLogo} 
                  alt="Conference Logo" 
                  className="h-14 w-auto"
                />
              </button>
            </div>
          </div>

          {/* Center - Search bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="Search for Companies"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setTimeout(() => {
                      setShowSearchResults(false);
                      setSelectedIndex(-1);
                    }, 200)}
                    onFocus={() => {
                      if (searchQuery.length > 0) {
                        setShowSearchResults(true);
                        setSelectedIndex(-1);
                      }
                    }}
                  />
                </div>
              </form>
              
              {/* Search Results Dropdown */}
              {showSearchResults && filteredCompanies.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {filteredCompanies.map((company, index) => (
                    <div
                      key={company.id}
                      className={`flex items-center px-6 py-4 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                        index === selectedIndex 
                          ? 'bg-blue-50' 
                          : 'hover:bg-blue-50'
                      }`}
                      onClick={() => handleCompanySelect(company.id)}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${company.fallbackBg}`}>
                        <span className="text-white font-bold text-sm">
                          {company.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{company.name}</h4>
                        <p className="text-sm text-gray-600">{company.category}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No Results Message */}
              {showSearchResults && searchQuery.length > 0 && filteredCompanies.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                  <div className="px-4 py-3 text-gray-500 text-center">
                    No companies found for "{searchQuery}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - City selector and Sign in */}
          <div className="flex items-center space-x-4">
            {/* City selector */}
            {/* <div className="relative">
              <select 
                className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="Delhi-NCR">Delhi-NCR</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Pune">Pune</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div> */}

            {/* Sign in button */}
            

            {/* Menu icon */}
            <button className="p-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom navigation */}
        {/* <div className="border-t border-gray-200">
          <div className="flex items-center space-x-8 py-3">
            <a href="#" className="text-gray-700 hover:text-red-500 text-sm font-medium transition-colors duration-200">Movies</a>
            <a href="#" className="text-gray-700 hover:text-red-500 text-sm font-medium transition-colors duration-200">Stream</a>
            <a href="#" className="text-gray-700 hover:text-red-500 text-sm font-medium transition-colors duration-200">Events</a>
            <a href="#" className="text-gray-700 hover:text-red-500 text-sm font-medium transition-colors duration-200">Plays</a>
            <a href="#" className="text-gray-700 hover:text-red-500 text-sm font-medium transition-colors duration-200">Sports</a>
            <a href="#" className="text-gray-700 hover:text-red-500 text-sm font-medium transition-colors duration-200">Activities</a>
            <div className="flex-1"></div>
            <a href="#" className="text-gray-700 hover:text-red-500 text-sm font-medium transition-colors duration-200">ListYourShow</a>
            <a href="#" className="text-gray-700 hover:text-red-500 text-sm font-medium transition-colors duration-200">Corporates</a>
            <a href="#" className="text-gray-700 hover:text-red-500 text-sm font-medium transition-colors duration-200">Offers</a>
            <a href="#" className="text-gray-700 hover:text-red-500 text-sm font-medium transition-colors duration-200">Gift Cards</a>
          </div>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
