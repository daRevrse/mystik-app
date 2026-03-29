import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCartStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const itemCount = getTotalItems();

  const isTransparent = location.pathname === '/' && !isScrolled;
  const textColor = isTransparent ? 'text-white' : 'text-secondary';
  const navLinkClass = isTransparent 
    ? 'text-white/80 hover:text-white' 
    : 'text-gray-600 hover:text-primary-600';

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-500 
      ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}
    `}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src={isTransparent ? "/images/mystik/logo mystik black.png" : "/images/mystik/logo mystik.png"} 
            alt="Logo Mystik" 
            className="w-10 h-10 object-contain transition-all duration-500" 
          />
          <span className={`font-display text-2xl font-bold tracking-tighter uppercase italic transition-colors duration-500 ${textColor}`}>
            MYSTIK<span className={isTransparent ? 'text-white' : 'text-primary-500'}>.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-10 text-[11px] font-bold tracking-[0.2em]">
          <Link to="/" className={`transition-all duration-500 ${location.pathname === '/' && !isTransparent ? 'text-primary-600' : navLinkClass}`}>
            BOUTIQUE
          </Link>
          <a href="#about" className={`transition-all duration-500 ${navLinkClass}`}>
            NOTRE HISTOIRE
          </a>
          <Link to="/admin" className={`flex items-center transition-all duration-500 ${navLinkClass}`}>
            <User className="w-3.5 h-3.5 mr-2" />
            ADMIN
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-5">
          <Link to="/checkout" className={`relative p-2 transition-all duration-500 ${isTransparent ? 'text-white' : 'text-secondary hover:text-primary-600'}`}>
            <ShoppingBag className="w-5 h-5 stroke-[2.5px]" />
            {itemCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-none animate-pulse ${isTransparent ? 'bg-white text-secondary' : 'bg-primary-500 text-white'}`}>
                {itemCount}
              </span>
            )}
          </Link>
          
          <button 
            className={`md:hidden p-2 transition-colors duration-500 ${isTransparent ? 'text-white' : 'text-secondary'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
          <div className="flex flex-col p-4 space-y-4 text-sm font-bold tracking-widest text-center">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>BOUTIQUE</Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>ADMINISTRATION</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
