import React, { useState } from 'react';
import { getSettings } from '../utils/settings';

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YouTubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const SocialCTA = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = getSettings();

  const socials = [];
  if (config.instagramUrl) {
    socials.push({
      name: 'Instagram',
      url: config.instagramUrl,
      icon: <InstagramIcon />,
      color: '#E1306C',
      gradient: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    });
  }
  if (config.youtubeUrl) {
    socials.push({
      name: 'YouTube',
      url: config.youtubeUrl,
      icon: <YouTubeIcon />,
      color: '#FF0000',
      gradient: 'linear-gradient(45deg, #FF0000, #cc0000)',
    });
  }

  if (socials.length === 0) return null;

  return (
    <div className={`social-cta ${isExpanded ? 'expanded' : ''}`}>
      <div className="social-cta-links">
        {socials.map((s) => (
          <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
            className="social-cta-link"
            style={{ '--social-color': s.color, '--social-gradient': s.gradient }}
            title={s.name}
          >
            {s.icon}
            <span className="social-cta-label">{s.name}</span>
          </a>
        ))}
      </div>
      <button className="social-cta-toggle" onClick={() => setIsExpanded(!isExpanded)} aria-label="Social links">
        <span className={`social-cta-icon ${isExpanded ? 'rotated' : ''}`}>
          {isExpanded ? '✕' : '✦'}
        </span>
      </button>
    </div>
  );
};

export default SocialCTA;
