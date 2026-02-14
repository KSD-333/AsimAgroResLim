import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../../context/CartContext';
import { routeMap } from '../../routeMap';

interface HeaderProps {
  user: any;
  userRole: string | null;
}

const Header: React.FC<HeaderProps> = ({ user, userRole }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const { items } = useCart();
  const totalItems = Array.isArray(items) ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDealerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: '/dealers' } });
    } else {
      navigate('/dealers');
    }
  };

  // Handler for protected navigation
  const handleProtectedNav = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate(`/${routeMap.login}`, { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  const navLinks = [
    { name: 'Home', path: `/${routeMap.home}` },
    { name: 'Products', path: `/${routeMap.products}` },
    { name: 'About Us', path: `/${routeMap.about}` },
    { name: 'Contact', path: `/${routeMap.contact}` }
    // { name: 'Become a Dealer', path: `/${routeMap.dealers}` }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-gradient-to-b from-black/70 to-transparent backdrop-blur-sm'
      }`}
    >
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="Asim Agro Research logo"
              className="h-12 w-auto object-contain"
            />
            <span className={`text-xl font-bold transition-colors ${isScrolled ? 'text-primary-900' : 'text-white'}`}>ASIM AGRO RESEARCH</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) =>
              link.name === 'Become a Dealer' ? (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={handleProtectedNav(link.path)}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? (isScrolled ? 'text-primary-600' : 'text-accent-300')
                      : (isScrolled ? 'text-gray-600 hover:text-primary-600' : 'text-white hover:text-accent-300')
                  }`}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? (isScrolled ? 'text-primary-600' : 'text-accent-300')
                      : (isScrolled ? 'text-gray-600 hover:text-primary-600' : 'text-white hover:text-accent-300')
                  }`}
                >
                  {link.name}
                </Link>
              )
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href={`/${routeMap.cart}`}
              onClick={handleProtectedNav(`/${routeMap.cart}`)}
              className={`relative transition-colors ${
                isScrolled ? 'text-gray-600 hover:text-primary-600' : 'text-white hover:text-accent-300'
              }`}
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </a>

            {user ? (
              <div ref={dropdownRef} className="relative">
                <button 
                  className={`flex items-center space-x-2 transition-colors ${
                    isScrolled ? 'text-gray-600 hover:text-primary-600' : 'text-white hover:text-accent-300'
                  }`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <User className="w-6 h-6" />
                  <span>{user.displayName || user.email}</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to={`/${routeMap.profile}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    {userRole === 'admin' && (
                      <Link
                        to={`/${routeMap.adminDashboard}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to={`/${routeMap.login}`}
                  className={`transition-colors ${
                    isScrolled ? 'text-gray-600 hover:text-primary-600' : 'text-white hover:text-accent-300'
                  }`}
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden transition-colors ${
              isScrolled ? 'text-gray-600 hover:text-primary-600' : 'text-white hover:text-accent-300'
            }`}
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) =>
                link.name === 'Become a Dealer' ? (
                  <a
                    key={link.path}
                    href={link.path}
                    onClick={handleProtectedNav(link.path)}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'text-primary-600'
                        : 'text-gray-600 hover:text-primary-600'
                    }`}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'text-primary-600'
                        : 'text-gray-600 hover:text-primary-600'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              )}
              <a
                href={`/${routeMap.cart}`}
                onClick={handleProtectedNav(`/${routeMap.cart}`)}
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                Cart
              </a>
              {user ? (
                <div ref={dropdownRef} className="relative">
                  <button 
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <User className="w-6 h-6" />
                    <span>{user.displayName || user.email}</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to={`/${routeMap.profile}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      {userRole === 'admin' && (
                        <Link
                          to={`/${routeMap.adminDashboard}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to={`/${routeMap.login}`}
                    className="text-gray-600 hover:text-primary-600"
                  >
                    Login
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;