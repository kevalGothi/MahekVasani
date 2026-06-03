import React from 'react';
import { Leaf } from 'lucide-react';
import { getSettings } from '../utils/settings';
import { QUOTE_BG } from '../data/portfolioData';

const QuoteSection = ({ addToRefs }) => {
  const config = getSettings();

  return (
    <section className="quote-section">
      <div className="quote-bg" style={{ backgroundImage: `url("${QUOTE_BG}")` }} />
      <div className="quote-overlay" />
      <div className="quote-content">
        <Leaf className="quote-leaf" size={40} />
        <h2 ref={addToRefs} className="reveal-element quote-text">{config.quote}</h2>
        <p ref={addToRefs} className="reveal-element quote-author">{config.quoteAuthor}</p>
      </div>
    </section>
  );
};

export default QuoteSection;
