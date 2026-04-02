export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount } = req.body;

  try {
    console.log(`[WITHDRAWAL SIMULATION] Withdrawal request for ${amount} FCFA`);
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));

    return res.status(200).json({ 
      success: true, 
      message: "Demande de retrait enregistrée et en cours de traitement par Paygate Global." 
    });
  } catch (error) {
    console.error("Erreur retrait:", error);
    return res.status(500).json({ error: error.message });
  }
}
