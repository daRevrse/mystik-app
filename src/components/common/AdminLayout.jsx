import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Coffee, ArrowLeft, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de Bord', path: '/admin' },
    { icon: ShoppingCart, label: 'Commandes', path: '/admin/orders' },
    { icon: Coffee, label: 'Produits', path: '/admin/products' },
  ];

  return (
    <div className="flex h-screen bg-[#fafaf9] flex-col md:flex-row overflow-hidden italic-none">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 bg-secondary text-white flex-col h-full shrink-0">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/mystik/logo mystik.jpg" alt="Logo Mystik" className="w-10 h-10 object-contain rounded-none brightness-0 invert" />
            <span className="font-display text-2xl font-bold tracking-tight text-white uppercase italic">
              MYSTIK<span className="text-amber-500">.</span>
            </span>
            <span className="ml-2 bg-amber-500 text-secondary text-[10px] px-2 py-0.5 font-bold tracking-widest leading-none italic">ADMIN</span>
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
                className={`flex items-center space-x-3 px-4 py-3 rounded-none transition-all duration-300 font-bold text-[11px] uppercase tracking-widest ${
                  isActive 
                    ? 'bg-amber-500 text-secondary shadow-xl shadow-amber-500/10 scale-105 origin-left' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-secondary' : 'text-gray-400'}`} />
                <span>{item.label}</span>
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

      {/* Mobile Top Header - Clean & Simple */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <Link to="/" className="font-display text-xl font-bold uppercase italic flex items-center gap-2">
          <img src="/images/mystik/logo mystik.jpg" alt="Logo" className="w-6 h-6 grayscale" />
          MYSTIK<span className="text-amber-500">.</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-amber-50 flex items-center justify-center text-amber-600 text-[10px] font-bold border border-amber-100">
            RB
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow overflow-auto bg-[#fafaf9] pb-24 md:pb-0">
        <header className="bg-white border-b border-gray-100 px-10 py-6 justify-between items-center sticky top-0 z-10 hidden md:flex">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em] italic">Console de Gestion Mystik Legend</p>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-[11px] font-bold text-secondary uppercase tracking-tight">Responsable Boutique</p>
              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Lomé, Togo 🇹🇬</p>
            </div>
            <div className="w-10 h-10 rounded-none bg-secondary text-amber-500 flex items-center justify-center font-bold border-2 border-amber-500/20 shadow-lg italic">
              GM
            </div>
          </div>
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
