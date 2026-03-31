export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, orderId, email, firstName, lastName, phone, address, city } = req.body;

  try {
    const apiKey = process.env.CINETPAY_APIKEY || "VOTRE_API_KEY_CINETPAY_ICI";
    const apiPassword = process.env.CINETPAY_API_PASSWORD || "VOTRE_API_PASSWORD_CINETPAY_ICI";
    const transactionId = orderId || `CMD-${Date.now()}`;

    // 1. Authentification OAuth
    const authRes = await fetch("https://api.cinetpay.net/v1/oauth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, api_password: apiPassword })
    });
    
    if (!authRes.ok) {
        const errorData = await authRes.json();
        return res.status(authRes.status).json({ error: "Erreur d'authentification CinetPay (Clés invalides)", details: errorData });
    }

    const authData = await authRes.json();
    const token = authData.access_token || authData.data?.access_token;

    if (!token) {
        return res.status(500).json({ error: 'Token introuvable dans la réponse OAuth' });
    }

    // 2. Initialisation du Paiement
    const payload = {
      currency: "XOF",
      merchant_transaction_id: transactionId,
      amount: amount,
      lang: "fr",
      designation: `Commande Mystik ${transactionId}`,
      client_email: email || 'contact@mystik.tg',
      client_first_name: firstName || 'Mystik',
      client_last_name: lastName || 'Client',
      client_phone_number: phone ? phone.replace(/[^0-9]/g, '') : '',
      success_url: "http://localhost:5173/success",
      failed_url: "http://localhost:5173/checkout",
      notify_url: "http://localhost:5173/api/notify",
      channel: "ALL",
      options: {
         address: address,
         city: city
      }
    };

    const paymentRes = await fetch("https://api.cinetpay.net/v1/payment", {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const paymentData = await paymentRes.json();
    const paymentToken = paymentData.payment_token || paymentData.data?.payment_token;

    if (paymentToken) {
      return res.status(200).json({ paymentToken: paymentToken });
    } else {
      console.error("CinetPay Init Error:", paymentData);
      return res.status(400).json({ error: 'Erreur de configuration du module de paiement', details: paymentData });
    }
  } catch (error) {
    console.error("Server Fetch Exception:", error);
    return res.status(500).json({ error: error.message });
  }
}
