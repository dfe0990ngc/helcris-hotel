import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



// Helper function to check if URL is from Cloudinary
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (url: string): string | null => {
  try {
    // Handle both optimized and non-optimized URLs
    // Example: https://res.cloudinary.com/dkt49dvgv/image/upload/v1234567890/folder/image_name.jpg
    // Or: https://res.cloudinary.com/dkt49dvgv/image/upload/f_auto,q_auto/v1234567890/folder/image_name.jpg
    
    const regex = /\/upload\/(?:[^/]+\/)*(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      // Remove any transformations and version number
      let publicId = match[1];
      
      // If there are transformations like f_auto,q_auto, remove them
      if (publicId.includes('/')) {
        const parts = publicId.split('/');
        // Get the last part which should be the actual public_id
        publicId = parts[parts.length - 1];
      }
      
      return publicId;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

export const deleteCloudinaryImageClientSide = async (imageUrl: string): Promise<void> => {
  try {
    const publicId = extractPublicId(imageUrl);
    
    if (!publicId) {
      console.warn('Could not extract public_id from URL:', imageUrl);
      return;
    }

    // WARNING: This exposes your API credentials on the client-side
    // Only use this for development or if you have proper security measures
    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiKey = '286571625442748'; // Move to environment variables
    const apiSecret = 'i-wgXbGC3oFWozzwuuhhYohIYc0'; // Move to environment variables
    
    // Create signature for authenticated request
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = await crypto.subtle.digest(
      'SHA-1',
      new TextEncoder().encode(stringToSign)
    );
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', hashHex);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dkt49dvgv/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    
    if (result.result === 'ok') {
      console.log('Old image deleted successfully');
    } else {
      console.warn('Failed to delete old image:', result);
    }
  } catch (error) {
    console.error('Error deleting old image:', error);
  }
};