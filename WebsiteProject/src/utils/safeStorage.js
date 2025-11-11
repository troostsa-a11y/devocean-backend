/**
 * Safe storage wrappers for localStorage and sessionStorage
 * 
 * Protects against:
 * - Private/Incognito mode (SecurityError)
 * - Embedded browsers (Facebook, Instagram, WhatsApp in-app)
 * - Strict privacy settings
 * - Storage quota exceeded
 * - Disabled storage
 * 
 * Falls back gracefully to null/no-op when storage is unavailable
 */

const createSafeStorage = (storage) => ({
  getItem: (key) => {
    try {
      return storage.getItem(key);
    } catch (e) {
      // Silent fail - return null (same as "not found")
      return null;
    }
  },
  
  setItem: (key, value) => {
    try {
      storage.setItem(key, value);
      return true;
    } catch (e) {
      // Silent fail - storage unavailable or quota exceeded
      return false;
    }
  },
  
  removeItem: (key) => {
    try {
      storage.removeItem(key);
      return true;
    } catch (e) {
      // Silent fail
      return false;
    }
  },
  
  clear: () => {
    try {
      storage.clear();
      return true;
    } catch (e) {
      // Silent fail
      return false;
    }
  }
});

// Safe wrappers for localStorage and sessionStorage
export const safeLocalStorage = createSafeStorage(typeof window !== 'undefined' ? window.localStorage : {
  getItem: () => null,
  setItem: () => false,
  removeItem: () => false,
  clear: () => false
});

export const safeSessionStorage = createSafeStorage(typeof window !== 'undefined' ? window.sessionStorage : {
  getItem: () => null,
  setItem: () => false,
  removeItem: () => false,
  clear: () => false
});
