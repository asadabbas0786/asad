import React from 'react';
import heroImage from '../assets/herosection/image.png';
import heroImageMobile from '../assets/herosection/image copy.png';

const HeroSection = () => {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Desktop Image - Only shows on screens 640px and above */}
      <picture>
        <source media="(min-width: 640px)" srcSet={heroImage} />
        <source media="(max-width: 639px)" srcSet={heroImageMobile} />
        <img 
          src={heroImage} 
          alt="Simulation WORLD at AICOG 2026" 
          className="w-full h-auto"
        />
      </picture>
    </div>
  );
};

export default HeroSection;
