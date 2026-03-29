import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const ReceiptService = {
  /**
   * Génère un PDF (Facture ou Reçu) pour une commande.
   */
  generatePDF: async (order) => {
    const isPaid = order.paymentStatus === 'Payé';
    const title = isPaid ? 'REÇU DE PAIEMENT' : 'FACTURE PROFORMA';
    
    // Calcul précis du total basé sur les articles réels
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    
    // Création d'un élément temporaire pour le rendu HTML vers Canvas
    const element = document.createElement('div');
    element.style.padding = '48px';
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#0a0a0a'; // Correspond au text-secondary
    element.style.fontFamily = 'Inter, ui-sans-serif, system-ui, sans-serif';
    element.style.borderTop = '8px solid #d4af37'; // Correspond au border-amber-500
    element.style.width = '800px';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    
    element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <img src="/images/mystik/logo mystik.png" style="width: 60px; height: 60px; object-contain;" />
          <div>
            <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px; line-height: 1;">
              MYSTIK<br /><span style="color: #d4af37; font-size: 18px; letter-spacing: 2px;">LEGEND'S DRINK</span>
            </h1>
            <p style="text-transform: uppercase; font-size: 8px; font-weight: 700; letter-spacing: 3px; color: #9ca3af; margin-top: 5px;">
              L'Esprit du Togo 🇹🇬 Artisanat d'Excellence
            </p>
          </div>
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 24px; font-weight: 800; color: #0a0a0a; margin: 0; text-transform: uppercase;">${title}</h2>
          <p style="font-size: 14px; font-weight: 700; margin-top: 5px;">Réf: ${order.id}</p>
          <p style="font-size: 12px; color: #6b7280;">Date: ${new Date(order.date).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 60px; border-bottom: 1px solid #f3f4f6; padding-bottom: 40px;">
        <div>
          <h3 style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin-bottom: 15px;">Émis à :</h3>
          <p style="font-size: 16px; font-weight: 700; margin: 0;">${order.customer.firstName} ${order.customer.lastName}</p>
          <p style="font-size: 14px; color: #4b5563; margin: 5px 0;">${order.customer.city}, Togo</p>
        </div>
        <div style="text-align: right;">
          <h3 style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin-bottom: 15px;">Statut Paiement :</h3>
          <span style="display: inline-block; padding: 6px 15px; background: ${isPaid ? '#fef3c7' : '#f3f4f6'}; color: ${isPaid ? '#92400e' : '#1f2937'}; font-size: 12px; font-weight: 800; text-transform: uppercase;">
            ${order.paymentStatus}
          </span>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 60px;">
        <thead>
          <tr style="border-bottom: 2px solid #0a0a0a;">
            <th style="padding: 15px 0; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Article</th>
            <th style="padding: 15px 0; text-align: center; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Quantité</th>
            <th style="padding: 15px 0; text-align: right; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Prix Unitaire</th>
            <th style="padding: 15px 0; text-align: right; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 20px 0;">
                <p style="font-size: 14px; font-weight: 700; margin: 0;">${item.name}</p>
                <p style="font-size: 11px; color: #9ca3af; margin: 5px 0;">Liqueur Premium - ${item.size || '75cl'}</p>
              </td>
              <td style="padding: 20px 0; text-align: center; font-size: 14px;">${item.quantity || 1}</td>
              <td style="padding: 20px 0; text-align: right; font-size: 14px;">${new Intl.NumberFormat('fr-FR').format(item.price)} FCFA</td>
              <td style="padding: 20px 0; text-align: right; font-size: 14px; font-weight: 700;">${new Intl.NumberFormat('fr-FR').format(item.price * (item.quantity || 1))} FCFA</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 80px;">
        <div style="width: 250px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 12px; color: #6b7280;">Sous-total :</span>
            <span style="font-size: 12px; font-weight: 700;">${new Intl.NumberFormat('fr-FR').format(subtotal)} FCFA</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <span style="font-size: 12px; color: #6b7280;">Taxes (0%) :</span>
            <span style="font-size: 12px; font-weight: 700;">0 FCFA</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 2px solid #0a0a0a; padding-top: 15px;">
            <span style="font-size: 14px; font-weight: 800; text-transform: uppercase;">TOTAL NET :</span>
            <span style="font-size: 20px; font-weight: 900; color: #d4af37;">${new Intl.NumberFormat('fr-FR').format(subtotal)} FCFA</span>
          </div>
        </div>
      </div>

      <div style="border-left: 4px solid #d4af37; padding-left: 20px; margin-bottom: 40px;">
        <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px;">Note de Légende</h4>
        <p style="font-size: 11px; color: #4b5563; line-height: 1.6; font-style: italic;">
          "Celui qui déguste la Mystik goûte à la terre profonde du Togo. Merci d'honorer notre savoir-faire ancestral."
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid #f3f4f6; padding-top: 30px; margin-top: 40px;">
        <p style="font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
          MYSTIK LEGEND'S DRINK • Zone Industrielle, Lomé • RCCM TOGO 2026-B-001 • mystik.tg
        </p>
      </div>
    `;

    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${title.replace(' ', '_')}_${order.id}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      document.body.removeChild(element);
    }
  }
};
