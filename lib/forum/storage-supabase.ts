import { createHash } from 'crypto';
import sharp from 'sharp';
import { CONFIG } from './constants';
import { getExtensionFromMime } from './sanitize';

/**
 * Supabase Storage Adapter
 * Use this when SUPABASE_SERVICE_ROLE_KEY is available
 */

interface SupabaseClient {
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: Buffer, options?: any) => Promise<any>;
      remove: (paths: string[]) => Promise<any>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
}

let supabaseClient: SupabaseClient | null = null;

async function getSupabaseClient(): Promise<SupabaseClient> {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  // Dynamically import Supabase client
  const { createClient } = await import('@supabase/supabase-js');
  supabaseClient = createClient(supabaseUrl, supabaseKey);

  return supabaseClient;
}

/**
 * Upload original image to Supabase Storage
 */
export async function uploadOriginal(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<{ url: string; filename: string }> {
  const supabase = await getSupabaseClient();

  // Generate unique filename
  const hash = createHash('md5').update(buffer).digest('hex');
  const ext = getExtensionFromMime(mimeType);
  const timestamp = Date.now();
  const filename = `${timestamp}-${hash}.${ext}`;
  const filepath = `images/${filename}`;

  // Strip EXIF data
  let processedBuffer = buffer;
  try {
    processedBuffer = await sharp(buffer)
      .rotate()
      .withMetadata({ exif: {} })
      .toBuffer();
  } catch (error) {
    console.error('Error processing image:', error);
  }

  // Upload to Supabase
  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'forum-images';
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filepath, processedBuffer, {
      contentType: mimeType,
      cacheControl: '3600',
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filepath);

  return { url: data.publicUrl, filename };
}

/**
 * Generate and upload thumbnail
 */
export async function makeThumb(
  buffer: Buffer,
  originalFilename: string
): Promise<{ url: string; filename: string }> {
  const supabase = await getSupabaseClient();

  // Generate thumbnail filename
  const thumbFilename = originalFilename.replace(/\.[^.]+$/, '_thumb.jpg');
  const thumbPath = `thumbs/${thumbFilename}`;

  // Create thumbnail
  const thumbBuffer = await sharp(buffer)
    .resize(CONFIG.THUMB_SIZE, CONFIG.THUMB_SIZE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .rotate()
    .withMetadata({ exif: {} })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Upload thumbnail
  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'forum-images';
  const { error } = await supabase.storage
    .from(bucket)
    .upload(thumbPath, thumbBuffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
    });

  if (error) {
    throw new Error(`Thumbnail upload failed: ${error.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(thumbPath);

  return { url: data.publicUrl, filename: thumbFilename };
}

/**
 * Upload image with thumbnail
 */
export async function uploadImageWithThumb(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<{ imageUrl: string; thumbUrl: string }> {
  const { url: imageUrl, filename } = await uploadOriginal(
    buffer,
    mimeType,
    originalName
  );

  const { url: thumbUrl } = await makeThumb(buffer, filename);

  return { imageUrl, thumbUrl };
}

/**
 * Delete image and thumbnail from Supabase
 */
export async function deleteImage(imageUrl: string, thumbUrl?: string): Promise<void> {
  try {
    const supabase = await getSupabaseClient();
    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'forum-images';

    const pathsToDelete: string[] = [];

    if (imageUrl) {
      const imagePath = imageUrl.split(`/${bucket}/`)[1];
      if (imagePath) pathsToDelete.push(imagePath);
    }

    if (thumbUrl) {
      const thumbPath = thumbUrl.split(`/${bucket}/`)[1];
      if (thumbPath) pathsToDelete.push(thumbPath);
    }

    if (pathsToDelete.length > 0) {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(pathsToDelete);

      if (error) {
        console.error('Error deleting from Supabase:', error);
      }
    }
  } catch (error) {
    console.error('Error deleting images:', error);
  }
}

/**
 * Validate image buffer
 */
export async function validateImage(buffer: Buffer): Promise<{
  valid: boolean;
  error?: string;
  metadata?: sharp.Metadata;
}> {
  try {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.format) {
      return { valid: false, error: 'Unknown image format' };
    }

    const validFormats = ['jpeg', 'png', 'gif', 'webp'];
    if (!validFormats.includes(metadata.format)) {
      return { valid: false, error: 'Invalid image format' };
    }

    if (metadata.width && metadata.width > 10000) {
      return { valid: false, error: 'Image width too large' };
    }

    if (metadata.height && metadata.height > 10000) {
      return { valid: false, error: 'Image height too large' };
    }

    return { valid: true, metadata };
  } catch (error) {
    return { valid: false, error: 'Invalid or corrupted image' };
  }
}

