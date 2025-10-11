import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';
import { CONFIG } from './constants';
import { sanitizeFilename, getExtensionFromMime } from './sanitize';

/**
 * Storage abstraction layer
 * Currently uses local filesystem, can be swapped for S3-compatible storage
 */

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'forum');
const THUMB_DIR = path.join(process.cwd(), 'public', 'uploads', 'forum', 'thumbs');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(THUMB_DIR, { recursive: true });
}

/**
 * Upload original image
 * Returns URL to uploaded image
 */
export async function uploadOriginal(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<{ url: string; filename: string }> {
  await ensureDirectories();

  // Generate unique filename
  const hash = createHash('md5').update(buffer).digest('hex');
  const ext = getExtensionFromMime(mimeType);
  const timestamp = Date.now();
  const filename = `${timestamp}-${hash}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Strip EXIF data and save
  let processedBuffer = buffer;
  try {
    processedBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .withMetadata({
        exif: {}, // Remove EXIF data
      })
      .toBuffer();
  } catch (error) {
    console.error('Error processing image:', error);
    // Fall back to original buffer if processing fails
  }

  await fs.writeFile(filepath, processedBuffer);

  const url = `/uploads/forum/${filename}`;
  return { url, filename };
}

/**
 * Generate thumbnail from image
 * Returns URL to thumbnail
 */
export async function makeThumb(
  buffer: Buffer,
  originalFilename: string
): Promise<{ url: string; filename: string }> {
  await ensureDirectories();

  // Generate thumbnail filename
  const ext = path.extname(originalFilename);
  const base = path.basename(originalFilename, ext);
  const thumbFilename = `${base}_thumb${ext}`;
  const thumbPath = path.join(THUMB_DIR, thumbFilename);

  // Create thumbnail
  await sharp(buffer)
    .resize(CONFIG.THUMB_SIZE, CONFIG.THUMB_SIZE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .rotate() // Auto-rotate based on EXIF
    .withMetadata({
      exif: {}, // Remove EXIF data
    })
    .toBuffer()
    .then((thumb) => fs.writeFile(thumbPath, thumb));

  const url = `/uploads/forum/thumbs/${thumbFilename}`;
  return { url, filename: thumbFilename };
}

/**
 * Upload image with thumbnail
 * Returns URLs to both original and thumbnail
 */
export async function uploadImageWithThumb(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<{ imageUrl: string; thumbUrl: string }> {
  // Upload original
  const { url: imageUrl, filename } = await uploadOriginal(
    buffer,
    mimeType,
    originalName
  );

  // Generate thumbnail
  const { url: thumbUrl } = await makeThumb(buffer, filename);

  return { imageUrl, thumbUrl };
}

/**
 * Delete image and thumbnail
 */
export async function deleteImage(imageUrl: string, thumbUrl?: string): Promise<void> {
  try {
    // Delete original
    if (imageUrl) {
      const imagePath = path.join(process.cwd(), 'public', imageUrl);
      await fs.unlink(imagePath).catch(() => {});
    }

    // Delete thumbnail
    if (thumbUrl) {
      const thumbPath = path.join(process.cwd(), 'public', thumbUrl);
      await fs.unlink(thumbPath).catch(() => {});
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

    // Check dimensions (reasonable limits)
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

