// filepath: /Users/venishakalola/Desktop/spit/Hackhounds/crce_temp/src/utils/indexedDB.js
import { openDB } from 'idb';

const DB_NAME = 'workflowDB';
const STORE_NAME = 'workflows';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const saveWorkflowToDB = async (workflow) => {
  const db = await initDB();
  await db.put(STORE_NAME, workflow);
};

export const getWorkflowsFromDB = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const deleteWorkflowFromDB = async (id) => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};