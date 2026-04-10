import { FedaPay, Webhook } from 'fedapay';
import admin from 'firebase-admin';

// ─── Initialisation Firebase Admin ────────────────────────────────────────────
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : '',
      }),
    });
    console.log('🔥 Firebase Admin initialisé (Webhook FedaPay)');
  } catch (error) {
    console.error('Erreur initialisation Firebase Admin:', error.stack);
  }
}

/**
 * Endpoint: POST /api/fedapay-webhook
 *
 * Reçoit les événements FedaPay, vérifie la signature HMAC,
 * puis met à jour la commande correspondante dans Firestore.
 *
 * ⚠️  IMPORTANT : Cet endpoint doit recevoir le body RAW (Buffer).
 *     Sur Vercel, désactiver le body-parser pour cette route via la config ci-dessous.
 */

// Désactiver le body-parser automatique de Vercel pour cette route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Utilitaire pour lire le body brut (nécessaire pour la vérification HMAC)
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // ─── Gestion de la redirection navigateur (GET) ───────────────────────────
  // FedaPay peut rediriger le client vers cette URL avec des params query.
  if (req.method === 'GET') {
    const { status, id, orderId } = req.query;
    console.log(`[FedaPay Webhook] Redirection navigateur reçue: status=${status}, orderId=${orderId}`);

    if (status === 'approved') {
      return res.redirect(`/success?orderId=${orderId}&transaction_id=${id}`);
    } else {
      return res.redirect(`/payment-cancelled?orderId=${orderId}`);
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const FEDAPAY_WEBHOOK_SECRET = process.env.FEDAPAY_WEBHOOK_SECRET;
  const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;
  const FEDAPAY_ENVIRONMENT = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';

  if (!FEDAPAY_WEBHOOK_SECRET) {
    console.error('[FedaPay Webhook] CRITICAL: FEDAPAY_WEBHOOK_SECRET manquant !');
    return res.status(500).json({ error: 'Configuration webhook manquante.' });
  }

  if (!FEDAPAY_SECRET_KEY) {
    console.error('[FedaPay Webhook] CRITICAL: FEDAPAY_SECRET_KEY manquant !');
    return res.status(500).json({ error: 'Configuration API FedaPay manquante.' });
  }

  // ─── 1. Lire le body brut ─────────────────────────────────────────────────
  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    return res.status(400).json({ error: 'Impossible de lire le corps de la requête.' });
  }

  // ─── 2. Vérifier la signature FedaPay ────────────────────────────────────
  const signature = req.headers['x-fedapay-signature'];
  if (!signature) {
    console.error('[FedaPay Webhook] En-tête X-FEDAPAY-SIGNATURE manquant.');
    return res.status(400).json({ error: 'Signature manquante.' });
  }

  let event;
  try {
    FedaPay.setApiKey(FEDAPAY_SECRET_KEY);
    FedaPay.setEnvironment(FEDAPAY_ENVIRONMENT);

    event = Webhook.constructEvent(
      rawBody,
      signature,
      FEDAPAY_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`[FedaPay Webhook] Signature invalide (Secret used: ...${FEDAPAY_WEBHOOK_SECRET.slice(-4)}) :`, err.message);
    // On peut retourner 400 pour que FedaPay réessaie, ou 202 pour arrêter les relances si on suspecte une config erreur
    return res.status(400).json({ error: `Signature invalide : ${err.message}` });
  }

  console.log(`[FedaPay Webhook] Événement reçu : ${event.name}`);

  // ─── 3. Traitement des événements ─────────────────────────────────────────
  try {
    const db = admin.firestore();

    // Récupération de l'orderId stocké dans custom_metadata lors de la création
    const transactionData = event.entity; // Objet transaction FedaPay
    let orderId = null;

    // custom_metadata est un JSON stringifié
    if (transactionData?.custom_metadata) {
      try {
        const meta = JSON.parse(transactionData.custom_metadata);
        orderId = meta.orderId;
      } catch (_) {
        console.warn('[FedaPay Webhook] Impossible de parser custom_metadata.');
      }
    }

    if (!orderId) {
      console.error('[FedaPay Webhook] orderId introuvable dans custom_metadata.');
      // On répond 200 pour ne pas déclencher les relances FedaPay
      return res.status(200).json({ received: true, warning: 'orderId introuvable' });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.error(`[FedaPay Webhook] Commande ${orderId} introuvable dans Firestore.`);
      return res.status(200).json({ received: true, warning: 'Commande introuvable' });
    }

    // ─── Paiement approuvé ───────────────────────────────────────────────────
    if (event.name === 'transaction.approved') {
      await orderRef.update({
        paymentStatus: 'Payé',
        status: 'En préparation',
        fedapayTransactionId: transactionData.id ? String(transactionData.id) : 'N/A',
        fedapayReference: transactionData.reference || 'N/A',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✅ [FedaPay Webhook] Commande ${orderId} marquée PAYÉE.`);
    }

    // ─── Paiement décliné / annulé / expiré ─────────────────────────────────
    else if (
      event.name === 'transaction.declined' ||
      event.name === 'transaction.canceled' ||
      event.name === 'transaction.expired'
    ) {
      await orderRef.update({
        paymentStatus: 'Échec de paiement',
        fedapayEvent: event.name,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`❌ [FedaPay Webhook] Commande ${orderId} : ${event.name}.`);
    }

    // ─── Autres événements (ignorés) ─────────────────────────────────────────
    else {
      console.log(`[FedaPay Webhook] Événement non géré : ${event.name}. Ignoré.`);
    }

    // FedaPay attend un 200 pour ne pas renvoyer l'événement
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('[FedaPay Webhook] Erreur traitement :', error.message);
    return res.status(500).json({ error: error.message });
  }
}
