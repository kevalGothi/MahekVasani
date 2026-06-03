import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../utils/auth';
import { fileToDataURL, generateVideoThumbnail, formatDuration } from '../utils/imageDB';
import configData from '../data/portfolioConfig.json';
import {
  Upload, Trash2, LogOut, Camera, Play,
  Image as ImageIcon, Film, Plus,
  AlertTriangle, CheckCircle, X, Settings,
  RefreshCw, Globe, ShieldAlert
} from 'lucide-react';

const AdminDashboard = () => {
  const [images, setImages] = useState(configData.photos || []);
  const [videos, setVideos] = useState(configData.videos || []);
  const [siteConfig, setSiteConfig] = useState(configData.siteConfig || {});
  
  const [activeTab, setActiveTab] = useState('images'); // 'images' | 'videos' | 'settings'
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, type: 'image'|'video' }
  const [dragActive, setDragActive] = useState(false);
  
  // Settings Form State
  const [formData, setFormData] = useState({ ...configData.siteConfig });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin', { replace: true });
    }
    checkEnvironment();
  }, [navigate]);

  const checkEnvironment = async () => {
    try {
      const res = await fetch('/api/dev-status');
      if (res.ok) {
        const data = await res.json();
        setIsLocalDev(!!data.isLocalDev);
      } else {
        setIsLocalDev(false);
      }
    } catch {
      setIsLocalDev(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- UPLOAD HANDLER ----
  const handleUpload = async (files) => {
    if (!isLocalDev) {
      showToast('Upload is disabled in read-only production mode.', 'error');
      return;
    }
    if (!files || files.length === 0) return;
    setIsUploading(true);

    let imgCount = 0;
    let vidCount = 0;

    try {
      for (const file of files) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
          showToast(`"${file.name}" — unsupported file type`, 'error');
          continue;
        }

        // Size limits: 10MB images, 100MB videos
        const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
        if (file.size > maxSize) {
          showToast(`"${file.name}" is too large (max ${isImage ? '10MB' : '100MB'})`, 'error');
          continue;
        }

        const rawName = file.name.replace(/\.[^/.]+$/, '');
        const title = rawName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        const dataURL = await fileToDataURL(file);
        
        let payload = {
          fileName: file.name,
          fileType: file.type,
          dataUrl: dataURL,
          title,
          mediaType: isImage ? 'image' : 'video'
        };

        if (isVideo) {
          let thumbInfo = { thumbnail: '', duration: 0 };
          try {
            thumbInfo = await generateVideoThumbnail(file);
          } catch (err) {
            console.warn('Could not generate thumbnail client-side:', err);
          }
          payload.thumbDataUrl = thumbInfo.thumbnail;
          payload.duration = formatDuration(thumbInfo.duration);
        }

        // Post to local server API
        const res = await fetch('/api/upload-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const result = await res.json();
          if (isImage) {
            setImages(prev => [...prev, {
              id: result.id,
              src: `/images/${result.id}.${file.name.split('.').pop() || 'jpg'}`,
              title,
              location: '',
              aspect: 'landscape'
            }]);
            imgCount++;
          } else {
            const ext = file.name.split('.').pop() || 'mp4';
            setVideos(prev => [...prev, {
              id: result.id,
              thumb: `/videos/${result.id}-thumb.jpg`,
              title,
              duration: payload.duration,
              videoSrc: `/videos/${result.id}.${ext}`
            }]);
            vidCount++;
          }
        } else {
          showToast(`Failed to upload ${file.name}`, 'error');
        }
      }

      const parts = [];
      if (imgCount > 0) parts.push(`${imgCount} image${imgCount > 1 ? 's' : ''}`);
      if (vidCount > 0) parts.push(`${vidCount} video${vidCount > 1 ? 's' : ''}`);
      if (parts.length > 0) showToast(`${parts.join(' & ')} saved to local project!`);
    } catch (err) {
      console.error(err);
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInput = (e) => handleUpload(Array.from(e.target.files));

  const handleDelete = async (id, type) => {
    if (!isLocalDev) {
      showToast('Delete is disabled in read-only production mode.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/delete-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type })
      });

      if (res.ok) {
        if (type === 'video') {
          setVideos((prev) => prev.filter((v) => v.id !== id));
        } else {
          setImages((prev) => prev.filter((img) => img.id !== id));
        }
        setDeleteConfirm(null);
        showToast(`${type === 'video' ? 'Video' : 'Image'} deleted and removed from codebase`);
      } else {
        showToast('Delete failed on server', 'error');
      }
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  // ---- SETTINGS HANDLERS ----
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isLocalDev) {
      showToast('Saving settings is disabled in read-only production mode.', 'error');
      return;
    }
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteConfig: formData })
      });

      if (res.ok) {
        setSiteConfig(formData);
        showToast('Settings saved successfully!');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetSettings = async () => {
    if (!isLocalDev) {
      showToast('Resetting settings is disabled in read-only production mode.', 'error');
      return;
    }
    if (window.confirm('Are you sure you want to reset settings to original defaults? All customized tagline, email, and social values will be reset.')) {
      try {
        const res = await fetch('/api/reset-settings', { method: 'POST' });
        if (res.ok) {
          const defaultSiteConfig = {
            name: "Nature.Lens",
            tagline: "Earth & Light",
            subtitle: "Wilderness Photography by Mahek",
            aboutTitle: "The Observer.",
            aboutText: "I spend my life chasing light across untouched landscapes. From the quiet mist of ancient pine forests to the roaring isolation of alpine peaks, my goal is to capture the raw, untamed essence of the earth.",
            availableText: "Available for assignments worldwide.",
            email: "hello@naturelens.com",
            instagram: "@nature.lens",
            instagramUrl: "https://instagram.com/nature.lens",
            youtubeUrl: "https://youtube.com/@naturelens",
            quote: "\"In every walk with nature, one receives far more than he seeks.\"",
            quoteAuthor: "— John Muir"
          };
          setFormData(defaultSiteConfig);
          setSiteConfig(defaultSiteConfig);
          showToast('Settings reset to defaults');
        } else {
          showToast('Reset failed', 'error');
        }
      } catch {
        showToast('Error resetting settings', 'error');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin', { replace: true });
  };

  // Drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length > 0) handleUpload(Array.from(e.dataTransfer.files));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const currentItems = activeTab === 'images' ? images : videos;

  return (
    <div className="admin-dashboard">
      {/* Environment Mode Banner */}
      {!isLocalDev ? (
        <div className="admin-banner production-warn">
          <Globe size={16} />
          <span>
            <strong>Read-Only Mode (Vercel Live Production)</strong> — All uploads, deletes, and configuration updates are disabled. 
            To customize your site, run it locally using <code>npm run dev</code>, make your changes, then push to GitHub to redeploy.
          </span>
        </div>
      ) : (
        <div className="admin-banner local-success">
          <ShieldAlert size={16} />
          <span>
            <strong>Local Codebase Mode (localhost)</strong> — All changes are written directly to your project files on disk. 
            Push changes to GitHub when ready to deploy.
          </span>
        </div>
      )}

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-header-logo"><Camera size={20} /></div>
          <div>
            <h1 className="admin-header-title">{siteConfig.name || 'Portfolio Manager'} Settings</h1>
            <p className="admin-header-sub">
              {images.length} image{images.length !== 1 ? 's' : ''} · {videos.length} video{videos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="admin-header-actions">
          <a href="/" className="admin-view-site-btn" target="_blank" rel="noopener noreferrer">View Site ↗</a>
          <button onClick={handleLogout} className="admin-logout-btn"><LogOut size={16} /> Logout</button>
        </div>
      </header>

      <main className="admin-main">
        {/* Upload Zone (Disabled in production) */}
        {activeTab !== 'settings' && (
          <div
            className={`admin-upload-zone ${dragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''} ${!isLocalDev ? 'read-only' : ''}`}
            onDragEnter={isLocalDev ? handleDrag : undefined} 
            onDragLeave={isLocalDev ? handleDrag : undefined} 
            onDragOver={isLocalDev ? handleDrag : undefined} 
            onDrop={isLocalDev ? handleDrop : undefined}
            onClick={() => isLocalDev && !isUploading && fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden-input" multiple accept="image/*,video/*" onChange={handleFileInput} disabled={!isLocalDev} />
            {isUploading ? (
              <div className="upload-zone-content">
                <div className="admin-spinner large" />
                <p className="upload-zone-title">Uploading to local project folders...</p>
              </div>
            ) : !isLocalDev ? (
              <div className="upload-zone-content">
                <div className="upload-zone-icon" style={{ opacity: 0.5 }}><ShieldAlert size={32} /></div>
                <p className="upload-zone-title" style={{ color: '#6b7280' }}>Media Uploads Disabled</p>
                <p className="upload-zone-sub">Open this site on your localhost terminal to upload images or videos.</p>
              </div>
            ) : (
              <div className="upload-zone-content">
                <div className="upload-zone-icon"><Upload size={32} /></div>
                <p className="upload-zone-title">{dragActive ? 'Drop files here' : 'Upload Images & Videos'}</p>
                <p className="upload-zone-sub">Drag & drop or click • Saves directly into /public/images/ or /public/videos/ and updates configuration</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="admin-tab-bar">
          <button onClick={() => setActiveTab('images')} className={`admin-tab ${activeTab === 'images' ? 'admin-tab-active' : ''}`}>
            <ImageIcon size={16} /> Images <span className="admin-tab-count">{images.length}</span>
          </button>
          <button onClick={() => setActiveTab('videos')} className={`admin-tab ${activeTab === 'videos' ? 'admin-tab-active' : ''}`}>
            <Film size={16} /> Videos <span className="admin-tab-count">{videos.length}</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`admin-tab ${activeTab === 'settings' ? 'admin-tab-active' : ''}`}>
            <Settings size={16} /> Site Details & Socials
          </button>
        </div>

        {/* Settings Tab Content */}
        {activeTab === 'settings' ? (
          <form className="admin-settings-form" onSubmit={handleSaveSettings}>
            <h2 className="admin-section-title">Site Configuration</h2>
            
            <div className="form-grid">
              {/* General Brand Details */}
              <div className="form-card">
                <h3>Header & Brand</h3>
                <div className="admin-input-group">
                  <label className="admin-input-label">Site Title (e.g. BrandName.Extension)</label>
                  <input type="text" name="name" className="admin-input-text" value={formData.name || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder="Nature.Lens" required />
                </div>
                <div className="admin-input-group">
                  <label className="admin-input-label">Hero Title / Tagline (split by &amp;)</label>
                  <input type="text" name="tagline" className="admin-input-text" value={formData.tagline || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder="Earth & Light" required />
                </div>
                <div className="admin-input-group">
                  <label className="admin-input-label">Hero Subtitle</label>
                  <input type="text" name="subtitle" className="admin-input-text" value={formData.subtitle || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder="Wilderness Photography by Mahek" />
                </div>
              </div>

              {/* About Sections */}
              <div className="form-card">
                <h3>About Section</h3>
                <div className="admin-input-group">
                  <label className="admin-input-label">About Title</label>
                  <input type="text" name="aboutTitle" className="admin-input-text" value={formData.aboutTitle || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder="The Observer." />
                </div>
                <div className="admin-input-group">
                  <label className="admin-input-label">About Paragraph Content</label>
                  <textarea name="aboutText" className="admin-input-textarea" rows="4" value={formData.aboutText || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder="Describe yourself and your style..."></textarea>
                </div>
                <div className="admin-input-group">
                  <label className="admin-input-label">Availability / Status</label>
                  <input type="text" name="availableText" className="admin-input-text" value={formData.availableText || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder="Available for assignments worldwide." />
                </div>
              </div>

              {/* Contact & Socials */}
              <div className="form-card">
                <h3>Contact &amp; Social Links</h3>
                <div className="admin-input-group">
                  <label className="admin-input-label">Contact Email</label>
                  <input type="email" name="email" className="admin-input-text" value={formData.email || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder="hello@yoursite.com" />
                </div>
                <div className="admin-input-group">
                  <label className="admin-input-label">Instagram Handle (text display)</label>
                  <input type="text" name="instagram" className="admin-input-text" value={formData.instagram || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder="@nature.lens" />
                </div>
                <div className="admin-input-group">
                  <label className="admin-input-label">Instagram URL</label>
                  <input type="url" name="instagramUrl" className="admin-input-text" value={formData.instagramUrl || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder="https://instagram.com/..." />
                </div>
                <div className="admin-input-group">
                  <label className="admin-input-label">YouTube Channel URL</label>
                  <input type="url" name="youtubeUrl" className="admin-input-text" value={formData.youtubeUrl || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder="https://youtube.com/@..." />
                </div>
              </div>

              {/* Parallax Quote Details */}
              <div className="form-card">
                <h3>Parallax Quote Section</h3>
                <div className="admin-input-group">
                  <label className="admin-input-label">Inspirational Quote</label>
                  <textarea name="quote" className="admin-input-textarea" rows="3" value={formData.quote || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder='"In every walk with nature...'></textarea>
                </div>
                <div className="admin-input-group">
                  <label className="admin-input-label">Quote Author</label>
                  <input type="text" name="quoteAuthor" className="admin-input-text" value={formData.quoteAuthor || ''} onChange={handleInputChange} disabled={!isLocalDev} placeholder="— John Muir" />
                </div>
              </div>
            </div>

            {/* Save Operations */}
            <div className="settings-form-actions">
              <button type="button" onClick={handleResetSettings} className="admin-reset-btn" disabled={!isLocalDev}>
                <RefreshCw size={14} /> Reset Defaults
              </button>
              <button type="submit" className="admin-save-btn" disabled={!isLocalDev || isSavingSettings}>
                {isSavingSettings ? (
                  <>
                    <div className="admin-spinner" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} /> Save Codebase Settings
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Images / Videos Gallery Content */
          currentItems.length === 0 ? (
            <div className="admin-empty-state">
              {activeTab === 'images' ? <ImageIcon size={48} className="admin-empty-icon" /> : <Film size={48} className="admin-empty-icon" />}
              <h3 className="admin-empty-title">No {activeTab} yet</h3>
              <p className="admin-empty-sub">Upload your first {activeTab === 'images' ? 'image' : 'video'} to get started.</p>
              {isLocalDev && (
                <button className="admin-empty-btn" onClick={() => fileInputRef.current?.click()}>
                  <Plus size={16} /> Upload {activeTab === 'images' ? 'Image' : 'Video'}
                </button>
              )}
            </div>
          ) : (
            <div className="admin-gallery">
              {currentItems.map((item, index) => (
                <div key={item.id} className="admin-image-card" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="admin-image-preview">
                    {activeTab === 'videos' ? (
                      <>
                        {item.thumb ? (
                          <img src={item.thumb} alt={item.title} loading="lazy" />
                        ) : (
                          <div className="admin-video-placeholder-thumb"><Film size={32} /></div>
                        )}
                        {/* Video badge */}
                        <div className="admin-video-badge">
                          <Play size={10} fill="currentColor" />
                          <span>{item.duration || '0:00'}</span>
                        </div>
                      </>
                    ) : (
                      <img src={item.src} alt={item.title} loading="lazy" />
                    )}
                    
                    {isLocalDev && (
                      <div className="admin-image-overlay">
                        <button
                          className="admin-delete-btn"
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: item.id, type: activeTab === 'videos' ? 'video' : 'image' }); }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    <div className="admin-image-number">#{index + 1}</div>
                  </div>
                  <div className="admin-image-info">
                    <p className="admin-image-title">{item.title}</p>
                    <p className="admin-image-meta">{item.fileName && formatFileSize(item.fileSize)}</p>
                  </div>
                </div>
              ))}

              {isLocalDev && (
                <div className="admin-image-card admin-add-card" onClick={() => fileInputRef.current?.click()}>
                  <div className="admin-add-content"><Plus size={32} /><span>Add More</span></div>
                </div>
              )}
            </div>
          )
        )}
      </main>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon"><AlertTriangle size={32} /></div>
            <h3 className="admin-modal-title">Delete {deleteConfirm.type === 'video' ? 'Video' : 'Image'}?</h3>
            <p className="admin-modal-text">This will delete the physical file from your local public folder and remove its entry from your JSON config file.</p>
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="admin-modal-confirm" onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.type)}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
          <button className="admin-toast-close" onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
