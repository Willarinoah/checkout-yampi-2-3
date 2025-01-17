import slugify from 'slugify';
import { checkMemorialExists, createMemorial } from './memorial-data-utils';
import type { Memorial } from './memorial-data-utils';

export const generateSlug = (coupleName: string): string => {
  return slugify(coupleName, {
    lower: true,
    strict: true,
    trim: true,
    locale: 'pt'
  });
};

export const generateUniqueSlug = async (coupleName: string): Promise<string> => {
  let slug = generateSlug(coupleName);
  let isAvailable = !(await checkMemorialExists(slug));
  let counter = 1;

  while (!isAvailable) {
    slug = `${generateSlug(coupleName)}-${counter}`;
    isAvailable = !(await checkMemorialExists(slug));
    counter++;
  }

  return slug;
};

export const getPlanTypeFromSelection = (planType: "basic" | "premium"): "1 year, 3 photos and no music" | "Forever, 7 photos and music" => {
  return planType === "basic" 
    ? "1 year, 3 photos and no music" 
    : "Forever, 7 photos and music";
};

export const createNewMemorial = async (
  memorialData: Partial<Memorial> & { couple_name: string },
  isBrazil: boolean
): Promise<Memorial | null> => {
  try {
    console.log(`Creating memorial for ${isBrazil ? 'Brazil' : 'International'}:`, memorialData);
    
    const customSlug = await generateUniqueSlug(memorialData.couple_name);
    const memorial = await createMemorial({ ...memorialData, custom_slug: customSlug }, isBrazil);
    
    if (!memorial) {
      throw new Error('Failed to create memorial');
    }

    console.log('Successfully created memorial:', memorial);
    return memorial;
  } catch (error) {
    console.error('Error in create memorial flow:', error);
    throw error;
  }
};