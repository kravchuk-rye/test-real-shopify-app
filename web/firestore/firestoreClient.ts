import { initializeApp } from 'firebase-admin/app';
import { Firestore } from 'firebase-admin/firestore';

export const firestoreCollections = {
  merchants: 'merchants',
  enabledItems: 'enabledItems',
  sessions: 'sessions',
};

initializeApp();
export const firestoreClient = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
  ignoreUndefinedProperties: true,
});
