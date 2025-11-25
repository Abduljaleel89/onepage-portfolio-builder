/**
 * Image utility functions for handling orientation and processing
 */

/**
 * Fix image orientation by creating a new image with correct orientation
 * This handles EXIF orientation data that causes rotation issues
 */
export async function fixImageOrientation(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image (browser automatically handles EXIF orientation)
        ctx.drawImage(img, 0, 0);
        
        // Convert to data URL
        const fixedImage = canvas.toDataURL("image/jpeg", 0.9);
        resolve(fixedImage);
      } catch (err) {
        console.error("Error fixing image orientation:", err);
        // Return original if processing fails
        resolve(imageSrc);
      }
    };
    
    img.onerror = (err) => {
      console.error("Error loading image:", err);
      // Return original if load fails
      resolve(imageSrc);
    };
    
    img.src = imageSrc;
  });
}

/**
 * Check if image is a data URL
 */
export function isDataUrl(url) {
  return typeof url === "string" && url.startsWith("data:");
}

/**
 * Check if image is a local file path
 */
export function isLocalPath(url) {
  return typeof url === "string" && (url.startsWith("/") || url.startsWith("./"));
}

