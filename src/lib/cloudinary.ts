import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

/**
 * Upload image to Cloudinary
 * @param file - File path or URL
 * @param folder - Cloudinary folder name (e.g., 'apartments', 'gallery')
 * @param publicId - Optional custom public ID
 */
export async function uploadImage(
  file: string,
  folder: string = 'apartmani-jovca',
  publicId?: string
) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      public_id: publicId,
      resource_type: 'auto',
    })
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return {
      success: result.result === 'ok',
      result: result.result,
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

/**
 * Get optimized image URL
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 */
export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  }
) {
  return cloudinary.url(publicId, {
    fetch_format: options?.format || 'auto',
    quality: options?.quality || 'auto',
    width: options?.width,
    height: options?.height,
    crop: options?.crop || 'fill',
  })
}
