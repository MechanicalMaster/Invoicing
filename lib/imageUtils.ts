/**
 * Utility functions for image processing
 */

/**
 * Compresses an image based on the specified compression level
 * @param file The image file to compress
 * @param compressionLevel The level of compression to apply
 * @returns A promise that resolves to the compressed file
 */
export async function compressImage(
  file: File,
  compressionLevel: 'none' | 'low' | 'medium' | 'high'
): Promise<File> {
  // If no compression is requested, return the original file
  if (compressionLevel === 'none') {
    return file;
  }

  // Determine the quality factor based on compression level
  const qualityFactor = {
    low: 0.75,
    medium: 0.50,
    high: 0.30
  }[compressionLevel];

  return new Promise((resolve, reject) => {
    try {
      // Create an image object
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        // Clean up the object URL
        URL.revokeObjectURL(img.src);

        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert canvas to Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }

            // Create a new File from the Blob
            const compressedFile = new File(
              [blob],
              `compressed_${file.name}`,
              {
                type: 'image/jpeg',
                lastModified: new Date().getTime()
              }
            );

            resolve(compressedFile);
          },
          'image/jpeg',
          qualityFactor
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
    } catch (error) {
      reject(error);
    }
  });
} 