import React from 'react';
import { X, Play } from 'lucide-react';

const Lightbox = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>
        <X size={32} />
      </button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {data.type === 'image' ? (
          <>
            <img src={data.src} alt={data.title} className="lightbox-image" />
            <div className="lightbox-info">
              <h3 className="lightbox-title">{data.title}</h3>
              <p className="lightbox-location">{data.location}</p>
            </div>
          </>
        ) : (
          <div className="lightbox-video-container">
            {data.src || data.videoSrc ? (
              <video
                controls
                autoPlay
                className="lightbox-video"
                src={data.src || data.videoSrc}
              />
            ) : (
              <div className="lightbox-video-placeholder">
                <Play size={64} className="lightbox-play-icon" />
                <p className="lightbox-video-title">Video Player</p>
                <p className="lightbox-video-sub">{data.title}</p>
              </div>
            )}
            <div className="lightbox-video-info">
              <h3 className="lightbox-title">{data.title}</h3>
              {data.duration && <p className="lightbox-location">{data.duration}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lightbox;
