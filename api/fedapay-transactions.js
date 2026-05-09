import { FedaPay, Transaction } from 'fedapay';

/**
 * Endpoint: GET /api/fedapay-transactions
 * 
 * Récupère les dernières transactions depuis FedaPay.
 * Paramètres query optionnels:
 *   - limit: nombre de transactions (défaut: 10, max: 50)
 *   - status: filtre par statut (approved, declined, pending, etc.)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;
  const FEDAPAY_ENVIRONMENT = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';

  if (!FEDAPAY_SECRET_KEY) {
    return res.status(500).json({ error: 'Configuration FedaPay manquante (FEDAPAY_SECRET_KEY).' });
  }

  const limit = Math.min(parseInt(req.query?.limit) || 10, 50);
  const statusFilter = req.query?.status || null;

  try {
    FedaPay.setApiKey(FEDAPAY_SECRET_KEY);
    FedaPay.setEnvironment(FEDAPAY_ENVIRONMENT);

    console.log(`[FedaPay Transactions] Récupération des transactions (limit ${limit})...`);

    // Le SDK FedaPay rejette certains params en query (400). On récupère sans filtres
    // et on tronque côté serveur.
    const transactionsList = await Transaction.all();

    // Parsing robuste similaire au balance
    let rawTransactions = [];
    if (Array.isArray(transactionsList)) {
      rawTransactions = transactionsList;
    } else if (transactionsList && typeof transactionsList === 'object') {
      if (Array.isArray(transactionsList.data)) {
        rawTransactions = transactionsList.data;
      } else if (Array.isArray(transactionsList.items)) {
        rawTransactions = transactionsList.items;
      } else if (typeof transactionsList.all === 'function') {
        const result = transactionsList.all();
        rawTransactions = Array.isArray(result) ? result : [];
      } else if (typeof transactionsList[Symbol.iterator] === 'function') {
        rawTransactions = [...transactionsList];
      }
    }

    // Filtrage et tri côté serveur (le SDK rejette les query params)
    if (statusFilter) {
      rawTransactions = rawTransactions.filter(t => t.status === statusFilter);
    }
    rawTransactions.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
      const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    rawTransactions = rawTransactions.slice(0, limit);

    // L'API renvoie customer_id / currency_id (pas d'objets embedded).
    // On expose ce qu'on a vraiment + une éventuelle relation embedded si le SDK la peuple.
    const formattedTransactions = rawTransactions.map(t => ({
      id: t.id,
      reference: t.reference || '',
      description: t.description || '',
      amount: parseFloat(t.amount) || 0,
      status: t.status || 'unknown',
      mode: t.mode || '',
      currencyId: t.currency_id ?? null,
      currency: t.currency?.iso || 'XOF',
      customerId: t.customer_id ?? null,
      customer: t.customer
        ? {
            firstname: t.customer.firstname || '',
            lastname: t.customer.lastname || '',
            email: t.customer.email || '',
          }
        : null,
      createdAt: t.created_at || t.createdAt || null,
      updatedAt: t.updated_at || t.updatedAt || null,
    }));

    return res.status(200).json({
      success: true,
      transactions: formattedTransactions,
      count: formattedTransactions.length,
      environment: FEDAPAY_ENVIRONMENT
    });
  } catch (error) {
    console.error('[FedaPay Transactions] Erreur :', error.message);
    return res.status(500).json({ 
      error: 'Impossible de récupérer les transactions.',
      details: error.message
    });
  }
}
