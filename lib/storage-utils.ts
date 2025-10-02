import supabase from './supabase';

/**
 * Get a signed URL for downloading a file from storage
 * @param bucket - Storage bucket name
 * @param path - File path in the bucket
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns Signed URL or null if error
 */
export const getSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session');
      return null;
    }

    const response = await fetch('/api/storage/signed-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ bucket, path, expiresIn }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error getting signed URL:', error);
      return null;
    }

    const data = await response.json();
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getSignedUrl:', error);
    return null;
  }
};

/**
 * Upload a file to storage using the secure API endpoint
 * @param bucket - Storage bucket name
 * @param path - File path in the bucket (must start with user_id/)
 * @param file - File to upload
 * @returns Object with path and signedUrl, or null if error
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<{ path: string; signedUrl: string } | null> => {
  try {
    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', path);

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error uploading file:', error);
      return null;
    }

    const data = await response.json();
    return { path: data.path, signedUrl: data.signedUrl };
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
};

/**
 * Extract storage path from a public or signed URL
 * @param url - The URL to parse
 * @param bucketName - The bucket name to look for
 * @returns Storage path or null if not found
 */
export const extractStoragePathFromUrl = (
  url: string,
  bucketName: string
): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf(bucketName);
    
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    return null;
  } catch (error) {
    console.error('Error parsing storage URL:', error);
    return null;
  }
};

