export const CONFIG = {
  IMAGE_MAX_MB: 8,
  IMAGE_MAX_BYTES: 8 * 1024 * 1024,
  ACCEPTED_MIME: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  THREADS_PER_PAGE: 15,
  POSTS_PER_PAGE: 100,
  BUMP_LIMIT: 350, // stop bumping after this many replies
  THUMB_SIZE: 250, // thumbnail max dimension
  S3_BUCKET: process.env.FORUM_BUCKET || 'basement-forum',
  SERVER_SALT: process.env.FORUM_SERVER_SALT || 'change-me-in-production',
  CDN_BASE: process.env.FORUM_CDN_BASE || '',
  RATE_LIMIT_POST_SECONDS: 10,
  RATE_LIMIT_BURST: 3,
};

export const BOARD_INFO: Record<
  string,
  { title: string; about: string; color: string }
> = {
  g: {
    title: 'Technology',
    about: 'Technology discussion board',
    color: '#06b6d4',
  },
  biz: {
    title: 'Business & Finance',
    about: 'Discussion about business, crypto, and finance',
    color: '#10b981',
  },
  a: {
    title: 'Anime & Manga',
    about: 'Anime and manga discussion',
    color: '#ec4899',
  },
  b: {
    title: 'Random',
    about: 'Random discussion - anything goes (within rules)',
    color: '#8b5cf6',
  },
};

