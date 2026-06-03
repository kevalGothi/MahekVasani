import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Helper to parse JSON body
function getBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url.startsWith('/api/')) {
            res.setHeader('Content-Type', 'application/json');

            // Parse URL safely to extract pathname (strips query parameters like ?t=123)
            const parsedUrl = new URL(req.url, 'http://localhost');
            const pathname = parsedUrl.pathname;

            // 1. Check if local development mode is active
            if (pathname === '/api/dev-status') {
              res.end(JSON.stringify({ isLocalDev: true }));
              return;
            }

            // 2. Save settings
            if (pathname === '/api/save-settings' && req.method === 'POST') {
              const body = await getBody(req);
              const configPath = path.join(__dirname, 'src/data/portfolioConfig.json');
              
              let currentConfig = { siteConfig: {}, photos: [], videos: [] };
              if (fs.existsSync(configPath)) {
                currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
              }
              
              currentConfig.siteConfig = body.siteConfig;
              fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf8');
              
              res.end(JSON.stringify({ success: true }));
              return;
            }

            // 3. Reset settings to default
            if (pathname === '/api/reset-settings' && req.method === 'POST') {
              const configPath = path.join(__dirname, 'src/data/portfolioConfig.json');
              const defaults = {
                siteConfig: {
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
                },
                photos: [],
                videos: []
              };
              fs.writeFileSync(configPath, JSON.stringify(defaults, null, 2), 'utf8');
              res.end(JSON.stringify({ success: true }));
              return;
            }

            // 4. Upload photo or video
            if (pathname === '/api/upload-media' && req.method === 'POST') {
              const body = await getBody(req);
              const { fileName, fileType, dataUrl, thumbDataUrl, title, location, aspect, mediaType, duration } = body;
              
              if (!dataUrl) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing dataUrl' }));
                return;
              }

              const isImage = mediaType === 'image';
              const uniqueId = `${isImage ? 'img' : 'vid'}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
              const ext = fileName.split('.').pop() || (isImage ? 'jpg' : 'mp4');
              const newFileName = `${uniqueId}.${ext}`;
              
              const relativeDest = isImage ? `images/${newFileName}` : `videos/${newFileName}`;
              const absoluteDest = path.join(__dirname, 'public', relativeDest);
              
              // Write main file
              const base64Data = dataUrl.split(';base64,').pop();
              fs.writeFileSync(absoluteDest, Buffer.from(base64Data, 'base64'));
              
              let relativeThumb = '';
              // Write thumbnail if video and client-generated thumbnail exists
              if (!isImage && thumbDataUrl) {
                relativeThumb = `videos/${uniqueId}-thumb.jpg`;
                const absoluteThumb = path.join(__dirname, 'public', relativeThumb);
                const thumbBase64 = thumbDataUrl.split(';base64,').pop();
                fs.writeFileSync(absoluteThumb, Buffer.from(thumbBase64, 'base64'));
              }
              
              // Update config file
              const configPath = path.join(__dirname, 'src/data/portfolioConfig.json');
              let currentConfig = { siteConfig: {}, photos: [], videos: [] };
              if (fs.existsSync(configPath)) {
                currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
              }
              
              if (isImage) {
                const newPhoto = {
                  id: uniqueId,
                  src: `/${relativeDest}`,
                  title: title || 'Untitled',
                  location: location || '',
                  aspect: aspect || 'landscape'
                };
                currentConfig.photos.push(newPhoto);
              } else {
                const newVideo = {
                  id: uniqueId,
                  thumb: relativeThumb ? `/${relativeThumb}` : '',
                  title: title || 'Untitled',
                  duration: duration || '0:00',
                  videoSrc: `/${relativeDest}`
                };
                currentConfig.videos.push(newVideo);
              }
              
              fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf8');
              res.end(JSON.stringify({ success: true, id: uniqueId }));
              return;
            }

            // 5. Delete photo or video
            if (pathname === '/api/delete-media' && req.method === 'POST') {
              const body = await getBody(req);
              const { id, type } = body;
              
              const configPath = path.join(__dirname, 'src/data/portfolioConfig.json');
              if (fs.existsSync(configPath)) {
                const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                let itemToDelete = null;
                
                if (type === 'video') {
                  itemToDelete = currentConfig.videos.find(v => v.id === id);
                  currentConfig.videos = currentConfig.videos.filter(v => v.id !== id);
                } else {
                  itemToDelete = currentConfig.photos.find(p => p.id === id);
                  currentConfig.photos = currentConfig.photos.filter(p => p.id !== id);
                }
                
                // Delete actual files from disk
                if (itemToDelete) {
                  try {
                    if (type === 'video') {
                      const videoPath = path.join(__dirname, 'public', itemToDelete.videoSrc);
                      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
                      if (itemToDelete.thumb) {
                        const thumbPath = path.join(__dirname, 'public', itemToDelete.thumb);
                        if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
                      }
                    } else {
                      const imgPath = path.join(__dirname, 'public', itemToDelete.src);
                      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                    }
                  } catch (err) {
                    console.error('Error deleting physical file:', err);
                  }
                }
                
                fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf8');
              }
              res.end(JSON.stringify({ success: true }));
              return;
            }
          }
          next();
        });
      }
    }
  ]
});
