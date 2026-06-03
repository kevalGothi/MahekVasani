// ============================================================
// IndexedDB wrapper for storing portfolio images AND videos.
// Works like a tiny local database inside the browser.
// ============================================================

const DB_NAME = 'NatureLensPortfolio';
const DB_VERSION = 2; // Bumped to add videos store
const IMAGES_STORE = 'images';
const VIDEOS_STORE = 'videos';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        const store = db.createObjectStore(IMAGES_STORE, { keyPath: 'id' });
        store.createIndex('order', 'order', { unique: false });
      }
      if (!db.objectStoreNames.contains(VIDEOS_STORE)) {
        const store = db.createObjectStore(VIDEOS_STORE, { keyPath: 'id' });
        store.createIndex('order', 'order', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ---- GENERIC HELPERS ----

async function getAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result.sort((a, b) => a.order - b.order);
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
}

async function saveItem(storeName, record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteItem(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---- IMAGE FUNCTIONS ----

/** Get all images sorted by order */
export async function getAllImages() {
  return getAll(IMAGES_STORE);
}

/** Save a single image record */
export async function saveImage(imageRecord) {
  return saveItem(IMAGES_STORE, imageRecord);
}

/** Delete an image by id */
export async function deleteImage(id) {
  return deleteItem(IMAGES_STORE, id);
}

// ---- VIDEO FUNCTIONS ----

/** Get all videos sorted by order */
export async function getAllVideos() {
  return getAll(VIDEOS_STORE);
}

/** Save a single video record */
export async function saveVideo(videoRecord) {
  return saveItem(VIDEOS_STORE, videoRecord);
}

/** Delete a video by id */
export async function deleteVideo(id) {
  return deleteItem(VIDEOS_STORE, id);
}

// ---- UTILITIES ----

/** Convert a File object to a base64 data URL */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Generate a thumbnail from a video file using canvas */
export function generateVideoThumbnail(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadeddata = () => {
      // Seek to 1 second or 25% of duration
      video.currentTime = Math.min(1, video.duration * 0.25);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbDataURL = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(url);
      resolve({
        thumbnail: thumbDataURL,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };
  });
}

/** Format seconds into MM:SS */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
