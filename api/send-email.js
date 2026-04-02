export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { order, type } = req.body;

  try {
    console.log(`[EMAIL SIMULATION] Sending ${type} for order ${order.id} to ${order.customer.email}`);
    
    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dans une version réelle avec Resend ou Nodemailer :
    /*
    const transporter = nodemailer.createTransport({...});
    await transporter.sendMail({
      from: '"Mystik Legend" <no-reply@mystik.tg>',
      to: order.customer.email,
      subject: type === 'invoice' ? `Facture Mystik #${order.id}` : `Reçu de paiement Mystik #${order.id}`,
      html: `<h1>Merci pour votre commande, ${order.customer.firstName} !</h1>...`
    });
    */

    return res.status(200).json({ 
      success: true, 
      message: `Email (${type}) simulé envoyé à ${order.customer.email}` 
    });
  } catch (error) {
    console.error("Erreur simulation email:", error);
    return res.status(500).json({ error: error.message });
  }
}
