import React, { useState } from 'react';
import {
  Camera, Play, MapPin, LayoutGrid, Columns, Rows,
} from 'lucide-react';
import configData from '../data/portfolioConfig.json';

const PortfolioSection = ({ addToRefs, openLightbox }) => {
  const [activeTab, setActiveTab] = useState('photos');
  const [layoutMode, setLayoutMode] = useState('masonry');

  const photos = configData.photos || [];
  const videos = configData.videos || [];

  return (
    <section id="portfolio" className="portfolio-section">
      <div className="portfolio-container">
        <div className="portfolio-header">
          <h3 ref={addToRefs} className="reveal-element portfolio-title">Selected Works</h3>
          <div className="tab-switcher">
            <button onClick={() => setActiveTab('photos')} className={`tab-button ${activeTab === 'photos' ? 'tab-active' : ''}`}>
              <Camera size={16} /> Stills
            </button>
            <button onClick={() => setActiveTab('videos')} className={`tab-button ${activeTab === 'videos' ? 'tab-active' : ''}`}>
              <Play size={16} /> Motion
            </button>
          </div>
        </div>

        <div className="gallery-area">
          {activeTab === 'photos' ? (
            <>
              <div className="gallery-toolbar">
                <div className="layout-switcher">
                  <button onClick={() => setLayoutMode('masonry')} className={`layout-btn ${layoutMode === 'masonry' ? 'layout-active' : ''}`} title="Masonry Layout"><Columns size={18} /></button>
                  <button onClick={() => setLayoutMode('grid')} className={`layout-btn ${layoutMode === 'grid' ? 'layout-active' : ''}`} title="Square Grid"><LayoutGrid size={18} /></button>
                  <button onClick={() => setLayoutMode('rows')} className={`layout-btn ${layoutMode === 'rows' ? 'layout-active' : ''}`} title="Cinematic Rows"><Rows size={18} /></button>
                </div>
              </div>

              {photos.length === 0 ? (
                <div className="gallery-empty"><p>No images yet. Visit the admin panel to upload photos.</p></div>
              ) : (
                <div className={
                  layoutMode === 'masonry' ? 'gallery-masonry' :
                  layoutMode === 'grid' ? 'gallery-grid' : 'gallery-rows'
                }>
                  {photos.map((photo, index) => (
                    <div key={photo.id} ref={addToRefs}
                      className={`reveal-element nature-card ${layoutMode === 'masonry' ? 'masonry-item' : ''}`}
                      style={{ transitionDelay: `${(index % 3) * 100}ms` }}
                      onClick={() => openLightbox(photo, 'image')}
                    >
                      <img src={photo.src} alt={photo.title} className={`card-image ${layoutMode === 'grid' ? 'square' : ''}`} loading="lazy" />
                      <div className="card-overlay">
                        <p className="card-location"><MapPin size={12} /> {photo.location || 'Portfolio'}</p>
                        <h3 className="card-title">{photo.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Video Grid */
            videos.length === 0 ? (
              <div className="gallery-empty"><p>No videos yet. Visit the admin panel to upload videos.</p></div>
            ) : (
              <div className="video-grid">
                {videos.map((video, index) => (
                  <div key={video.id} ref={addToRefs}
                    className="reveal-element nature-card video-card"
                    style={{ transitionDelay: `${index * 150}ms` }}
                    onClick={() => openLightbox(video, 'video')}
                  >
                    <div className="video-thumb-wrap">
                      {video.thumb ? (
                        <img src={video.thumb} alt={video.title} className="video-thumb-img" />
                      ) : (
                        <div className="video-thumb-placeholder"><Play size={32} /></div>
                      )}
                      <div className="video-thumb-overlay" />
                      <div className="video-play-btn-wrap">
                        <div className="video-play-btn">
                          <Play className="video-play-icon" fill="currentColor" size={24} />
                        </div>
                      </div>
                      {video.duration && (
                        <div className="video-duration-badge">{video.duration}</div>
                      )}
                    </div>
                    <div className="video-info">
                      <h3 className="video-title">{video.title}</h3>
                      <p className="video-duration">{video.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
