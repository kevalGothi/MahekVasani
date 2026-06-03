import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PortfolioSection from './components/PortfolioSection';
import QuoteSection from './components/QuoteSection';
import Footer from './components/Footer';
import Lightbox from './components/Lightbox';
import SocialCTA from './components/SocialCTA';
import './App.css';

export default function App() {
  const [lightboxData, setLightboxData] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  // Collect refs for scroll-reveal
  const revealRefs = useRef([]);
  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  // Parallax scroll listener
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll-reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  });

  const openLightbox = (item, type) => {
    setLightboxData({ ...item, type });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxData(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="app-root">
      <Navbar />
      <HeroSection scrollY={scrollY} />
      <PortfolioSection addToRefs={addToRefs} openLightbox={openLightbox} />
      <QuoteSection addToRefs={addToRefs} />
      <Footer addToRefs={addToRefs} />
      <SocialCTA />
      <Lightbox data={lightboxData} onClose={closeLightbox} />
    </div>
  );
}
