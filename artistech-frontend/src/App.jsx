import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ArtworksPage from './pages/ArtworksPage'
import ArtworkDetailPage from './pages/ArtworkDetailPage'
import AuctionsPage from './pages/AuctionsPage'
import AuctionDetailPage from './pages/AuctionDetailPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import UploadArtwork from './components/UploadArtwork'
import AIDetectionPage from './components/AIDetectionPage'
import AntiGrabDemo from './components/AntiGrabDemo'
import PrivateRoute from './components/common/PrivateRoute'
import ClientOnlyRoute from './components/common/ClientOnlyRoute'
import ArtistOnlyRoute from './components/common/ArtistOnlyRoute'
import CreateAuctionPage from './pages/CreateAuctionPage';
import SettingsPage from './pages/SettingsPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailPage from './pages/PaymentFailPage';
import ArtistProfilePage from './pages/ArtistProfilePage';
import MessagesPage from './pages/MessagesPage';
import FindArtistPage from './pages/FindArtistPage';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ArtistDashboard from './components/dashboard/ArtistDashboard';
import ClientDashboard from './components/dashboard/ClientDashboard';
import ManageCommissionListingPage from './pages/ManageCommissionListingPage';
import CommissionRequestPage from './pages/CommissionRequestPage';
import BrowseCommissionsPage from './pages/BrowseCommissionsPage';
import SimpleProjectPage from './pages/SimpleProjectPage';
import ProposalReviewPage from './pages/ProposalReviewPage';
import CommissionCheckoutPage from './pages/CommissionCheckoutPage'; // Import the new page
import CreatePublicCommissionPage from './pages/CreatePublicCommissionPage';
import { AuthContext } from './context/AuthContext';
import { useContext, useEffect } from 'react';
import './App.css'
import { Toaster } from 'sonner';
import ProjectsPage from './pages/ProjectsPage';

const UnauthorizedPage = () => (
  <div className="text-center py-16">
    <h1 className="text-3xl font-bold">Unauthorized</h1>
    <p>You do not have permission to view this page.</p>
  </div>
);

const DashboardRedirect = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.user_type) {
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    case 'artist':
      return <Navigate to="/artist/dashboard" />;
    case 'client':
      return <Navigate to="/client/dashboard" />;
    default:
      return <Navigate to="/" />;
  }
};

// A wrapper component for animating page transitions
const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function App() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    // Global event listener to disable right-click on images
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    // Global event listener to disable drag-and-drop on images
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    // Global event listener to disable Ctrl+S
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    // DevTools detection
    const devtools = {
      isOpen: false,
      orientation: null,
    };
    
    const threshold = 160;

    const emitEvent = (isOpen, orientation) => {
      window.dispatchEvent(
        new CustomEvent('devtoolschange', {
          detail: {
            isOpen,
            orientation,
          },
        })
      );
    };

    const main = ({ emitEvents = true } = {}) => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      const orientation = widthThreshold ? 'vertical' : 'horizontal';

      if (
        !(heightThreshold && widthThreshold) &&
        ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) ||
          widthThreshold ||
          heightThreshold)
      ) {
        if (!devtools.isOpen || devtools.orientation !== orientation) {
          emitEvents && emitEvent(true, orientation);
        }

        devtools.isOpen = true;
        devtools.orientation = orientation;
      } else {
        if (devtools.isOpen) {
          emitEvents && emitEvent(false, null);
        }

        devtools.isOpen = false;
        devtools.orientation = null;
      }
    };
    
    main({ emitEvents: false });
    const intervalId = setInterval(main, 500);

    const onDevToolsChange = (e) => {
      if (e.detail.isOpen) {
        document.body.classList.add('devtools-open');
      } else {
        document.body.classList.remove('devtools-open');
      }
    };

    window.addEventListener('devtoolschange', onDevToolsChange);


    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(intervalId);
      window.removeEventListener('devtoolschange', onDevToolsChange);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
            <Route path="/artworks" element={<AnimatedPage><ArtworksPage /></AnimatedPage>} />
            <Route path="/artworks/:id" element={<AnimatedPage><ArtworkDetailPage /></AnimatedPage>} />
            <Route path="/artists/:id" element={<AnimatedPage><ArtistProfilePage /></AnimatedPage>} />
            <Route path="/artists/search" element={<AnimatedPage><FindArtistPage /></AnimatedPage>} />
            <Route path="/auctions" element={<AnimatedPage><AuctionsPage /></AnimatedPage>} />
            <Route path="/auctions/:id" element={<AnimatedPage><AuctionDetailPage /></AnimatedPage>} />

            {/* Auth Routes */}
            <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
            <Route path="/signup" element={<AnimatedPage><SignupPage /></AnimatedPage>} />

            {/* Authenticated Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<AnimatedPage><DashboardRedirect /></AnimatedPage>} />
              <Route path="/admin/dashboard" element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
              <Route path="/artist/dashboard" element={<AnimatedPage><ArtistDashboard /></AnimatedPage>} />
              <Route path="/client/dashboard" element={<AnimatedPage><ClientDashboard /></AnimatedPage>} />
              
              {/* Artist-specific routes */}
              <Route element={<ArtistOnlyRoute />}>
                <Route path="/upload" element={<AnimatedPage><UploadArtwork /></AnimatedPage>} />
                <Route path="/create-auction" element={<AnimatedPage><CreateAuctionPage /></AnimatedPage>} />
                <Route path="/commissions/manage-listing" element={<AnimatedPage><ManageCommissionListingPage /></AnimatedPage>} />
                <Route path="/commissions/browse" element={<AnimatedPage><BrowseCommissionsPage /></AnimatedPage>} />
              </Route>

              {/* General Authenticated routes */}
              <Route path="/settings" element={<AnimatedPage><SettingsPage /></AnimatedPage>} />

              {/* Client-only routes */}
              <Route element={<ClientOnlyRoute />}>
                <Route path="/cart" element={<AnimatedPage><CartPage /></AnimatedPage>} />
                <Route path="/checkout" element={<AnimatedPage><CheckoutPage /></AnimatedPage>} />
                <Route path="/wishlist" element={<AnimatedPage><WishlistPage /></AnimatedPage>} />
                <Route path="/commissions/request" element={<AnimatedPage><CommissionRequestPage /></AnimatedPage>} />
                <Route path="/commissions/post-public" element={<AnimatedPage><CreatePublicCommissionPage /></AnimatedPage>} />
                <Route path="/commissions/:commissionId/proposals" element={<AnimatedPage><ProposalReviewPage /></AnimatedPage>} />
                <Route path="/commissions/checkout" element={<AnimatedPage><CommissionCheckoutPage /></AnimatedPage>} /> {/* Add the new route */}
              </Route>

              {/* Routes for all authenticated users */}
              <Route path="/order-confirmation" element={<AnimatedPage><OrderConfirmationPage /></AnimatedPage>} />
              <Route path="/payment-success" element={<AnimatedPage><PaymentSuccessPage /></AnimatedPage>} />
              <Route path="/payment-fail" element={<AnimatedPage><PaymentFailPage /></AnimatedPage>} />
              <Route path="/messages" element={<AnimatedPage><MessagesPage /></AnimatedPage>} />
              <Route path="/messages/:artistId" element={<AnimatedPage><MessagesPage /></AnimatedPage>} />
              <Route path="/project/:projectId" element={<AnimatedPage><SimpleProjectPage /></AnimatedPage>} />
              <Route path="/my-projects" element={<AnimatedPage><ProjectsPage /></AnimatedPage>} />
            </Route>
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <Toaster position="bottom-right" richColors />
    </div>
  )
}

export default App
