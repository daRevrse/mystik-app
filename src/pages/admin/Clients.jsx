import React, { useEffect, useMemo, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Users, Search, MessageCircle, ShoppingBag, TrendingUp, Calendar, ArrowRight, Download, Share2, Copy, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [promoMessage, setPromoMessage] = useState("Bonjour ! Mystik vous propose une offre spéciale : -20% sur tout le catalogue ce weekend ! 🌿 Profitez-en sur notre boutique en ligne.");

  const generateVCF = (client) => {
    const name = `Mystik - Client ${client.lastName} ${client.firstName}`.trim();
    const vcfContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      `TEL;TYPE=CELL:${client.phone}`,
      `EMAIL:${client.email}`,
      'END:VCARD'
    ].join('\n');
    
    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Contact exporté !');
  };

  const exportAllVCF = () => {
    const vcfContent = clientsData.map(client => {
      const name = `Mystik - Client ${client.lastName} ${client.firstName}`.trim();
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        `TEL;TYPE=CELL:${client.phone}`,
        `EMAIL:${client.email}`,
        'END:VCARD'
      ].join('\n');
    }).join('\n');

    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mystik_Tous_Les_Clients.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Tous les contacts ont été exportés !');
  };

  const handleWhatsAppRelance = (client) => {
    const message = `Bonjour ${client.firstName}, c'est Mystik ! 🌿 Nous espérons que vous avez apprécié votre dernière commande. Profitez de -10% sur votre prochain pack avec le code MYSTIKVIP. À bientôt !`;
    const url = `https://wa.me/${client.phone.replace(/\s/g, '').replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const copyPromoMessage = () => {
    navigator.clipboard.writeText(promoMessage);
    toast.success('Message copié !');
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 italic-none">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div>
            <h1 className="text-3xl font-display font-black text-secondary tracking-tighter uppercase italic leading-none mb-3">
              Gestion <span className="text-amber-500">CLIENTS</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] italic opacity-70">
              Ambassadeurs de la légende • {clientsData.length} profils identifiés
            </p>
          </div>
          <button 
            onClick={() => setIsAssistantOpen(true)}
            className="bg-amber-500 text-secondary px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20"
          >
            <MessageCircle className="w-5 h-5" />
            Assistant WhatsApp
          </button>
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

      {/* Clients Desktop View */}
      <Card className="hidden md:block overflow-hidden border-none shadow-2xl bg-white rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary text-white">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] italic">Ambassadeur</th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] italic">Commandes</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] italic">Dépenses</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] italic">Dernière activité</th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] italic">Actions</th>
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
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={() => generateVCF(client)}
                            className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
                            title="Exporter Contact"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => handleWhatsAppRelance(client)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 transition-all"
                            title="Relancer sur WhatsApp"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Clients Mobile View */}
      <div className="md:hidden space-y-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="p-6 border-none shadow-xl bg-white rounded-none space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary text-amber-500 flex items-center justify-center font-display font-black text-xl italic shrink-0">
                {client.lastName.charAt(0)}{client.firstName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-black text-sm uppercase text-secondary tracking-tight">
                    {client.firstName} {client.lastName}
                  </p>
                  <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 uppercase tracking-widest">
                    {client.ordersCount} CMD
                  </span>
                </div>
                <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">{client.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Dépenses</p>
                <p className="font-black text-secondary text-xs">{formatPrice(client.totalSpent)}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Dernière activité</p>
                <p className="font-black text-secondary text-xs">{new Date(client.lastOrderDate).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => generateVCF(client)}
                className="flex items-center justify-center gap-2 bg-gray-100 text-secondary py-3 text-[10px] font-black uppercase tracking-widest"
              >
                <Download className="w-4 h-4" />
                Contact
              </button>
              <button 
                onClick={() => handleWhatsAppRelance(client)}
                className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && !isLoading && (
        <div className="py-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest italic opacity-50">
          Aucun client trouvé pour cette recherche
        </div>
      )}

      {/* WhatsApp Campaign Assistant Modal */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-secondary p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-display font-black uppercase italic tracking-tighter">Assistant <span className="text-amber-500">Campagne</span></h2>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Générez des listes de diffusion instantanément</p>
              </div>
              <button onClick={() => setIsAssistantOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              {/* Step 1: Export */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500 text-secondary flex items-center justify-center font-black text-[10px]">1</div>
                  <h3 className="font-black uppercase text-xs tracking-widest">Exporter les contacts pour WhatsApp</h3>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed italic">
                  Pour créer une <b>Liste de Diffusion</b> sur WhatsApp, vous devez d'abord avoir vos clients dans vos contacts. Ce fichier exporte tous vos clients sous le nom <b>"Mystik - Client [Nom]"</b>.
                </p>
                <button 
                  onClick={exportAllVCF}
                  className="w-full border-2 border-secondary p-4 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-all"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le fichier VCF (Tous les clients)
                </button>
              </div>

              {/* Step 2: Message */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500 text-secondary flex items-center justify-center font-black text-[10px]">2</div>
                  <h3 className="font-black uppercase text-xs tracking-widest">Préparer votre message promo</h3>
                </div>
                <div className="relative">
                  <textarea 
                    value={promoMessage}
                    onChange={(e) => setPromoMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-50 border-none p-4 text-[12px] font-medium text-secondary focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <button 
                    onClick={copyPromoMessage}
                    className="absolute bottom-4 right-4 bg-secondary text-white p-2 hover:bg-amber-500 transition-colors"
                    title="Copier le message"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Step 3: Action */}
              <div className="bg-amber-50 border border-amber-100 p-6 space-y-4">
                <div className="flex items-center gap-3 text-amber-900">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-black uppercase text-[10px] tracking-widest">C'est prêt !</h3>
                </div>
                <ol className="text-[10px] font-bold text-amber-900/70 space-y-2 uppercase tracking-tight list-decimal list-inside">
                  <li>Ouvrez le fichier téléchargé sur votre téléphone</li>
                  <li>Importez les contacts dans votre répertoire</li>
                  <li>Sur WhatsApp : Nouvelle Diffusion → Recherchez "Mystik"</li>
                  <li>Sélectionnez les clients et envoyez votre message copié !</li>
                </ol>
                <button 
                    onClick={() => window.open('https://web.whatsapp.com', '_blank')}
                    className="w-full bg-green-500 text-white py-4 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    <Share2 className="w-5 h-5" />
                    Ouvrir WhatsApp Web
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
