const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Cloudinary Service
 * Reusable service for all image upload/delete operations.
 */

/**
 * Upload an image buffer to Cloudinary using streams.
 *
 * @param {Buffer} fileBuffer - The image file buffer.
 * @param {string} folder - The Cloudinary folder to store the image in.
 * @param {object} options - Additional Cloudinary upload options (e.g., transformations).
 * @returns {Promise<object>} Cloudinary upload response object containing url and public_id.
 */
const uploadImage = (fileBuffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      format: 'webp',
      quality: 'auto',
      resource_type: 'image',
    };

    const uploadOptions = { ...defaultOptions, ...options };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Replace an existing image in Cloudinary atomicaly.
 *
 * @param {string} oldPublicId - The public_id of the existing image.
 * @param {Buffer} newFileBuffer - The new image file buffer.
 * @param {string} folder - The Cloudinary folder.
 * @param {object} options - Additional Cloudinary upload options.
 * @returns {Promise<object>} New Cloudinary upload response.
 */
const replaceImage = async (oldPublicId, newFileBuffer, folder, options = {}) => {
  if (oldPublicId) {
    try {
      await deleteImage(oldPublicId);
    } catch (err) {
      console.warn(`Failed to delete old image ${oldPublicId}:`, err.message);
      // Proceed with upload even if deletion fails (could be already deleted)
    }
  }
  return uploadImage(newFileBuffer, folder, options);
};

/**
 * Delete an image from Cloudinary by public_id.
 *
 * @param {string} publicId - The Cloudinary public_id.
 * @returns {Promise<object>} Cloudinary destroy response.
 */
const deleteImage = async (publicId) => {
  if (!publicId) return null;
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

/**
 * Delete multiple images from Cloudinary.
 *
 * @param {Array<string>} publicIds - Array of Cloudinary public_ids.
 * @returns {Promise<object>} Cloudinary bulk destroy response.
 */
const deleteMultipleImages = async (publicIds) => {
  if (!publicIds || publicIds.length === 0) return null;
  
  // Cloudinary bulk deletion API can handle up to 100 public_ids
  const chunks = [];
  for (let i = 0; i < publicIds.length; i += 100) {
    chunks.push(publicIds.slice(i, i + 100));
  }

  const results = [];
  for (const chunk of chunks) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.api.delete_resources(chunk, (error, res) => {
          if (error) return reject(error);
          resolve(res);
        });
      });
      results.push(result);
    } catch (err) {
      console.warn('Batch image deletion failed:', err.message);
    }
  }
  return results;
};

/**
 * Generate an optimized URL for an existing Cloudinary image.
 *
 * @param {string} publicId - The Cloudinary public_id.
 * @param {object} transformations - E.g., { width: 800, height: 800, crop: 'fill' }
 * @returns {string} The transformed URL.
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
  if (!publicId) return null;
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...transformations,
  });
};

/**
 * Extract public_id from a standard Cloudinary URL.
 * Fallback helper if public_id was not explicitly stored.
 *
 * @param {string} url - Cloudinary secure URL.
 * @returns {string|null} The public_id.
 */
const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const fileWithExtension = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    
    // Removing extension
    const publicId = fileWithExtension.split('.')[0];
    
    // Check if there's a version string before the folder
    const preFolder = parts[parts.length - 3];
    if (preFolder && preFolder.startsWith('v')) {
      return `${folder}/${publicId}`;
    }
    
    // Adjust logic based on your exact Cloudinary folder setup if needed
    return `${folder}/${publicId}`;
  } catch (err) {
    console.error('Error extracting public_id from URL:', err);
    return null;
  }
};

module.exports = {
  uploadImage,
  replaceImage,
  deleteImage,
  deleteMultipleImages,
  getOptimizedUrl,
  extractPublicId,
};
