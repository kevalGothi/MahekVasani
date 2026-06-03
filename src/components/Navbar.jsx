import React from 'react';
import { getSettings } from '../utils/settings';

const Navbar = () => {
  const config = getSettings();
  const parts = config.name.split('.');

  return (
    <nav className="navbar">
      <h1 className="navbar-brand">
        {parts[0]}
        <span className="navbar-dot">.</span>
        {parts[1] || ''}
      </h1>
      <div className="navbar-links">
        <a href="#portfolio">Work</a>
        <a href="#about">About</a>
      </div>
    </nav>
  );
};

export default Navbar;
