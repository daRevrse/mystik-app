export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Simulation d'un solde réel provenant de Paygate
  // En production, on ferait une requête vers l'API Paygate Global.
  const mockBalance = 245000;

  return res.status(200).json({ 
    success: true, 
    balance: mockBalance,
    currency: 'FCFA'
  });
}
