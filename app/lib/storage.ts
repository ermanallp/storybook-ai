import { Story } from '@/types';

const DB_NAME = 'StoryBookDB';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };

        request.onsuccess = (event) => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

// We'll use a fixed ID for the "current" story for now, similar to how localStorage was used.
const CURRENT_STORY_ID = 'current_story';

export async function saveStory(story: Story): Promise<void> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Ensure the story has the fixed ID for simple retrieval
            const storyToSave = { ...story, id: CURRENT_STORY_ID };

            const request = store.put(storyToSave);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Failed to save story to IndexedDB:', error);
        throw error;
    }
}

export async function getStory(): Promise<Story | null> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(CURRENT_STORY_ID);

            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Failed to get story from IndexedDB:', error);
        return null; // Return null gracefully on error
    }
}
