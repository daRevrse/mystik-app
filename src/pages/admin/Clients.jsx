import React, { useEffect, useMemo, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Users, Search, MessageCircle, ShoppingBag, TrendingUp, Calendar, ArrowRight } from 'lucide-react';

const Clients = () => {
  const { orders, fetchOrders, isLoading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const clientsData = useMemo(() => {
    const clientsMap = new Map();

    orders.forEach(order => {
      const email = order.customer?.email?.toLowerCase() || 'inconnu';
      const phone = order.customer?.phone || 'inconnu';
      const key = email !== 'inconnu' ? email : phone;

      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          id: key,
          firstName: order.customer?.firstName || '',
          lastName: order.customer?.lastName || '',
          email: order.customer?.email || '',
          phone: order.customer?.phone || '',
          city: order.customer?.city || 'Lomé',
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: order.date,
          orders: []
        });
      }

      const client = clientsMap.get(key);
      client.ordersCount += 1;
      client.totalSpent += (order.total || 0);
      if (new Date(order.date) > new Date(client.lastOrderDate)) {
        client.lastOrderDate = order.date;
      }
      client.orders.push(order);
    });

    return Array.from(clientsMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filteredClients = clientsData.filter(c => 
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(Math.round(price)) + ' FCFA';

  const handleWhatsAppRelance = (client) => {
    const message = `Bonjour ${client.firstName}, c'est Mystik ! 🌿 Nous espérons que vous avez apprécié votre dernière commande. Profitez de -10% sur votre prochain pack avec le code MYSTIKVIP. À bientôt !`;
    const url = `https://wa.me/${client.phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 italic-none">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-secondary tracking-tighter uppercase italic leading-none mb-3">
            Gestion <span className="text-amber-500">CLIENTS</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] italic opacity-70">
            Ambassadeurs de la légende • {clientsData.length} profils identifiés
          </p>
        </div>

        <div className="w-full lg:w-96 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="RECHERCHER UN NOM, MOBILE OU EMAIL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 pl-12 pr-4 py-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-amber-500 transition-all shadow-xl shadow-black/5 rounded-none"
          />
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-none shadow-xl bg-white flex items-center gap-6 rounded-none">
          <div className="w-14 h-14 bg-secondary text-amber-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clients Totaux</p>
            <p className="text-2xl font-display font-black text-secondary italic">{clientsData.length}</p>
          </div>
        </Card>
        <Card className="p-8 border-none shadow-xl bg-white flex items-center gap-6 rounded-none">
          <div className="w-14 h-14 bg-amber-500 text-secondary flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenu Moyen / Client</p>
            <p className="text-2xl font-display font-black text-secondary italic">
              {clientsData.length > 0 ? formatPrice(clientsData.reduce((acc, c) => acc + c.totalSpent, 0) / clientsData.length) : '0 FCFA'}
            </p>
          </div>
        </Card>
        <Card className="p-8 border-none shadow-xl bg-white flex items-center gap-6 rounded-none">
          <div className="w-14 h-14 bg-secondary text-white flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rétention (Répétition)</p>
            <p className="text-2xl font-display font-black text-secondary italic">
              {clientsData.length > 0 ? ((clientsData.filter(c => c.ordersCount > 1).length / clientsData.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </Card>
      </div>

      {/* Clients Table */}
      <Card className="overflow-hidden border-none shadow-2xl bg-white rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary text-white">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] italic">Ambassadeur</th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] italic">Commandes</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] italic">Dépenses</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] italic">Dernière activité</th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] italic">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-secondary font-display font-black text-lg italic group-hover:bg-amber-500 group-hover:text-secondary transition-colors shrink-0">
                        {client.lastName.charAt(0)}{client.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase text-secondary tracking-tight">{client.firstName} {client.lastName}</p>
                        <p className="text-[10px] font-medium text-gray-400 lowercase">{client.email}</p>
                        <p className="text-[10px] font-black text-amber-600 mt-1 uppercase tracking-widest">{client.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-secondary/5 text-secondary text-[10px] font-black px-3 py-1 rounded-none border border-secondary/10">
                      {client.ordersCount} CMD
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-secondary text-sm">
                    {formatPrice(client.totalSpent)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {new Date(client.lastOrderDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => handleWhatsAppRelance(client)}
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Relancer
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest italic opacity-50">
                    Aucun client trouvé pour cette recherche
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Clients;
