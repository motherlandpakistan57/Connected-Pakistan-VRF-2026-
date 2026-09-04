// IndexedDB helper for Briefing Cinema video persistence
// Database: cp_media, Store: videos, Key: brief

const DB_NAME = 'cp_media';
const DB_VERSION = 1;
const STORE_NAME = 'videos';
const BRIEF_KEY = 'brief';

export async function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveBriefingVideo(file: Blob, fileName: string): Promise<void> {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record = {
      blob: file,
      name: fileName,
      type: file.type,
      updatedAt: new Date().toISOString(),
    };

    const putRequest = store.put(record, BRIEF_KEY);

    putRequest.onsuccess = () => resolve();
    putRequest.onerror = () => reject(putRequest.error);
  });
}

export async function getBriefingVideo(): Promise<{ blob: Blob; name: string; type: string } | null> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getRequest = store.get(BRIEF_KEY);

      getRequest.onsuccess = () => {
        if (getRequest.result) {
          resolve(getRequest.result);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (err) {
    console.warn('Failed to load video from IndexedDB:', err);
    return null;
  }
}

export async function deleteBriefingVideo(): Promise<void> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const deleteRequest = store.delete(BRIEF_KEY);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  } catch (err) {
    console.warn('Failed to delete video from IndexedDB:', err);
  }
}
