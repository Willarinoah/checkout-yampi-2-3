import { createMemorial, checkMemorialExists } from './memorial-data-utils';
import type { Memorial } from './memorial-data-utils';
import { constructMemorialUrl, sanitizeBaseUrl } from './url-sanitizer';

export const generateUniqueSlug = async (coupleName: string): Promise<string> => {
  const baseSlug = generateSlug(coupleName);
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (await checkMemorialExists(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

export const createNewMemorial = async (
  memorialData: Partial<Memorial> & { couple_name: string },
  isBrazil: boolean
): Promise<Memorial | null> => {
  try {
    console.log(`Creating memorial for ${isBrazil ? 'Brazil' : 'International'}:`, memorialData);
    
    const customSlug = await generateUniqueSlug(memorialData.couple_name);
    const baseUrl = sanitizeBaseUrl(window.location.origin);
    const uniqueUrl = constructMemorialUrl(baseUrl, `/memorial/${customSlug}`);
    
    const memorial = await createMemorial({ 
      ...memorialData, 
      custom_slug: customSlug,
      unique_url: uniqueUrl
    }, isBrazil);
    
    if (!memorial) {
      throw new Error('Failed to create memorial');
    }

    return memorial;
  } catch (error) {
    console.error('Error in createNewMemorial:', error);
    throw error;
  }
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}