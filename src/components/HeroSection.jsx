import React from 'react';
import { ChevronDown } from 'lucide-react';
import FloatingParticles from './FloatingParticles';
import { getSettings } from '../utils/settings';
import { HERO_BG } from '../data/portfolioData';

const HeroSection = ({ scrollY }) => {
  const config = getSettings();
  const tagParts = config.tagline.split('&');

  return (
    <section className="hero-section">
      <div
        className="hero-bg"
        style={{
          backgroundImage: `url("${HERO_BG}")`,
          transform: `translateY(${scrollY * 0.4}px) scale(1.1)`,
        }}
      />
      <div className="hero-gradient" />
      <FloatingParticles />

      <div className="hero-content">
        <div className="hero-title-wrap">
          <h2 className="hero-title animate-title delay-100">
            {tagParts[0]}&amp;{' '}
            <span className="hero-title-accent">{tagParts[1] || 'Light'}</span>
          </h2>
        </div>
        <div className="hero-subtitle-wrap">
          <p className="hero-subtitle animate-title delay-300">{config.subtitle}</p>
        </div>
      </div>

      <div className="hero-scroll-indicator animate-title delay-600">
        <span className="scroll-text">Discover</span>
        <ChevronDown size={24} className="scroll-arrow" />
      </div>
    </section>
  );
};

export default HeroSection;
