import { FedaPay, Balance } from 'fedapay';

/**
 * Endpoint: GET /api/fedapay-balance
 * 
 * Récupère le solde du compte FedaPay, réparti par réseau/mode.
 * Parsing robuste compatible avec les différentes versions du SDK FedaPay.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;
  const FEDAPAY_ENVIRONMENT = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';

  if (!FEDAPAY_SECRET_KEY) {
    return res.status(500).json({ 
      error: 'Configuration FedaPay manquante (FEDAPAY_SECRET_KEY).',
      connected: false
    });
  }

  try {
    FedaPay.setApiKey(FEDAPAY_SECRET_KEY);
    FedaPay.setEnvironment(FEDAPAY_ENVIRONMENT);

    console.log(`[FedaPay Balance] Récupération des balances (env: ${FEDAPAY_ENVIRONMENT})...`);

    const balancesList = await Balance.all();

    // Gestion robuste : le SDK peut retourner différentes structures
    let rawBalances = [];

    if (Array.isArray(balancesList)) {
      rawBalances = balancesList;
    } else if (balancesList && typeof balancesList === 'object') {
      // FedaPayObject collection : peut avoir .data, .items, ou méthode .all()
      if (Array.isArray(balancesList.data)) {
        rawBalances = balancesList.data;
      } else if (Array.isArray(balancesList.items)) {
        rawBalances = balancesList.items;
      } else if (typeof balancesList.all === 'function') {
        const result = balancesList.all();
        rawBalances = Array.isArray(result) ? result : [];
      } else if (typeof balancesList[Symbol.iterator] === 'function') {
        rawBalances = [...balancesList];
      } else {
        // Dernière tentative : extraire les propriétés numériques
        const keys = Object.keys(balancesList).filter(k => !isNaN(k));
        if (keys.length > 0) {
          rawBalances = keys.map(k => balancesList[k]);
        } else {
          // C'est peut-être un seul objet balance
          if (balancesList.amount !== undefined) {
            rawBalances = [balancesList];
          }
        }
      }
    }

    console.log(`[FedaPay Balance] ${rawBalances.length} balance(s) trouvée(s)`);

    const formattedBalances = rawBalances.map(b => ({
      id: b.id,
      mode: b.mode || b.currency || 'unknown',
      amount: parseFloat(b.amount) || 0,
      currency: b.currency || 'XOF',
      updatedAt: b.updated_at || b.updatedAt || null
    }));

    // Calcul du total
    const total = formattedBalances.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return res.status(200).json({
      success: true,
      connected: true,
      balances: formattedBalances,
      total: total,
      environment: FEDAPAY_ENVIRONMENT,
      lastFetch: new Date().toISOString()
    });
  } catch (error) {
    console.error('[FedaPay Balance] Erreur :', error.message);
    console.error('[FedaPay Balance] Stack :', error.stack);
    return res.status(500).json({ 
      error: 'Impossible de récupérer le solde.',
      details: error.message,
      connected: false,
      environment: FEDAPAY_ENVIRONMENT
    });
  }
}
