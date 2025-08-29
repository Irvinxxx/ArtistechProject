import { useState, useContext, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Palette, Menu, X, User, ShoppingCart, LogOut, Settings, LayoutDashboard, Heart, Eye, MessageSquare, Bell, Briefcase } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LoginModal from './LoginModal.jsx'
import SignupModal from './SignupModal.jsx'
import { AuthContext } from '../context/AuthContext.jsx'
import { CartContext } from '../context/CartContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead([notification.id]);
    }
    navigate(notification.link || '/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map(notif => (
            <DropdownMenuItem key={notif.id} onClick={() => handleNotificationClick(notif)} className={`cursor-pointer ${!notif.is_read ? 'font-bold' : ''}`}>
              <div className="flex flex-col">
                <span>{notif.message}</span>
                <span className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</span>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No notifications yet.</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)

  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const NavLinkItem = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
          isActive
            ? 'text-purple-600 bg-purple-50'
            : 'text-gray-700 hover:text-purple-600'
        }`
      }
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </NavLink>
  );

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center cursor-pointer">
              <Palette className="h-8 w-8 text-purple-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">ArtisTech</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <NavLink to="/artworks" className={({ isActive }) => isActive ? "text-purple-600 font-semibold" : "text-gray-600 hover:text-purple-600"}>Artworks</NavLink>
              <NavLink to="/auctions" className={({ isActive }) => isActive ? "text-purple-600 font-semibold" : "text-gray-600 hover:text-purple-600"}>Auctions</NavLink>
              <NavLink to="/artists/search" className={({ isActive }) => isActive ? "text-purple-600 font-semibold" : "text-gray-600 hover:text-purple-600"}>Find an Artist</NavLink>
              {user?.user_type === 'artist' && (
                <NavLink to="/commissions/browse" className={({ isActive }) => isActive ? "text-purple-600 font-semibold" : "text-gray-600 hover:text-purple-600"}>
                  Browse Commissions
                </NavLink>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <NotificationBell />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        {user.name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/messages">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Messages</span>
                        </Link>
                      </DropdownMenuItem>
                      {user.user_type === 'artist' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to={`/artists/${user.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Profile</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/commissions/browse">
                              <Briefcase className="mr-2 h-4 w-4" />
                              <span>Browse Commissions</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      {user.user_type === 'client' && (
                        <DropdownMenuItem asChild>
                          <Link to="/wishlist">
                            <Heart className="mr-2 h-4 w-4" />
                            <span>Wishlist</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setIsSignupOpen(true)}
                  >
                    Sign Up
                  </Button>
                </>
              )}
              {(user?.user_type === 'client' || !user) && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/cart')}>
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && <span className="ml-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/'); }}
                  className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                    window.location.pathname === '/' 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/artworks'); }}
                  className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                    window.location.pathname === '/artworks' 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  Artworks
                </button>
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/auctions'); }}
                  className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                    window.location.pathname === '/auctions' 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  Auctions
                </button>
                {user?.user_type === 'artist' && (
                  <>
                    <button
                      onClick={() => { setIsMenuOpen(false); navigate('/upload'); }}
                      className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                        window.location.pathname === '/upload' 
                          ? 'text-purple-600 bg-purple-50' 
                          : 'text-gray-700 hover:text-purple-600'
                      }`}
                    >
                      Upload
                    </button>
                    <button
                      onClick={() => { setIsMenuOpen(false); navigate('/commissions/browse'); }}
                      className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                        window.location.pathname === '/commissions/browse' 
                          ? 'text-purple-600 bg-purple-50' 
                          : 'text-gray-700 hover:text-purple-600'
                      }`}
                    >
                      Browse Commissions
                    </button>
                  </>
                )}
                <div className="pt-4 pb-3 border-t border-gray-200">
                  {user ? (
                    <>
                      <div className="flex items-center px-5">
                        <div className="flex-shrink-0">
                          <User className="h-8 w-8 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium text-gray-800">{user.name}</div>
                          <div className="text-sm font-medium text-gray-500">{user.email}</div>
                        </div>
                        <div className="ml-auto">
                          <NotificationBell />
                        </div>
                      </div>
                      <div className="mt-3 px-2 space-y-1">
                        <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50">Dashboard</Link>
                        <Link to="/messages" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50">Messages</Link>
                        {user.user_type === 'artist' && (
                          <>
                            <Link to={`/artists/${user.id}`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50">View Profile</Link>
                            <Link to="/commissions/browse" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50">Browse Commissions</Link>
                          </>
                        )}
                        {user.user_type === 'client' && (
                          <>
                            <Link to="/wishlist" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50">Wishlist</Link>
                            <Link to="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50">Cart</Link>
                          </>
                        )}
                        <Link to="/settings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50">Settings</Link>
                        <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50">
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setIsLoginOpen(true)
                          setIsMenuOpen(false)
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <SignupModal 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </>
  )
}

export default Header