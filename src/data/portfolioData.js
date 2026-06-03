// ============================================================
// PORTFOLIO DATA - Edit this file to configure your portfolio!
// ============================================================
//
// HOW TO ADD PHOTOS:
// 1. Drop your image files into /public/images/
// 2. Name them: img1.jpg, img2.jpg, img3.jpg, etc.
// 3. Add an entry below for each image with title & location
//
// HOW TO ADD VIDEOS:
// 1. Drop video thumbnails into /public/videos/ (vid1.jpg, etc.)
// 2. Optionally add video files (vid1.mp4, etc.)
// 3. Add entries in the videos array below
// ============================================================

// ---- YOUR INFO ----
export const SITE_CONFIG = {
  name: "Nature.Lens", // Your brand/site name
  tagline: "Earth & Light", // Hero tagline
  subtitle: "Wilderness Photography by Mahek", // Hero subtitle
  aboutTitle: "The Observer.",
  aboutText: `I spend my life chasing light across untouched landscapes. From the quiet mist of ancient pine forests to the roaring isolation of alpine peaks, my goal is to capture the raw, untamed essence of the earth.`,
  availableText: "Available for assignments worldwide.",
  email: "hello@naturelens.com",
  instagram: "@nature.lens",
  quote: '"In every walk with nature, one receives far more than he seeks."',
  quoteAuthor: "— John Muir",

  // ---- SOCIAL LINKS (CTA buttons) ----
  // Paste your actual URLs here. Leave empty to hide the button.
  instagramUrl: "https://instagram.com/nature.lens",
  youtubeUrl: "https://youtube.com/@naturelens",
};

// ---- YOUR PHOTOS ----
// Just add entries here. The `src` points to /public/images/
// Aspect: 'landscape' for wide shots, 'portrait' for tall shots
export const PHOTOS = [
  {
    id: 1,
    src: "/images/img1.jpg",
    title: "Misty Pines",
    location: "Pacific Northwest",
    aspect: "landscape",
  },
  {
    id: 2,
    src: "/images/img2.jpg",
    title: "Autumn Canopy",
    location: "Vermont",
    aspect: "portrait",
  },
  {
    id: 3,
    src: "/images/img3.jpg",
    title: "Deep Woods",
    location: "Black Forest",
    aspect: "landscape",
  },
  {
    id: 4,
    src: "/images/img4.jpg",
    title: "Fern Macro",
    location: "Hoh Rainforest",
    aspect: "portrait",
  },
  {
    id: 5,
    src: "/images/img5.jpg",
    title: "Morning Light",
    location: "Yosemite",
    aspect: "landscape",
  },
  {
    id: 6,
    src: "/images/img6.jpg",
    title: "Fox in the Wild",
    location: "Taiga",
    aspect: "portrait",
  },
  {
    id: 7,
    src: "/images/img7.jpg",
    title: "Alpine Waterfall",
    location: "Swiss Alps",
    aspect: "portrait",
  },
  {
    id: 8,
    src: "/images/img8.jpg",
    title: "Mountain Lake",
    location: "Banff",
    aspect: "landscape",
  },
];

// ---- YOUR VIDEOS ----
// Thumbnails go in /public/videos/, video files optional
export const VIDEOS = [
  {
    id: 1,
    thumb: "/videos/vid1.jpg",
    title: "The Awakening Forest (Short Film)",
    duration: "4:21",
    videoSrc: "/videos/vid1.mp4",
  },
  {
    id: 2,
    thumb: "/videos/vid2.jpg",
    title: "River Bends - Drone Reel",
    duration: "2:15",
    videoSrc: "/videos/vid2.mp4",
  },
  {
    id: 3,
    thumb: "/videos/vid3.jpg",
    title: "High Altitude",
    duration: "5:40",
    videoSrc: "/videos/vid3.mp4",
  },
];

// ---- HERO BACKGROUND ----
// Place a hero background image at /public/images/hero-bg.jpg
export const HERO_BG = "/images/hero-bg.jpg";

// ---- QUOTE SECTION BACKGROUND ----
// Place a parallax background at /public/images/quote-bg.jpg
export const QUOTE_BG = "/images/quote-bg.jpg";
