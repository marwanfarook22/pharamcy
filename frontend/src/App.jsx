import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatbotProvider } from './context/ChatbotContext';
import { ProtectedRoute } from './utils/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BannerSlider from './components/layout/BannerSlider';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MedicineList from './components/medicines/MedicineList';
import Cart from './components/cart/Cart';
import Checkout from './components/checkout/Checkout';
import AdminDashboard from './components/admin/AdminDashboard';
import SalePage from './components/sale/SalePage';
import FiftyPercentOfferPage from './components/offers/FiftyPercentOfferPage';
import ProductDetail from './components/products/ProductDetail';
import Bills from './components/bills/Bills';
import Chatbot from './components/chatbot/Chatbot';
import BrandsPage from './components/brands/BrandsPage';
import CategoriesPage from './components/categories/CategoriesPage';
import CategoryLandingPage from './components/categories/CategoryLandingPage';
import TeamPage from './components/team/TeamPage';
import HelpCenter from './components/help/HelpCenter';
import ContactSupport from './components/support/ContactSupport';
import UserRefundRequests from './components/refunds/UserRefundRequests';
import Messages from './components/messages/Messages';
import ProfilePage from './components/profile/ProfilePage';
import AnnouncementBanner from './components/layout/AnnouncementBanner';

const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AnnouncementBanner />
      <div className="flex flex-1">
        <Navbar />
        <div className={`flex-1 ml-64 flex flex-col ${isHomePage ? 'mt-14' : 'mt-0'}`}>
              <div className="pt-2">
                <BannerSlider />
              </div>
              <main className="flex-1">
                <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MedicineList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/new-arrivals"
                  element={
                    <ProtectedRoute>
                      <SalePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/50-off"
                  element={
                    <ProtectedRoute>
                      <FiftyPercentOfferPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/brands"
                  element={
                    <ProtectedRoute>
                      <BrandsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <CategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/category/:categorySlug"
                  element={
                    <ProtectedRoute>
                      <CategoryLandingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <ProtectedRoute>
                      <ProductDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bills"
                  element={
                    <ProtectedRoute>
                      <Bills />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/team"
                  element={
                    <ProtectedRoute>
                      <TeamPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <HelpCenter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/support"
                  element={
                    <ProtectedRoute>
                      <ContactSupport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/refunds"
                  element={
                    <ProtectedRoute>
                      <UserRefundRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </div>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Chatbot />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </Router>
      </ChatbotProvider>
    </AuthProvider>
  );
}

export default App;

