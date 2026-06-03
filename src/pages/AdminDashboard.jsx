import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../utils/auth';
import {
  getAllImages, saveImage, deleteImage,
  getAllVideos, saveVideo, deleteVideo,
  fileToDataURL, generateVideoThumbnail, formatDuration,
} from '../utils/imageDB';
import {
  Upload, Trash2, LogOut, Camera, Play,
  Image as ImageIcon, Film, Plus,
  AlertTriangle, CheckCircle, X,
} from 'lucide-react';

const AdminDashboard = () => {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('images');
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, type: 'image'|'video' }
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedImages, storedVideos] = await Promise.all([
        getAllImages(),
        getAllVideos(),
      ]);
      setImages(storedImages);
      setVideos(storedVideos);
    } catch {
      showToast('Failed to load media', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- UPLOAD HANDLER ----
  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    let imgCount = 0;
    let vidCount = 0;

    try {
      const existingImages = await getAllImages();
      const existingVideos = await getAllVideos();
      let nextImgOrder = existingImages.length;
      let nextVidOrder = existingVideos.length;

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
        const id = `${isImage ? 'img' : 'vid'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        if (isImage) {
          const dataURL = await fileToDataURL(file);
          await saveImage({
            id, src: dataURL, title, location: '', aspect: 'landscape',
            order: nextImgOrder++, uploadedAt: new Date().toISOString(),
            fileSize: file.size, fileName: file.name,
          });
          imgCount++;
        } else {
          // Video: generate thumbnail + store video as data URL
          const videoDataURL = await fileToDataURL(file);
          let thumbInfo = { thumbnail: '', duration: 0, width: 0, height: 0 };
          try {
            thumbInfo = await generateVideoThumbnail(file);
          } catch {
            // Thumbnail generation may fail for some codecs
          }

          await saveVideo({
            id, src: videoDataURL, thumb: thumbInfo.thumbnail, title,
            duration: formatDuration(thumbInfo.duration),
            durationSec: thumbInfo.duration,
            order: nextVidOrder++, uploadedAt: new Date().toISOString(),
            fileSize: file.size, fileName: file.name,
          });
          vidCount++;
        }
      }

      await loadData();

      const parts = [];
      if (imgCount > 0) parts.push(`${imgCount} image${imgCount > 1 ? 's' : ''}`);
      if (vidCount > 0) parts.push(`${vidCount} video${vidCount > 1 ? 's' : ''}`);
      if (parts.length > 0) showToast(`${parts.join(' & ')} uploaded!`);
    } catch {
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInput = (e) => handleUpload(Array.from(e.target.files));

  const handleDelete = async (id, type) => {
    try {
      if (type === 'video') {
        await deleteVideo(id);
        setVideos((prev) => prev.filter((v) => v.id !== id));
      } else {
        await deleteImage(id);
        setImages((prev) => prev.filter((img) => img.id !== id));
      }
      setDeleteConfirm(null);
      showToast(`${type === 'video' ? 'Video' : 'Image'} deleted`);
    } catch {
      showToast('Delete failed', 'error');
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
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const currentItems = activeTab === 'images' ? images : videos;
  const totalCount = images.length + videos.length;

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-header-logo"><Camera size={20} /></div>
          <div>
            <h1 className="admin-header-title">Portfolio Manager</h1>
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
        {/* Upload Zone */}
        <div
          className={`admin-upload-zone ${dragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} className="hidden-input" multiple accept="image/*,video/*" onChange={handleFileInput} />
          {isUploading ? (
            <div className="upload-zone-content">
              <div className="admin-spinner large" />
              <p className="upload-zone-title">Uploading...</p>
            </div>
          ) : (
            <div className="upload-zone-content">
              <div className="upload-zone-icon"><Upload size={32} /></div>
              <p className="upload-zone-title">{dragActive ? 'Drop files here' : 'Upload Images & Videos'}</p>
              <p className="upload-zone-sub">Drag & drop or click • Images (JPG, PNG, WebP — max 10MB) • Videos (MP4, WebM — max 100MB)</p>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="admin-tab-bar">
          <button onClick={() => setActiveTab('images')} className={`admin-tab ${activeTab === 'images' ? 'admin-tab-active' : ''}`}>
            <ImageIcon size={16} /> Images <span className="admin-tab-count">{images.length}</span>
          </button>
          <button onClick={() => setActiveTab('videos')} className={`admin-tab ${activeTab === 'videos' ? 'admin-tab-active' : ''}`}>
            <Film size={16} /> Videos <span className="admin-tab-count">{videos.length}</span>
          </button>
        </div>

        {/* Content Grid */}
        {currentItems.length === 0 ? (
          <div className="admin-empty-state">
            {activeTab === 'images' ? <ImageIcon size={48} className="admin-empty-icon" /> : <Film size={48} className="admin-empty-icon" />}
            <h3 className="admin-empty-title">No {activeTab} yet</h3>
            <p className="admin-empty-sub">Upload your first {activeTab === 'images' ? 'image' : 'video'} to get started.</p>
            <button className="admin-empty-btn" onClick={() => fileInputRef.current?.click()}>
              <Plus size={16} /> Upload {activeTab === 'images' ? 'Image' : 'Video'}
            </button>
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
                  <div className="admin-image-overlay">
                    <button
                      className="admin-delete-btn"
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: item.id, type: activeTab === 'videos' ? 'video' : 'image' }); }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="admin-image-number">#{index + 1}</div>
                </div>
                <div className="admin-image-info">
                  <p className="admin-image-title">{item.title}</p>
                  <p className="admin-image-meta">{item.fileName && formatFileSize(item.fileSize)}</p>
                </div>
              </div>
            ))}

            <div className="admin-image-card admin-add-card" onClick={() => fileInputRef.current?.click()}>
              <div className="admin-add-content"><Plus size={32} /><span>Add More</span></div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon"><AlertTriangle size={32} /></div>
            <h3 className="admin-modal-title">Delete {deleteConfirm.type === 'video' ? 'Video' : 'Image'}?</h3>
            <p className="admin-modal-text">This action cannot be undone. The file will be permanently removed from your portfolio.</p>
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
