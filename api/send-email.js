import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Mystik Drinks <no-reply@mystikdrinks.com>';

// Fonction pour charger le logo en base64
const getLogoBase64 = () => {
  try {
    // Tente de trouver le logo dans les dossiers branding ou public
    const paths = [
      join(__dirname, '..', 'branding', 'logo mystik.jpg'),
      join(__dirname, '..', 'public', 'images', 'mystik', 'logo mystik.jpg')
    ];
    
    for (const logoPath of paths) {
      try {
        const logoBuffer = readFileSync(logoPath);
        return `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
      } catch (e) { continue; }
    }
  } catch (e) {
    console.warn('[EMAIL] Erreur lors de la lecture du logo:', e.message);
  }
  return null;
};

const LOGO_BASE64 = getLogoBase64();

const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';

const buildEmailHTML = (order, type) => {
  const isPaid = order.paymentStatus === 'Payé' || type === 'receipt';
  const title = isPaid ? 'REÇU DE PAIEMENT' : 'FACTURE PROFORMA';
  const subtotal = (order.items || []).reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Mystik #${order.id}</title>
  <style>
    body { margin: 0; padding: 0; background: #f9fafb; font-family: 'Inter', Arial, sans-serif; color: #111; }
    .wrapper { max-width: 620px; margin: 40px auto; background: #fff; border-top: 6px solid #d4af37; }
    .header { padding: 32px 40px 24px; border-bottom: 3px solid #d4af37; display: flex; align-items: center; gap: 20px; background: #fff; }
    .logo-img { height: 72px; width: auto; object-fit: contain; display: block; }
    .logo-text { line-height: 1.3; }
    .title-block { padding: 20px 40px 30px; border-bottom: 1px solid #f3f4f6; }
    .title-block h2 { font-size: 22px; font-weight: 800; text-transform: uppercase; margin: 0 0 6px; }
    .title-block p { font-size: 13px; color: #6b7280; margin: 0; }
    .section { padding: 30px 40px; border-bottom: 1px solid #f3f4f6; }
    .section h3 { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin: 0 0 12px; }
    .status-badge { display: inline-block; padding: 5px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase;
      background: ${isPaid ? '#fef3c7' : '#f3f4f6'}; color: ${isPaid ? '#92400e' : '#374151'}; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 10px 0; border-bottom: 2px solid #111; text-align: left; }
    th:last-child, td:last-child { text-align: right; }
    th:nth-child(2), td:nth-child(2) { text-align: center; }
    td { font-size: 13px; padding: 14px 0; border-bottom: 1px solid #f3f4f6; }
    .total-row { font-size: 20px; font-weight: 900; color: #d4af37; }
    .footer { padding: 24px 40px; background: #f9fafb; text-align: center; font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
    .note { padding: 20px 40px; border-left: 4px solid #d4af37; margin: 0 40px 30px; background: #fffbeb; font-style: italic; font-size: 12px; color: #6b7280; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      ${LOGO_BASE64
        ? `<img src="${LOGO_BASE64}" alt="Mystik Logo" class="logo-img" />`
        : `<div style="font-size:28px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:-1px;">MYSTIK<span style="color:#d4af37;font-size:14px;letter-spacing:2px;display:block;">LEGEND'S DRINK</span></div>`
      }
      <div class="logo-text">
        <p style="margin:0;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#9ca3af;">LEGEND'S DRINK</p>
        <p style="margin:4px 0 0;font-size:8px;text-transform:uppercase;letter-spacing:2px;color:#d4af37;">L'Esprit du Togo 🇹🇬</p>
      </div>
    </div>

    <div class="title-block">
      <h2>${title}</h2>
      <p>Réf: <strong>${order.id}</strong> &nbsp;·&nbsp; Date: ${new Date(order.date).toLocaleDateString('fr-FR')}</p>
    </div>

    <div class="section" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
      <div>
        <h3>Client</h3>
        <p style="font-weight:700; margin:0;">${order.customer?.firstName} ${order.customer?.lastName}</p>
        <p style="color:#6b7280; margin:4px 0 0;">${order.customer?.email}</p>
        <p style="color:#6b7280; margin:4px 0 0;">${order.customer?.phone}</p>
        ${order.customer?.address ? `<p style="color:#6b7280; margin:4px 0 0;">${order.customer.address}, ${order.customer.city}</p>` : ''}
      </div>
      <div style="text-align:right;">
        <h3>Statut Paiement</h3>
        <span class="status-badge">${order.paymentStatus}</span>
        <p style="font-size:11px; color:#6b7280; margin-top:8px;">Mode: ${order.payment_network === 'COD' ? 'Paiement à la livraison' : (order.payment_network || 'N/A')}</p>
      </div>
    </div>

    <div class="section">
      <h3>Détail de la commande</h3>
      <table>
        <thead>
          <tr>
            <th>Article</th>
            <th>Qté</th>
            <th>P.U.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${(order.items || []).map(item => `
          <tr>
            <td><strong>${item.name}</strong></td>
            <td style="text-align:center;">${item.quantity || 1}</td>
            <td style="text-align:right;">${formatPrice(item.price)}</td>
            <td style="text-align:right;font-weight:700;">${formatPrice(item.price * (item.quantity || 1))}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align:right; padding-top:20px; font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#9ca3af; font-weight:800;">TOTAL NET</td>
            <td class="total-row" style="padding-top:20px;">${formatPrice(order.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="note">
      "Celui qui déguste la Mystik goûte à la terre profonde du Togo. Merci d'honorer notre savoir-faire ancestral."
    </div>

    <div class="footer">
      AFRIK SELECT · BE PA DE SOUZA, LOMÉ · RCCM TG-LFW-01-2024-A-10-04869<br />
      <a href="https://mystikdrinks.com" style="color:#d4af37;">mystikdrinks.com</a> &nbsp;·&nbsp; 
      <a href="https://wa.me/22892721373" style="color:#9ca3af;">WhatsApp</a>
    </div>
  </div>
</body>
</html>`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { order, type } = req.body;

  if (!order?.customer?.email) {
    return res.status(400).json({ error: 'Email client manquant.' });
  }

  const isPaid = type === 'receipt' || order.paymentStatus === 'Payé';
  const subjectLine = isPaid
    ? `✅ Reçu de paiement Mystik #${order.id}`
    : `📋 Votre facture Mystik #${order.id} — Paiement à la livraison`;

  try {
    if (!process.env.RESEND_API_KEY) {
      // Mode simulation si pas de clé API
      console.log(`[EMAIL SIMULATION] Sending ${type} for order ${order.id} to ${order.customer.email}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return res.status(200).json({
        success: true,
        message: `Email (${type}) simulé envoyé à ${order.customer.email} (RESEND_API_KEY manquante)`
      });
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [order.customer.email],
      subject: subjectLine,
      html: buildEmailHTML(order, type),
    });

    if (error) {
      console.error('[RESEND ERROR]', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[EMAIL] Envoyé avec succès à ${order.customer.email} — ID Resend: ${data?.id}`);
    return res.status(200).json({
      success: true,
      message: `Email envoyé à ${order.customer.email}`,
      resend_id: data?.id
    });

  } catch (error) {
    console.error('Erreur envoi email:', error);
    return res.status(500).json({ error: error.message });
  }
}
