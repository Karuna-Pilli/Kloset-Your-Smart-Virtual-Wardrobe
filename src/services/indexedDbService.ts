/**
 * IndexedDB Service for Kloset
 * - Provides massive (gigabyte-scale) offline local storage for wardrobe items and photos
 * - Completely avoids browser localStorage 5MB quota errors
 */

import { WardrobeItem } from '../types';

const DB_NAME = 'kloset_wardrobe_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'wardrobe_items';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

export const indexedDbService = {
  async saveAllItems(items: WardrobeItem[]): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Clear old items and write new ones
      await new Promise<void>((resolve, reject) => {
        const clearReq = store.clear();
        clearReq.onsuccess = () => resolve();
        clearReq.onerror = () => reject(clearReq.error);
      });

      for (const item of items) {
        store.put(item);
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB saveAllItems failed, fallback in place:', err);
    }
  },

  async getAllItems(): Promise<WardrobeItem[] | null> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const res = request.result;
          resolve(res && res.length > 0 ? res : null);
        };
        request.onerror = () => {
          resolve(null);
        };
      });
    } catch (err) {
      console.warn('IndexedDB getAllItems failed:', err);
      return null;
    }
  },

  async saveItem(item: WardrobeItem): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(item);
    } catch (err) {
      console.warn('IndexedDB saveItem error:', err);
    }
  },

  async deleteItem(id: string): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
    } catch (err) {
      console.warn('IndexedDB deleteItem error:', err);
    }
  },
};
