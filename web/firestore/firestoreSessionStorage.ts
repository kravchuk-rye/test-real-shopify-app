import { SessionInterface } from '@shopify/shopify-api';
import { CustomSessionStorage } from '@shopify/shopify-api/dist/auth/session/storage/custom';
import { FieldPath, FieldValue, Firestore } from 'firebase-admin/firestore';
import { Logger } from 'simple-node-logger';

const shopifyStoresCollectionName = 'shopifyStores';

export function getFirestoreSessionStorage(
  firestoreClient: Firestore,
  logger: Logger
): CustomSessionStorage {
  // Stores the session object
  async function storeCallback(session: SessionInterface): Promise<boolean> {
    try {
      await firestoreClient
        .collection(shopifyStoresCollectionName)
        .doc(session.shop)
        .set(
          {
            sessions: {
              [session.id]: {
                id: session.id,
                shop: session.shop,
                state: session.state,
                isOnline: session.isOnline,
                scope: session.scope,
                expires: session.expires,
                accessToken: session.accessToken,
                onlineAccessInfo: session.onlineAccessInfo,
              },
            },
          },
          { merge: true }
        );
    } catch (err) {
      // TODO: Integrate Sentry
      throw err;
    }

    logger.debug('Session stored: ', session.id);
    return true;
  }

  // Loads a session object
  async function loadCallback(id: string): Promise<SessionInterface | undefined> {
    let snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> | undefined;
    try {
      snapshot = await firestoreClient
        .collection(shopifyStoresCollectionName)
        .where(getSessionPath(id), '!=', null)
        .get();
    } catch (err) {
      // TODO: Integrate Sentry
      throw err;
    }

    if (snapshot.empty) {
      return undefined;
    }

    if (snapshot.docs.length > 1) {
      logger.error(
        `WARNING: More than one session found for id "${id}". The first one will be loaded!`
      );
    }

    const session = snapshot.docs[0].data()['sessions'][id];
    logger.debug('Session loaded: ', session.id);
    return session;
  }

  // Deletes the session object
  async function deleteCallback(id: string): Promise<boolean> {
    let snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> | undefined;
    try {
      snapshot = await firestoreClient
        .collection(shopifyStoresCollectionName)
        .where(getSessionPath(id), '!=', null)
        .get();
    } catch (err) {
      // TODO: Integrate Sentry
      throw err;
    }

    if (snapshot.empty) {
      return false;
    }

    if (snapshot.docs.length > 1) {
      logger.error(`WARNING: More than one session found for id "${id}". All will be deleted!`);
    }

    try {
      await Promise.all(
        snapshot.docs.map((doc) => {
          return firestoreClient.doc(doc.ref.path).update(getSessionPath(id), FieldValue.delete());
        })
      );
    } catch (err) {
      // TODO: Integrate Sentry
      throw err;
    }

    logger.debug('Session deleted: ', id);
    return true;
  }

  // Deletes multiple session objects
  async function deleteSessionsCallback(ids: string[]): Promise<boolean> {
    const results = await Promise.all(ids.map(deleteCallback));
    return results.some((result) => result);
  }

  // Finds all sessions for a shop
  async function findSessionsByShopCallback(shop: string): Promise<SessionInterface[]> {
    let sessions: SessionInterface[] = [];
    try {
      const doc = await firestoreClient.collection(shopifyStoresCollectionName).doc(shop).get();
      const docSessions = doc.data()?.sessions;
      if (docSessions) {
        sessions = Object.values(docSessions);
      }
    } catch (err) {
      // TODO: Integrate Sentry
      throw err;
    }

    logger.debug('Sessions loaded by shop: ', shop);
    return sessions;
  }

  return new CustomSessionStorage(
    storeCallback,
    loadCallback,
    deleteCallback,
    deleteSessionsCallback,
    findSessionsByShopCallback
  );
}

function getSessionPath(id: string): FieldPath {
  return new FieldPath('sessions', id);
}
