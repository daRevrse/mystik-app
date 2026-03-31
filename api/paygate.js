export default async function handler(req, res) {
  // SEULEMENT POST AUTORISÉ
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, orderId, phone, network } = req.body;

  try {
    // 1. Récupération de la clé Paygate depuis les variables Vercel
    const PAYGATE_AUTH_TOKEN = process.env.PAYGATE_GLOBAL_AUTH_TOKEN;
    
    if (!PAYGATE_AUTH_TOKEN) {
      console.error("Clé PayGate manquante sur Vercel.");
      return res.status(500).json({ error: 'Configuration paiement (PayGate) introuvable.' });
    }

    // 2. Nettoyage du numéro de téléphone 
    // Assure qu'on n'envoie que des chiffres à Paygate (Ex: +228 90 00 00 00 -> 22890000000)
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

    // 3. Préparation du Payload pour la méthode "USSD Push"
    // Documentation PayGate v1 : Le réseau doit être 'TMONEY' ou 'FLOOZ'
    const payload = {
      auth_token: PAYGATE_AUTH_TOKEN,
      phone_number: cleanPhone,
      amount: amount,
      description: `Commande Mystik Beverage #${orderId}`,
      identifier: orderId, // Paramètre de traçage unique (Aussi renvoyé au webhook de retour)
      network: network ? network.toUpperCase() : 'TMONEY'
    };

    // 4. Lancement de la requête chez Paygate
    const paygateRes = await fetch("https://paygateglobal.com/api/v1/pay", {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const paygateData = await paygateRes.json();

    // 5. Vérification du succès immédiat
    // Paygate retourne status: 0 quand la requête a bien atteint le téléphone du client
    if (paygateRes.ok && paygateData.status === 0 && paygateData.tx_reference) {
      return res.status(200).json({ 
          success: true,
          tx_reference: paygateData.tx_reference,
          message: "Demande de paiement poussée sur le téléphone." 
      });
    } else {
      console.error("Erreur renvoyée par l'API PayGate:", paygateData);
      return res.status(400).json({ 
          error: 'Le paiement a été rejeté ou le réseau est indisponible.', 
          details: paygateData 
      });
    }
  } catch (error) {
    console.error("Erreur serveur lors de la communication PayGate:", error);
    return res.status(500).json({ error: error.message });
  }
}
