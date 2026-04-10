import { FedaPay, Transaction } from 'fedapay';

/**
 * Endpoint: POST /api/fedapay-checkout
 *
 * Crée une transaction FedaPay et renvoie l'URL de paiement
 * vers laquelle rediriger le client.
 *
 * Body attendu :
 * {
 *   amount      : number  (montant en FCFA)
 *   orderId     : string  (identifiant unique de la commande, ex: MTK-123456)
 *   firstName   : string
 *   lastName    : string
 *   email       : string
 *   phone       : string
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, orderId, firstName, lastName, email, phone } = req.body;

  if (!amount || !orderId || !email) {
    return res.status(400).json({ error: 'Paramètres manquants (amount, orderId, email requis).' });
  }

  const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;
  const FEDAPAY_ENVIRONMENT = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';

  if (!FEDAPAY_SECRET_KEY) {
    console.error('[FedaPay] Clé secrète manquante.');
    return res.status(500).json({ error: 'Configuration paiement FedaPay manquante.' });
  }

  // Configuration du SDK
  FedaPay.setApiKey(FEDAPAY_SECRET_KEY);
  FedaPay.setEnvironment(FEDAPAY_ENVIRONMENT);

  try {
    // URL de base de l'application (pour les callbacks et redirections)
    // IMPORTANT : Configurez APP_URL=https://mystikdrinks.com sur Vercel
    const BASE_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://mystikdrinks.com';

    console.log(`[FedaPay Checkout] Utilisation de BASE_URL: ${BASE_URL}`);

    // Frais FedaPay approximatifs : 1.5% du montant (affichés côté frontend)
    // La transaction FedaPay est créée avec le montant HT, les frais sont à la charge du client
    // et seront affichés par FedaPay sur leur page de paiement.

    const transaction = await Transaction.create({
      description: `Commande Mystik #${orderId}`,
      amount: Math.round(amount),
      currency: { iso: 'XOF' },
      // URL appelée par FedaPay après le paiement (succès ou échec)
      callback_url: `${BASE_URL}/api/fedapay-webhook`,
      // URL de redirection après le paiement réussi
      redirect_url: `${BASE_URL}/success?orderId=${orderId}`,
      // URL de redirection si le client annule (si supporté par le SDK/API Checkout)
      cancel_url: `${BASE_URL}/payment-cancelled?orderId=${orderId}`,
      customer: {
        firstname: firstName || 'Client',
        lastname: lastName || 'Mystik',
        email: email,
        phone_number: phone
          ? {
              number: phone.replace(/[^0-9]/g, '').replace(/^228/, '').slice(0, 8),
              country: 'tg',
            }
          : undefined,
      },
      // On stocke notre ID de commande dans les metadata pour le retrouver dans le webhook
      custom_metadata: JSON.stringify({ orderId }),
    });

    // Génération du token de paiement
    const token = await transaction.generateToken();

    console.log(`[FedaPay] Transaction ${transaction.id} créée pour commande ${orderId}`);

    return res.status(200).json({
      success: true,
      transaction_id: transaction.id,
      // URL vers laquelle rediriger le client pour payer
      payment_url: token.url,
      // Frais indicatifs (1.5%) pour les afficher dans l'UI
      fees: Math.round(amount * 0.015),
    });
  } catch (error) {
    console.error('[FedaPay] Erreur création transaction:', error.message, error.errors || '');
    return res.status(500).json({
      error: error.message || 'Erreur lors de la création du paiement FedaPay.',
    });
  }
}
