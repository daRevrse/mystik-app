import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ReceiptService } from '../../services/ReceiptService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { 
  ArrowLeft, Package, Truck, CheckCircle, Clock, 
  User, MapPin, Phone, Mail, CreditCard, ShoppingBag,
  Download, Printer, AlertCircle, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.getOrderById(id);
        setOrder(data);
      } catch (err) {
        toast.error("Impossible de trouver cette commande");
        navigate('/admin/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.updateOrderStatus(id, newStatus);
      setOrder(prev => ({ ...prev, status: newStatus }));
      toast.success(`Statut mis à jour : ${newStatus}`);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleUpdatePayment = async (newStatus) => {
    try {
      await api.updateOrderPaymentStatus(id, newStatus);
      setOrder(prev => ({ ...prev, paymentStatus: newStatus }));
      toast.success(`Paiement mis à jour : ${newStatus}`);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du paiement");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(price)) + ' FCFA';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!order) return null;

  const steps = ['En attente', 'En préparation', 'Livrée'];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour au flux
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-display font-bold text-secondary uppercase italic tracking-tighter">
              Détails <span className="text-amber-500">{order.id}</span>
            </h1>
            <Badge variant={order.paymentStatus === 'Payé' ? 'success' : 'warning'} className="italic tracking-widest text-[9px] px-3 py-1">
              {order.paymentStatus.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Button 
            variant="ghost" 
            onClick={() => ReceiptService.generatePDF(order)}
            className="flex-1 md:flex-none border-gray-100 hover:bg-gray-50 text-[10px] font-bold tracking-widest uppercase italic py-4 px-8"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger {order.paymentStatus === 'Payé' ? 'Reçu' : 'Facture'}
          </Button>
          <Button 
            className="flex-1 md:flex-none bg-secondary text-white text-[10px] font-bold tracking-widest uppercase italic py-4 px-8 shadow-xl"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white p-10 border border-gray-50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
        <div className="flex flex-col md:flex-row justify-between relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex-1 relative mb-8 md:mb-0">
              <div className="flex items-center">
                <div className={`
                  w-10 h-10 flex items-center justify-center z-10 
                  ${idx <= currentStepIndex ? 'bg-secondary text-white shadow-lg' : 'bg-gray-100 text-gray-400'}
                  transition-all duration-500
                `}>
                  {idx < currentStepIndex ? <CheckCircle className="w-5 h-5" /> : idx === currentStepIndex ? <Clock className="w-5 h-5" /> : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`
                    hidden md:block absolute left-10 right-0 h-0.5 top-5 -z-0
                    ${idx < currentStepIndex ? 'bg-secondary' : 'bg-gray-100'}
                  `} />
                )}
              </div>
              <div className="mt-4">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${idx <= currentStepIndex ? 'text-secondary' : 'text-gray-300'}`}>
                  {step}
                </p>
                {idx === currentStepIndex && (
                  <p className="text-[9px] text-amber-600 font-bold uppercase mt-1 italic animate-pulse">Statut actuel</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Order Items */}
          <Card className="p-0 overflow-hidden border-none shadow-xl bg-white">
            <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                Composition de l'Ordre
              </h3>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{order.items.length} Article(s)</span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-8 flex gap-8 items-center group hover:bg-gray-50/50 transition-colors">
                  <div className="w-20 h-20 bg-white border border-gray-100 overflow-hidden shadow-sm flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={item.name} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-secondary uppercase italic tracking-tight">{item.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-70">Liqueur Premium • {item.size || '75cl'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-secondary italic">{formatPrice(item.price * (item.quantity || 1))}</p>
                        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{item.quantity || 1} x {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-10 bg-secondary text-white space-y-4">
               <div className="flex justify-between items-center opacity-60">
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Sous-total Artisanal</span>
                 <span className="text-sm font-bold">{formatPrice(order.total + (order.discount_amount || 0))}</span>
               </div>
               {order.discount_amount > 0 && (
                 <div className="flex justify-between items-center text-amber-400">
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Réduction de légende</span>
                   <span className="text-sm font-bold">-{formatPrice(order.discount_amount)}</span>
                 </div>
               )}
               <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4">
                 <span className="text-lg font-display font-bold uppercase italic tracking-tighter">Total Net</span>
                 <div className="text-right">
                    <span className="text-3xl font-display font-black text-amber-500 leading-none">{formatPrice(order.total)}</span>
                    <p className="text-[8px] font-bold uppercase tracking-widest mt-1 text-white/40">Toutes taxes incluses</p>
                 </div>
               </div>
            </div>
          </Card>

          {/* Action History / Notes (Visual only for now) */}
          <div className="bg-amber-50 border border-amber-100 p-8 flex gap-6 items-start">
            <div className="w-12 h-12 bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg">
               <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-2">Note de gestion</h4>
              <p className="text-xs text-amber-700 font-medium leading-relaxed italic">
                "Cette commande a été passée via la plateforme mobile Mystik. Assurez-vous de la qualité du packaging avant l'envoi."
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-12">
          {/* Client Info */}
          <Card className="p-10 border-none shadow-xl bg-white space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 -rotate-45 translate-x-12 -translate-y-12 pointer-events-none" />
            
            <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] border-b pb-6 mb-2">Destinataire</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-secondary shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary uppercase italic tracking-widest leading-none mb-1">{order.customer.firstName} {order.customer.lastName}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Client Honoré</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-secondary shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary tracking-widest leading-none mb-1">{order.customer.phone || 'Non renseigné'}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp / Appel</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-secondary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary uppercase italic tracking-widest leading-none mb-1">{order.customer.city || 'Lomé'}, Togo</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[150px]">{order.customer.address || 'Standard'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-secondary shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-secondary truncate max-w-[150px] mb-1">{order.customer.email || 'N/A'}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email de contact</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Management Actions */}
          <Card className="p-10 border-none shadow-xl bg-white space-y-10">
            <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] border-b pb-6 mb-4">Pilotage du Flux</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Statut d'Expédition</label>
                <div className="grid grid-cols-1 gap-3">
                  {steps.map(s => (
                    <button
                      key={s}
                      onClick={() => handleUpdateStatus(s)}
                      className={`
                        w-full py-4 text-[9px] font-bold uppercase tracking-widest border transition-all
                        ${order.status === s ? 'bg-secondary text-white border-secondary shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}
                      `}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Statut du Paiement</label>
                <div className="flex gap-3">
                  {['Payé', 'Non payé'].map(p => (
                    <button
                      key={p}
                      onClick={() => handleUpdatePayment(p)}
                      className={`
                        flex-1 py-4 text-[9px] font-bold uppercase tracking-widest border transition-all
                        ${order.paymentStatus === p ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-white text-gray-400 border-gray-100'}
                      `}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 flex flex-col gap-4">
                 <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center italic leading-relaxed">
                   Mode: {order.payment_network === 'COD' ? (order.delivery_requested ? 'À la livraison' : 'À la boutique') : order.payment_network || 'Standard'}
                 </p>
                 <Button 
                   variant="ghost" 
                   className="w-full border-red-50 text-red-400 hover:bg-red-50 text-[9px] font-bold uppercase tracking-widest py-3"
                 >
                   <Trash2 className="w-3.5 h-3.5 mr-2" />
                   Annuler l'Ordre
                 </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
