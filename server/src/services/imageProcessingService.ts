import sharp from 'sharp';
import { config } from '../config/index.js';
import { ImageQuality } from '../types/index.js';

export interface ProcessedImageResult {
  buffer: Buffer;
  imageQuality: ImageQuality;
}

export class ImageProcessingService {
  public static async processImage(
    buffer: Buffer,
    originalMimeType: string
  ): Promise<ProcessedImageResult> {
    // 1. Check size limit (max 10 MB)
    if (buffer.length > config.maxImageSizeBytes) {
      throw new Error(`Image size (${(buffer.length / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed size of 10 MB.`);
    }

    // 2. Check MIME type
    if (!config.allowedMimeTypes.includes(originalMimeType.toLowerCase())) {
      throw new Error(`Unsupported image type '${originalMimeType}'. Allowed formats: JPEG, PNG, WebP.`);
    }

    try {
      // 3. Inspect metadata with Sharp
      const metadata = await sharp(buffer).metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;

      let resized = false;
      let processedBuffer = buffer;

      // 4. Resize oversized image to max 1200px dimension
      const maxDim = 1200;
      if (width > maxDim || height > maxDim) {
        processedBuffer = await sharp(buffer)
          .resize({
            width: width > height ? maxDim : undefined,
            height: height >= width ? maxDim : undefined,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toBuffer();
        resized = true;
      }

      return {
        buffer: processedBuffer,
        imageQuality: {
          isValid: true,
          width,
          height,
          mimeType: originalMimeType,
          sizeBytes: buffer.length,
          resized,
          qualityNotes: resized
            ? 'Resized for payload optimization.'
            : 'Original dimensions suitable for analysis.',
        },
      };
    } catch (err) {
      throw new Error(`Image processing failed: ${err instanceof Error ? err.message : 'Invalid image stream'}`);
    }
  }
}
