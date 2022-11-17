import Shopify, { SessionInterface } from '@shopify/shopify-api';
import { DocumentReference } from 'firebase-admin/firestore';
import { firestoreClient, firestoreCollections } from './firestoreClient';

export function getFirestoreSessionStorage() {
  return new Shopify.Session.CustomSessionStorage(
    async function storeCallback(session) {
      try {
        const merchant = await getMerchantRef(session.shop);
        await merchant.collection(firestoreCollections.sessions).add({
          id: session.id,
          shop: session.shop,
          state: session.state,
          isOnline: session.isOnline,
          scope: session.scope,
          expires: session.expires,
          accessToken: session.accessToken,
          onlineAccessInfo: session.onlineAccessInfo,
        });

        return true;
      } catch (err) {
        // TODO use proper logger
        console.error(err);
        return false;
      }
    },
    async function loadCallback(id: string) {
      return (
        await firestoreClient
          .collectionGroup(firestoreCollections.sessions)
          .where('id', '==', id)
          .get()
      ).docs?.[0]?.data();
    },
    async function deleteCallback(id: string) {
      const sessionsQuery = firestoreClient
        .collectionGroup(firestoreCollections.sessions)
        .where('id', '==', id);

      if ((await sessionsQuery.count().get()).data().count === 0) {
        return false;
      }

      const sessionsSnapshot = await sessionsQuery.get();
      await Promise.all(
        sessionsSnapshot.docs.map((doc) => {
          return firestoreClient.doc(doc.ref.path).delete();
        })
      );

      return true;
    },
    async function deleteSessionsCallback(ids: string[]) {
      const sessionsQuery = firestoreClient
        .collectionGroup(firestoreCollections.sessions)
        .where('id', 'in', ids);

      if ((await sessionsQuery.count().get()).data().count === 0) {
        return false;
      }

      const sessionsSnapshot = await sessionsQuery.get();
      await Promise.all(
        sessionsSnapshot.docs.map((doc) => {
          return firestoreClient.doc(doc.ref.path).delete();
        })
      );

      return true;
    },
    async function findSessionsByShopCallback(shop: string) {
      const merchants = await firestoreClient
        .collection(firestoreCollections.merchants)
        .where('storeUrl', '==', shop)
        .get();

      if (merchants.empty) {
        return [];
      }

      const sessionsSnapshot = await merchants.docs[0]?.ref
        .collection(firestoreCollections.sessions)
        .get();
      const sessions = sessionsSnapshot.docs.map((doc) => doc.data()) as SessionInterface[];

      return sessions;
    }
  );
}

async function getMerchantRef(shopUrl: string): Promise<DocumentReference> {
  const merchants = await firestoreClient
    .collection(firestoreCollections.merchants)
    .where('storeUrl', '==', shopUrl)
    .get();

  if (merchants.size > 1) {
    throw new Error(
      'Could not store session: We have multiple merchant records in database. (This should never happen)'
    );
  }

  if (merchants.size === 1) {
    return merchants.docs[0].ref;
  }

  return await firestoreClient.collection(firestoreCollections.merchants).add({
    storeUrl: shopUrl,
    isActive: true,
    acceptedRyeTerms: false,
  });
}
