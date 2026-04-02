import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Download, Printer, ShoppingBag, ArrowLeft, Star, Truck, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { ReceiptService } from '../../services/ReceiptService';
import { useAdminStore } from '../../store/useAdminStore';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const { incrementNewOrders } = useAdminStore();

  React.useEffect(() => {
    if (order) {
      incrementNewOrders();
    }
  }, [order, incrementNewOrders]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  if (!order) {
    return (
      <div className="pt-40 pb-24 text-center bg-[#fafaf9] min-h-screen">
        <h2 className="text-2xl font-display font-bold mb-4 uppercase italic">Aucune commande trouvée.</h2>
        <Link to="/">
          <Button className="btn-primary">RETOUR À LA BOUTIQUE</Button>
        </Link>
      </div>
    );
  }

  const isPaid = order.payment_status === 'Payé';

  const handleDownloadReceipt = async () => {
    await ReceiptService.generatePDF(order);
  };

  return (
    <div className="pt-32 pb-24 bg-[#fafaf9] min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Main Success Card (Visible on screen) */}
        <Card className="p-16 text-center shadow-2xl border-none mb-10 no-print animate-slide-up bg-white">
          <div className="w-24 h-24 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-10 animate-bounce border border-primary-500/20">
            <Star className="w-12 h-12 text-primary-500" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-secondary mb-6 uppercase italic leading-none">
            {isPaid ? "L'Esprit vous remercie !" : "Votre Facture Mystik"}
          </h1>
          <p className="text-gray-400 mb-6 font-bold italic opacity-80 uppercase tracking-[0.3em] text-xs">
            {isPaid 
                ? `VOTRE COMMANDE ${order.id} A ÉTÉ VALIDÉE AVEC SUCCÈS.` 
                : `VOTRE FACTURE ${order.id} EST PRÊTE À ÊTRE RÉGLÉE.`}
          </p>

          {!isPaid && (
            <div className="mb-10 p-6 bg-amber-50 border border-amber-100 max-w-md mx-auto">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-relaxed">
                   Mode: Paiement à la livraison <br/>
                   Veuillez préparer le montant exact de {formatPrice(order.total)} pour le livreur.
                </p>
                {order.delivery_requested && (
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                    * Les frais de livraison sont en sus et à régler directement au livreur.
                  </p>
                )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto mb-16">
            <Button variant="outline" className="w-full flex items-center justify-center border-gray-200 py-4 font-bold tracking-widest uppercase italic text-xs" onClick={handleDownloadReceipt}>
              <Download className="w-4 h-4 mr-3 text-amber-500" />
              TÉLÉCHARGER {isPaid ? 'MON REÇU' : 'MA FACTURE'} (PDF)
            </Button>
            <Link to="/" className="w-full">
              <Button className="w-full btn-primary py-4 italic text-xs">
                RETOUR AU CATALOGUE
              </Button>
            </Link>
          </div>


          <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-around items-center gap-10">
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">Expédition</p>
              <p className="text-sm font-bold text-secondary italic uppercase tracking-widest">Zone Lomé (24h)</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">Statut</p>
              <Badge variant="warning" className="animate-pulse bg-secondary text-white border-none italic">PRÉPARATION</Badge>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">Origine</p>
              <p className="text-sm font-bold text-secondary italic uppercase tracking-widest">MADE IN TOGO</p>
            </div>
          </div>
        </Card>

        {/* Recap (Visible on screen) */}
        <Card className="p-10 border-none shadow-sm no-print animate-fade-in bg-white/50" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-[10px] font-bold tracking-[0.4em] text-gray-400 uppercase mb-8 flex items-center underline decoration-primary-500 decoration-2 underline-offset-4">
            <ShoppingBag className="w-4 h-4 mr-3" />
            Récapitulatif de la collection
          </h3>
          <div className="space-y-6">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-center text-xs font-bold uppercase italic tracking-[0.2em] text-secondary">
                <span className="opacity-60">{item.quantity}x {item.name}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="pt-6 border-t border-gray-100 flex justify-between items-center text-2xl font-display font-bold text-secondary uppercase italic leading-none">
              <span>Total honoré</span>
              <span className="text-primary-600 underline decoration-black/5 decoration-8 underline-offset-8">{formatPrice(order.total)}</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Success;
