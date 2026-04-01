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
    let cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    
    // Si le numéro commence par +, on l'a déjà géré ci-dessus. 
    // Mais s'il manque l'indicatif 228 (Togo), on peut l'ajouter si besoin par défaut.
    if (cleanPhone.length === 8) {
      cleanPhone = '228' + cleanPhone;
    }

    // 3. Préparation du Payload pour la méthode "USSD Push"
    const payload = {
      auth_token: PAYGATE_AUTH_TOKEN,
      phone_number: cleanPhone,
      amount: amount,
      description: `Commande Mystik #${orderId}`,
      identifier: orderId,
      network: network ? network.toUpperCase() : 'TMONEY'
    };

    console.log("PayGate Payload:", JSON.stringify(payload));

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
    console.log("PayGate Response Data:", paygateData);

    // 5. Vérification du succès immédiat (Le push a été envoyé)
    if (paygateRes.ok && paygateData.status === 0 && paygateData.tx_reference) {
      return res.status(200).json({ 
          success: true,
          tx_reference: paygateData.tx_reference,
          message: "Demande de paiement envoyée. Veuillez valider sur votre téléphone." 
      });
    } else {
      console.error("Échec API PayGate:", paygateData);
      return res.status(400).json({ 
          success: false,
          error: paygateData.message || 'Le paiement a été rejeté ou le réseau est indisponible.', 
          details: paygateData 
      });
    }
  } catch (error) {
    console.error("Erreur serveur lors de la communication PayGate:", error);
    return res.status(500).json({ error: error.message });
  }
}
