import { FedaPay, Payout } from 'fedapay';
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
    console.log('🔥 Firebase Admin initialisé (Retrait FedaPay)');
  } catch (error) {
    console.error('Erreur initialisation Firebase Admin:', error.stack);
  }
}

/**
 * Endpoint: POST /api/withdraw
 *
 * Initie un retrait (Payout) vers un compte Mobile Money via FedaPay.
 * Enregistre la demande de retrait dans Firestore.
 *
 * Body attendu :
 * {
 *   amount    : number  (montant en FCFA, sans les frais)
 *   phone     : string  (numéro Mobile Money, ex: +22890000000)
 *   network   : string  (ex: "MOOV_TG", "TOGOCEL_TG")
 *   adminId   : string  (UID de l'admin, pour le log)
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, phone, network, adminId } = req.body;

  if (!amount || !phone || !network) {
    return res.status(400).json({ error: 'Paramètres manquants (amount, phone, network requis).' });
  }

  const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;
  const FEDAPAY_ENVIRONMENT = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';

  if (!FEDAPAY_SECRET_KEY) {
    return res.status(500).json({ error: 'Configuration FedaPay manquante.' });
  }

  FedaPay.setApiKey(FEDAPAY_SECRET_KEY);
  FedaPay.setEnvironment(FEDAPAY_ENVIRONMENT);

  // Nettoyage du numéro de téléphone
  const cleanPhone = phone.replace(/[^0-9]/g, '').replace(/^228/, '').slice(0, 8);

  try {
    // ─── 1. Créer le Payout FedaPay ──────────────────────────────────────────
    const payout = await Payout.create({
      amount: Math.round(amount),
      currency: { iso: 'XOF' },
      mode: network, // Ex: "MOOV_TG" ou "TOGOCEL_TG"
      customer: {
        phone_number: {
          number: cleanPhone,
          country: 'tg',
        },
      },
    });

    // ─── 2. Soumettre (envoyer) le Payout ────────────────────────────────────
    await payout.sendNow();

    console.log(`[FedaPay Payout] Retrait ${payout.id} initié pour ${amount} FCFA → ${phone}`);

    // ─── 3. Enregistrer dans Firestore ───────────────────────────────────────
    const db = admin.firestore();
    await db.collection('withdrawals').add({
      fedapayPayoutId: String(payout.id),
      amount,
      phone,
      network,
      adminId: adminId || 'unknown',
      status: payout.status || 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      payout_id: payout.id,
      status: payout.status,
      message: `Retrait de ${amount} FCFA initié avec succès.`,
    });
  } catch (error) {
    console.error('[FedaPay Payout] Erreur :', error.message, error.errors || '');
    return res.status(500).json({ error: error.message });
  }
}
