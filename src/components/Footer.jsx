import React from 'react';
import { Mail, AtSign } from 'lucide-react';
import { SITE_CONFIG } from '../data/portfolioData';

// Custom SVG icons for brands
const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YouTubeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const Footer = ({ addToRefs }) => {
  return (
    <footer id="about" className="site-footer">
      <div className="footer-grid">
        <div ref={addToRefs} className="reveal-element footer-about">
          <h3 className="footer-title">{SITE_CONFIG.aboutTitle}</h3>
          <p className="footer-text">{SITE_CONFIG.aboutText}</p>
          <p className="footer-text">{SITE_CONFIG.availableText}</p>
        </div>
        <div ref={addToRefs} className="reveal-element footer-connect">
          <h4 className="footer-connect-title">Connect</h4>
          <a href={`mailto:${SITE_CONFIG.email}`} className="footer-link">
            <Mail size={20} className="footer-link-icon" /> {SITE_CONFIG.email}
          </a>
          {SITE_CONFIG.instagramUrl && (
            <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-link">
              <InstagramIcon /> {SITE_CONFIG.instagram}
            </a>
          )}
          {SITE_CONFIG.youtubeUrl && (
            <a href={SITE_CONFIG.youtubeUrl} target="_blank" rel="noopener noreferrer" className="footer-link">
              <YouTubeIcon /> YouTube
            </a>
          )}
        </div>
      </div>
      <div className="footer-copyright">
        <p>&copy; {new Date().getFullYear()} {SITE_CONFIG.name} Photography.</p>
      </div>
    </footer>
  );
};

export default Footer;
