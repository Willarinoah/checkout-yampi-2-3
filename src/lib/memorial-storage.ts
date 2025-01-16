export interface MemorialData {
  coupleName: string;
  startDate: string;
  startTime: string;
  message: string;
  photos: string[];
  youtubeUrl?: string;
  plan: 'basic' | 'premium';
}

// In-memory fallback for preview environments
let memoryStorage: Record<string, MemorialData> = {};

const isPreviewEnvironment = () => {
  return window.location.hostname.includes('preview--') || 
         window.location.hostname.includes('localhost');
};

export const saveMemorialData = (slug: string, data: MemorialData): void => {
  try {
    if (isPreviewEnvironment()) {
      memoryStorage[slug] = data;
      return;
    }
    
    const memorials = getStoredMemorials();
    memorials[slug] = data;
    localStorage.setItem('memorials', JSON.stringify(memorials));
  } catch (error) {
    console.warn('Storage access failed, using memory fallback:', error);
    memoryStorage[slug] = data;
  }
};

export const getMemorialData = (slug: string): MemorialData | null => {
  try {
    if (isPreviewEnvironment()) {
      return memoryStorage[slug] || null;
    }

    const memorials = getStoredMemorials();
    return memorials[slug] || null;
  } catch (error) {
    console.warn('Storage access failed, using memory fallback:', error);
    return memoryStorage[slug] || null;
  }
};

const getStoredMemorials = (): Record<string, MemorialData> => {
  try {
    if (isPreviewEnvironment()) {
      return memoryStorage;
    }

    const stored = localStorage.getItem('memorials');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Storage access failed, using memory fallback:', error);
    return memoryStorage;
  }
};