import React, { useEffect, useMemo } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, Clock, Star } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const { orders, fetchOrders, isLoading } = useAdminStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(price)) + ' FCFA';
  };

  // Calcul des données pour le graphique sur les 7 derniers jours
  const chartData = useMemo(() => {
    const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const now = new Date();
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dayLabel = days[d.getDay()];
      const dayStr = d.toLocaleDateString();
      
      const dayTotal = orders
        .filter(o => new Date(o.date).toLocaleDateString() === dayStr)
        .reduce((acc, o) => acc + o.total, 0);
        
      return { name: dayLabel, value: dayTotal };
    });
  }, [orders]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
    const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
    const pendingOrders = orders.filter(o => o.status === 'En attente').length;
    
    return [
      { label: 'Chiffre d\'Affaires', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Commandes Totales', value: orders.length, icon: ShoppingCart, color: 'text-secondary', bg: 'bg-gray-100' },
      { label: 'Panier Moyen', value: formatPrice(avgOrder), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'En Attente', value: pendingOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(-5).reverse(), [orders]);

  if (isLoading) return <div className="animate-pulse space-y-8 p-12">
    <div className="grid grid-cols-4 gap-6 h-32 bg-gray-100 rounded-none" />
    <div className="h-96 bg-gray-100 rounded-none" />
  </div>;

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-display font-bold uppercase italic tracking-tight">Tableau de Bord <span className="text-amber-500">MYSTIK</span></h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-8 border-none shadow-sm flex items-center space-x-6 bg-white rounded-none">
            <div className={`p-5 rounded-none ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
              <p className={`text-xl font-bold text-secondary tracking-tighter ${stat.label.includes('Chiffre') ? 'text-amber-600' : ''}`}>{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <Card className="lg:col-span-2 p-10 border-none shadow-sm bg-white rounded-none">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-xl font-display font-bold text-secondary uppercase italic tracking-tight underline decoration-amber-500 decoration-4 underline-offset-8">Flux des ventes (FCFA)</h3>
            <Badge variant="primary" className="bg-secondary text-white">Performances 7j</Badge>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis 
                  hide={true}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    border: 'none', 
                    borderRadius: '0px',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                  itemStyle={{ color: '#d4af37' }}
                  formatter={(value) => formatPrice(value)}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#d4af37" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Orders List */}
        <Card className="p-10 border-none shadow-sm bg-white rounded-none">
          <h3 className="text-xl font-display font-bold text-secondary mb-10 uppercase italic tracking-tight">Derniers Honoraires</h3>
          <div className="space-y-8">
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-300 py-16 text-[10px] font-bold italic tracking-[0.3em] uppercase">Aucun flux récent</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs font-bold text-secondary tracking-tight underline decoration-amber-500/20">{order.id}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(order.date).toLocaleTimeString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-600 mb-2">{formatPrice(order.total)}</p>
                    <Badge variant={order.status === 'En attente' ? 'warning' : 'success'} className="scale-75 origin-right font-bold italic border-none">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
