import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { 
  ShoppingCart, Eye, CheckCircle, Package, Send, Filter, 
  Search, Clock, Star, Plus, X, Download, FileText, CreditCard 
} from 'lucide-react';
import { ReceiptService } from '../../services/ReceiptService';

const Orders = () => {
  const { 
    orders, fetchOrders, updateStatus, isLoading, 
    addOrder, togglePaymentStatus, products, fetchProducts 
  } = useAdminStore();
  
  const [filter, setFilter] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Formulaire de création
  const [newOrder, setNewOrder] = useState({
    customer: { firstName: '', lastName: '', city: 'Lomé' },
    items: [],
    paymentStatus: 'Non payé'
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(price)) + ' FCFA';
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'Tous' || o.status === filter;
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusVariants = {
    'En attente': 'warning',
    'En préparation': 'info',
    'Livrée': 'success'
  };

  const handleAddProduct = (product) => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, product]
    }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (newOrder.items.length === 0) return alert('Sélectionnez au moins un produit');
    
    const total = newOrder.items.reduce((acc, item) => acc + item.price, 0);
    await addOrder({ ...newOrder, total });
    setIsModalOpen(false);
    setNewOrder({
      customer: { firstName: '', lastName: '', city: 'Lomé' },
      items: [],
      paymentStatus: 'Non payé'
    });
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <h1 className="text-3xl font-display font-bold text-secondary tracking-tighter uppercase italic leading-none">
               Flux de <span className="text-amber-500 underline decoration-black/5 decoration-8 underline-offset-8">COMMANDES</span>
             </h1>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] italic opacity-70">Journal des honneurs - Mystik Legend</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white p-1 shadow-xl border border-gray-100">
            {['Tous', 'En attente', 'En préparation', 'Livrée'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`
                  px-6 py-3 rounded-none text-[9px] font-bold tracking-widest uppercase transition-all duration-300
                  ${filter === s 
                    ? 'bg-secondary text-white shadow-lg' 
                    : 'text-gray-400 hover:text-secondary hover:bg-gray-50'}
                `}
              >
                {s}
              </button>
            ))}
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 hover:bg-secondary text-white px-8 py-4 text-[10px] font-bold tracking-[0.2em] uppercase italic flex items-center gap-3 border-none shadow-2xl transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nouvel Honneur
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-none">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8 bg-gray-50/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="RECHERCHER RÉFÉRENCE OU NOM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 px-12 py-4 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-gray-300 italic"
            />
          </div>
          <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none border-l pl-8 border-gray-200 hidden md:block">
            {filteredOrders.length} HONORAIRE(S) TROUVÉ(S)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fafaf9] border-b border-gray-100">
              <tr className="text-[9px] font-bold tracking-[0.3em] text-gray-400 uppercase">
                <th className="px-10 py-6">Référence</th>
                <th className="px-10 py-6">Client Honoré</th>
                <th className="px-10 py-6">Articles</th>
                <th className="px-10 py-6 text-center">Paiement</th>
                <th className="px-10 py-6 text-right w-40">Total Net</th>
                <th className="px-10 py-6 text-center w-80">Actions de Légende</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center text-[10px] font-bold italic tracking-[0.4em] uppercase text-gray-300 opacity-60">Aucun flux de commande.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#fafaf9] transition-colors group">
                    <td className="px-10 py-8">
                      <p className="text-xs font-bold text-secondary tracking-tight group-hover:text-amber-600 transition-colors underline decoration-amber-500/30 decoration-2 underline-offset-8 italic">{order.id}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">{new Date(order.date).toLocaleDateString('fr-FR')}</p>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-xs font-bold text-secondary uppercase italic tracking-widest">{order.customer.firstName} {order.customer.lastName}</p>
                      <p className="text-[9px] text-gray-400 font-bold tracking-widest mt-2">{order.customer.city}, Togo 🇹🇬</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex -space-x-3">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="w-10 h-10 border-2 border-white overflow-hidden bg-white shadow-xl" title={item.name}>
                            <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={item.name} />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <button 
                        onClick={() => togglePaymentStatus(order.id)}
                        className={`text-[9px] font-bold uppercase tracking-widest px-4 py-2 border ${order.paymentStatus === 'Payé' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-400'} transition-all`}
                      >
                        {order.paymentStatus}
                      </button>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <p className="text-sm font-bold text-secondary italic underline decoration-amber-500/20 decoration-2 underline-offset-8">{formatPrice(order.total)}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-center gap-2">
                        {/* Action PDF : Facture ou Reçu */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => ReceiptService.generatePDF(order)}
                          className={`
                            py-3 px-5 text-[9px] font-bold tracking-widest uppercase border flex items-center gap-2
                            ${order.paymentStatus === 'Payé' ? 'bg-secondary text-white hover:bg-amber-600' : 'bg-white text-secondary border-gray-200 hover:bg-gray-50'}
                          `}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {order.paymentStatus === 'Payé' ? 'REÇU' : 'FACTURE'}
                        </Button>

                        {/* Workflow de statut */}
                        {order.status === 'En attente' && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="bg-amber-600 text-white py-3 px-5 text-[9px] font-bold tracking-widest border-none"
                            onClick={() => updateStatus(order.id, 'En préparation')}
                          >
                            <Package className="w-3.5 h-3.5 mr-2" />
                            PRÉPARER
                          </Button>
                        )}
                        {order.status === 'En préparation' && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="bg-secondary text-white py-3 px-5 text-[9px] font-bold tracking-widest border-none"
                            onClick={() => updateStatus(order.id, 'Livrée')}
                          >
                            <Send className="w-3.5 h-3.5 mr-2" />
                            LIVRER
                          </Button>
                        )}
                        
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-100 border border-gray-100">
                          <Eye className="w-4 h-4 text-gray-400" title="Voir détails" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Création de Commande */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <Card className="relative w-full max-w-4xl bg-white p-12 shadow-2xl animate-slide-up rounded-none overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-10 top-10 text-gray-400 hover:text-secondary transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <h2 className="text-3xl font-display font-bold uppercase italic tracking-tight mb-12">
              Graver un <span className="text-amber-500">Nouvel Honneur</span>
            </h2>

            <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Infos Client */}
              <div className="space-y-8">
                <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest border-b pb-4">Destinataire de la Légende</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Prénom</label>
                    <input 
                      required
                      className="w-full border-b-2 border-gray-100 py-3 focus:outline-none focus:border-amber-500 text-sm font-bold uppercase tracking-tight"
                      value={newOrder.customer.firstName}
                      onChange={e => setNewOrder({...newOrder, customer: {...newOrder.customer, firstName: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Nom</label>
                    <input 
                      required
                      className="w-full border-b-2 border-gray-100 py-3 focus:outline-none focus:border-amber-500 text-sm font-bold uppercase tracking-tight"
                      value={newOrder.customer.lastName}
                      onChange={e => setNewOrder({...newOrder, customer: {...newOrder.customer, lastName: e.target.value}})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ville (Togo)</label>
                  <input 
                    required
                    className="w-full border-b-2 border-gray-100 py-3 focus:outline-none focus:border-amber-500 text-sm font-bold uppercase tracking-tight"
                    value={newOrder.customer.city}
                    onChange={e => setNewOrder({...newOrder, customer: {...newOrder.customer, city: e.target.value}})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Statut de Paiement Initial</label>
                  <div className="flex gap-4">
                    {['Non payé', 'Payé'].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewOrder({...newOrder, paymentStatus: st})}
                        className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest border ${newOrder.paymentStatus === st ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-400 border-gray-100'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sélection Produits */}
              <div className="space-y-8">
                <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest border-b pb-4">Articles Sélectionnés ({newOrder.items.length})</h3>
                <div className="max-h-64 overflow-y-auto space-y-4 pr-2">
                  {products.map(p => (
                    <div key={p.id} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <img src={p.image} className="w-12 h-12 object-cover bg-gray-50 grayscale group-hover:grayscale-0 transition-all" alt={p.name} />
                        <div>
                          <p className="text-[11px] font-bold text-secondary uppercase leading-none">{p.name}</p>
                          <p className="text-[10px] text-amber-600 font-bold mt-1">{formatPrice(p.price)}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleAddProduct(p)}
                        className="w-10 h-10 bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {newOrder.items.length > 0 && (
                  <div className="bg-gray-50 p-6 space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TOTAL À RÉGLER :</span>
                        <span className="text-xl font-display font-black text-secondary">{formatPrice(newOrder.items.reduce((acc, i) => acc + i.price, 0))}</span>
                     </div>
                     <Button 
                      type="submit"
                      className="w-full bg-secondary text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] border-none shadow-xl"
                     >
                       CONFIRMER L'ORDRE
                     </Button>
                  </div>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Orders;
