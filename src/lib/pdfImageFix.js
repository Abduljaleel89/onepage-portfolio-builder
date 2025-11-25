/**
 * Fix image orientation for PDF generation
 * This utility processes images to ensure correct orientation in PDFs
 */

/**
 * Process image to fix EXIF orientation before PDF generation
 * @param {string} imageSrc - Image source (data URL or URL)
 * @returns {Promise<string>} - Processed image as data URL
 */
export async function processImageForPDF(imageSrc) {
  if (!imageSrc || typeof imageSrc !== "string") {
    return imageSrc;
  }

  // If it's not a data URL, return as-is (URLs should work fine)
  if (!imageSrc.startsWith("data:")) {
    return imageSrc;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // Set canvas to image dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image - browser automatically handles EXIF orientation
          ctx.drawImage(img, 0, 0);
          
          // Convert to JPEG data URL (better compression for PDF)
          const fixedImage = canvas.toDataURL("image/jpeg", 0.92);
          resolve(fixedImage);
        } catch (err) {
          console.warn("Error processing image for PDF:", err);
          // Return original if processing fails
          resolve(imageSrc);
        }
      };
      
      img.onerror = () => {
        // Return original if load fails
        resolve(imageSrc);
      };
      
      img.src = imageSrc;
    } catch (err) {
      console.warn("Error in processImageForPDF:", err);
      resolve(imageSrc);
    }
  });
}

