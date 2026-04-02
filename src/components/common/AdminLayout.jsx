import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Coffee, ArrowLeft, Settings, Wallet } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { newOrdersCount } = useAdminStore();

  useEffect(() => {
    const isPasswordEnabled = localStorage.getItem('mystikPasswordEnabled') !== 'false';
    const isAdmin = localStorage.getItem('isAdmin');
    if (isPasswordEnabled && isAdmin !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  const isPasswordEnabled = localStorage.getItem('mystikPasswordEnabled') !== 'false';
  if (isPasswordEnabled && localStorage.getItem('isAdmin') !== 'true') {
    return null;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de Bord', path: '/admin' },
    { icon: ShoppingCart, label: 'Commandes', path: '/admin/orders', badge: newOrdersCount },
    { icon: Coffee, label: 'Produits', path: '/admin/products' },
    // { icon: Wallet, label: 'Caisse', path: '/admin/caisse' },
    { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#fafaf9] flex-col md:flex-row overflow-hidden italic-none">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 bg-secondary text-white flex-col h-full shrink-0">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/mystik/logo mystik black.png" alt="Logo Mystik" className="w-10 h-10 object-contain rounded-none" />
            <span className="font-display text-2xl font-bold tracking-tight text-white uppercase italic leading-none">
              MYSTIK<br />
              <span className="text-amber-500 text-xs">LEGEND'S DRINK</span>
            </span>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-2 mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-none transition-all duration-300 font-bold text-[11px] uppercase tracking-widest ${
                  isActive 
                    ? 'bg-amber-500 text-secondary shadow-xl shadow-amber-500/10 scale-105 origin-left' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-secondary' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && !isActive && (
                  <span className="bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-none animate-bounce shadow-lg">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 mt-auto border-t border-white/5 space-y-4">
          <Link to="/" className="flex items-center space-x-3 text-gray-500 hover:text-white transition-colors text-[10px] font-bold tracking-[0.3em] uppercase italic">
            <ArrowLeft className="w-4 h-4" />
            <span>Vers la boutique</span>
          </Link>
        </div>
      </aside>

      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <Link to="/" className="font-display text-xl font-bold uppercase italic flex items-center gap-2">
          <img src="/images/mystik/logo mystik.png" alt="Logo" className="w-6 h-6" />
          MYSTIK<span className="text-amber-500">.</span>
        </Link>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow overflow-auto bg-[#fafaf9] pb-24 md:pb-0">
        <header className="bg-white border-b border-gray-100 px-10 py-6 justify-between items-center sticky top-0 z-10 hidden md:flex">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em] italic leading-none">Console de Gestion • MYSTIK LEGEND'S DRINK</p>
        </header>

        <div className="p-6 md:p-12 animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION - App Look */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary text-white border-t border-white/5 px-6 py-4 flex justify-around items-center z-50 backdrop-blur-lg bg-secondary/95">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1.5 relative py-1"
            >
              <div className={`p-2 rounded-none transition-all duration-300 ${isActive ? 'text-amber-500' : 'text-gray-500'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge > 0 && !isActive && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[7px] w-3 h-3 flex items-center justify-center rounded-none shadow-lg">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {item.label === 'Tableau de Bord' ? 'Bord' : item.label}
              </span>
              {isActive && (
                <div className="absolute -top-4 w-8 h-1 bg-amber-500 rounded-none animate-fade-in" />
              )}
            </Link>
          );
        })}
        <Link to="/" className="flex flex-col items-center gap-1.5 py-1">
          <div className="p-2 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-gray-500">Shop</span>
        </Link>
      </nav>
    </div>
  );
};

export default AdminLayout;
