import { FedaPay, Balance } from 'fedapay';

/**
 * Endpoint: GET /api/fedapay-balance
 * 
 * Récupère le solde du compte FedaPay, réparti par réseau/mode.
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

  try {
    FedaPay.setApiKey(FEDAPAY_SECRET_KEY);
    FedaPay.setEnvironment(FEDAPAY_ENVIRONMENT);

    const balancesList = await Balance.all();

    // Certaines versions du SDK retournent un objet Collection avec une méthode all()
    // d'autres retournent directement un tableau.
    const rawBalances = Array.isArray(balancesList) ? balancesList : (balancesList.all ? balancesList.all() : []);

    const formattedBalances = rawBalances.map(b => ({
      id: b.id,
      mode: b.mode,
      amount: b.amount,
      updatedAt: b.updated_at
    }));

    // Calcul du total
    const total = formattedBalances.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return res.status(200).json({
      success: true,
      balances: formattedBalances,
      total: total,
      environment: FEDAPAY_ENVIRONMENT
    });
  } catch (error) {
    console.error('[FedaPay Balance] Erreur :', error.message);
    return res.status(500).json({ 
      error: 'Impossible de récupérer le solde.',
      details: error.message 
    });
  }
}
