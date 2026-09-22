import { ItemCategory } from '../types';

export const DEFAULT_CATEGORIES: string[] = [
  'Top',
  'Bottom',
  'Dress',
  'Outerwear',
  'Footwear',
  'Bag',
  'Accessory',
  'Jewelry',
  'Traditional / Ethnic',
  'Swimwear',
  'Activewear',
  'Sleepwear',
  'Other',
];

const CATEGORIES_STORAGE_KEY = 'wardrobe_custom_categories_v2';

export const categoriesService = {
  getCategories(): string[] {
    try {
      const data = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (!data) return DEFAULT_CATEGORIES;
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_CATEGORIES;
    } catch (e) {
      console.warn('Failed to load custom categories:', e);
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(categories: string[]): void {
    try {
      const cleaned = Array.from(new Set(categories.map(c => c.trim()).filter(Boolean)));
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(cleaned.length > 0 ? cleaned : DEFAULT_CATEGORIES));
    } catch (e) {
      console.warn('Failed to save categories:', e);
    }
  },

  resetCategories(): string[] {
    this.saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
};
