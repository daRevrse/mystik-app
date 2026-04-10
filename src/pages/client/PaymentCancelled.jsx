import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';

const PaymentCancelled = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="pt-40 pb-24 bg-[#fafaf9] min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center animate-slide-up">

        {/* Icône */}
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-red-100">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>

        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary mb-4 uppercase italic leading-none">
          Paiement annulé
        </h1>
        <p className="text-gray-400 font-bold italic uppercase tracking-[0.25em] text-xs mb-10">
          {orderId
            ? `Votre commande ${orderId} n'a pas été confirmée.`
            : 'Votre paiement n\'a pas été finalisé.'}
        </p>

        {/* Message informatif */}
        <div className="mb-10 p-6 bg-amber-50 border border-amber-100 text-left">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
            Aucun montant n'a été débité.
            <br /><br />
            Vous pouvez relancer votre commande à tout moment depuis le catalogue.
            Si vous rencontrez un problème lors du paiement, contactez-nous.
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/checkout">
            <Button variant="outline" className="w-full flex items-center justify-center border-gray-200 py-4 font-bold tracking-widest uppercase italic text-xs">
              <RefreshCw className="w-4 h-4 mr-3 text-amber-500" />
              RÉESSAYER
            </Button>
          </Link>
          <Link to="/">
            <Button className="w-full btn-primary py-4 italic text-xs">
              <ArrowLeft className="w-4 h-4 mr-3" />
              RETOUR AU CATALOGUE
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentCancelled;
