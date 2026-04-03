import React from 'react';

const sections = [
  {
    title: 'Art. 1 – Objet',
    content: `Les présentes Conditions Générales de Vente (CGV) régissent les relations commerciales entre Afrik Select (ci-après "Mystik") et tout client (ci-après "Client") passant une commande sur le site mystikdrinks.com ou via nos canaux de vente directe.`,
  },
  {
    title: 'Art. 2 – Produits',
    content: `Les produits proposés sont des liqueurs artisanales (Sodabi) fabriquées au Togo. Mystik se réserve le droit de modifier son catalogue sans préavis. Les descriptions et photos sont fournies à titre indicatif.`,
  },
  {
    title: 'Art. 3 – Commande et paiement',
    content: `Toute commande implique l'acceptation des présentes CGV. Le paiement peut s'effectuer via Mobile Money (Flooz, T-Money) ou à la livraison (cash). En cas de paiement mobile, des frais de service de 500 FCFA s'appliquent. La commande ne sera traitée qu'après confirmation du paiement.`,
  },
  {
    title: 'Art. 4 – Livraison',
    content: `Mystik effectue des livraisons dans le Grand Lomé. Les frais de livraison sont à la charge du Client et réglés directement au livreur. Mystik décline toute responsabilité en cas de retard dû à des circonstances indépendantes de sa volonté (grève, intempéries, etc.).`,
  },
  {
    title: 'Art. 5 – Droit de rétractation',
    content: `En raison de la nature des produits (boissons alimentaires périssables), aucun droit de rétractation ne s'applique une fois la livraison effectuée. En cas de produit défectueux ou erroné, le Client dispose de 24h pour signaler le problème via WhatsApp ou email.`,
  },
  {
    title: 'Art. 6 – Responsabilité',
    content: `Mystik ne saurait être tenu responsable d'une consommation excessive ou irresponsable de ses produits. La vente est strictement réservée aux personnes majeures (18 ans et plus). En passant commande, le Client certifie être majeur.`,
  },
  {
    title: 'Art. 7 – Données personnelles',
    content: `Les données collectées lors de la commande (nom, téléphone, adresse, email) sont utilisées exclusivement à des fins de traitement de commande et de communication commerciale. Elles ne sont pas transmises à des tiers.`,
  },
  {
    title: 'Art. 8 – Litiges',
    content: `En cas de litige, une solution à l'amiable sera recherchée en priorité. À défaut, les tribunaux de Lomé (Togo) seront compétents.`,
  },
];

const CGV = () => {
  return (
    <div className="pt-32 pb-24 bg-[#fafaf9] min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-16">
          <span className="text-[10px] font-bold tracking-[0.4em] text-primary-600 uppercase mb-4 block underline decoration-primary-500 decoration-2 underline-offset-4">Légal</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-secondary tracking-tighter uppercase italic leading-none">
            Conditions <span className="text-primary-500 underline decoration-black/5 decoration-8 underline-offset-8">GÉNÉRALES</span>
          </h1>
          <p className="mt-6 text-[10px] font-bold tracking-widest uppercase text-gray-400">
            En vigueur à compter du 1er Janvier 2026 · Afrik Select · Lomé, Togo
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={i} className="bg-white p-10 shadow-sm">
              <h2 className="text-sm font-display font-bold uppercase italic tracking-widest text-secondary mb-4 border-b border-gray-100 pb-4">
                {s.title}
              </h2>
              <p className="text-xs font-medium tracking-wide text-gray-500 leading-relaxed">
                {s.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-secondary text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">
            Pour toute question relative aux CGV :{' '}
            <a href="mailto:contact@mystikdrinks.com" className="text-primary-400 hover:text-primary-300 transition-colors">
              contact@mystikdrinks.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CGV;
