import { createSimpleLogger } from 'simple-node-logger';
import { Firestore } from '@google-cloud/firestore';
import { getFirestoreSessionStorage } from '../../firestore/firestoreSessionStorage';
import { initializeApp } from 'firebase-admin/app';
import { SessionInterface } from '@shopify/shopify-api';

initializeApp();
const firestoreClient = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
  ignoreUndefinedProperties: true,
});

const logger = createSimpleLogger();

const storage = getFirestoreSessionStorage(firestoreClient, logger);

const testSessionOnline: SessionInterface = {
  id: 'online_test-shop.myshopify.com',
  shop: 'test-shop.myshopify.com',
  state: 'test-state',
  isOnline: true,
  scope: 'read_products',
  accessToken: '1234567890',
  isActive: () => true,
  onlineAccessInfo: {
    expires_in: 1234567890,
    associated_user_scope: 'read_products',
    associated_user: {
      id: 1234567890,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@gmail.com',
      email_verified: true,
      account_owner: true,
      locale: 'en',
      collaborator: false,
    },
  },
};
const { isActive: _1, ...wantSessionOnline } = testSessionOnline;

const testSessionOffline: SessionInterface = {
  id: 'offline_test-shop.myshopify.com',
  shop: 'test-shop.myshopify.com',
  state: 'test-state',
  isOnline: false,
  scope: 'read_products',
  accessToken: '1234567890',
  isActive: () => true,
};
const { isActive: _2, ...wantSessionOffline } = testSessionOffline;

const testSessionAnother: SessionInterface = {
  id: 'offline_another-test-shop.myshopify.com',
  shop: 'another-test-shop.myshopify.com',
  state: 'another-test-state',
  isOnline: false,
  scope: 'read_products',
  accessToken: '1234567890',
  isActive: () => true,
};
const { isActive: _3, ...wantSessionAnother } = testSessionAnother;

beforeEach(async () => {
  // Drop shopifyStores collection
  const collectionRef = firestoreClient.collection('shopifyStores');
  await firestoreClient.recursiveDelete(collectionRef);
});

test('store session', async () => {
  expect(await storage.storeSession(testSessionOffline)).toBe(true);
  expect(await storage.storeSession(testSessionOnline)).toBe(true);
  expect(await storage.storeSession(testSessionAnother)).toBe(true);

  const snapshot = await firestoreClient.collection('shopifyStores').get();

  expect(snapshot.docs.length).toBe(2);
  expect(snapshot.docs[0].data()).toEqual({
    sessions: {
      [wantSessionAnother.id]: wantSessionAnother,
    },
  });
  expect(snapshot.docs[1].data()).toEqual({
    sessions: {
      [wantSessionOffline.id]: wantSessionOffline,
      [wantSessionOnline.id]: wantSessionOnline,
    },
  });
});

test('load session - found', async () => {
  await storage.storeSession(testSessionOffline);
  await storage.storeSession(testSessionOnline);

  const got = await storage.loadSession(testSessionOffline.id);

  expect(got).toEqual(wantSessionOffline);
});

test('load session - not found', async () => {
  await storage.storeSession(testSessionAnother);
  await storage.storeSession(testSessionOnline);

  const got = await storage.loadSession(testSessionOffline.id);

  expect(got).toBeUndefined();
});

test('delete session - found', async () => {
  await storage.storeSession(testSessionOffline);
  await storage.storeSession(testSessionOnline);

  expect(await storage.deleteSession(testSessionOffline.id)).toBe(true);

  const doc = await firestoreClient.collection('shopifyStores').doc(testSessionOffline.shop).get();

  expect(doc.exists).toBe(true);
  expect(doc.data()).toEqual({
    sessions: {
      [wantSessionOnline.id]: wantSessionOnline,
    },
  });
});

test('delete session - not found', async () => {
  await storage.storeSession(testSessionOffline);
  await storage.storeSession(testSessionOnline);

  expect(await storage.deleteSession(testSessionAnother.id)).toBe(false);

  const doc = await firestoreClient.collection('shopifyStores').doc(testSessionOffline.shop).get();

  expect(doc.exists).toBe(true);
  expect(doc.data()).toEqual({
    sessions: {
      [wantSessionOnline.id]: wantSessionOnline,
      [wantSessionOffline.id]: wantSessionOffline,
    },
  });
});

test('delete sessions', async () => {
  await storage.storeSession(testSessionOffline);
  await storage.storeSession(testSessionOnline);
  await storage.storeSession(testSessionAnother);

  expect(await storage.deleteSessions([testSessionAnother.id, testSessionOffline.id])).toBe(true);

  const doc = await firestoreClient.collection('shopifyStores').doc(testSessionOffline.shop).get();

  expect(doc.exists).toBe(true);
  expect(doc.data()).toEqual({
    sessions: {
      [wantSessionOnline.id]: wantSessionOnline,
    },
  });
});

test('find sessions by shop', async () => {
  await storage.storeSession(testSessionOffline);
  await storage.storeSession(testSessionOnline);

  const got = await storage.findSessionsByShop('test-shop.myshopify.com');

  expect(got).toEqual([wantSessionOffline, wantSessionOnline]);
});
