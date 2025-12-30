import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DealerPage from './pages/DealerPage';
import Login from './pages/Login';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import { CartProvider } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { routeMap } from './routeMap';

function App() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <CartProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header user={user} userRole={userRole} />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path={"/"} element={<HomePage />} />
              <Route path={"/home"} element={<HomePage />} />
              <Route path={`/${routeMap.products}`} element={<ProductsPage />} />
              <Route path={"/product"} element={<ProductsPage />} />
              <Route path={`/${routeMap.products}/:id`} element={<ProductDetailPage />} />
              <Route path={"/product/:id"} element={<ProductDetailPage />} />
              <Route path={`/${routeMap.about}`} element={<AboutPage />} />
              <Route path={`/${routeMap.contact}`} element={<ContactPage />} />
              <Route path={`/${routeMap.login}`} element={<Login />} />

              {/* Protected Routes */}
              <Route
                path={`/${routeMap.cart}`}
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`/${routeMap.profile}`}
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`/${routeMap.dealers}`}
                element={
                  <ProtectedRoute>
                    <DealerPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path={`/${routeMap.adminDashboard}`}
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`/${routeMap.adminUsers}`}
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`/${routeMap.adminOrders}`}
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`/${routeMap.adminProducts}`}
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`/${routeMap.adminForms}`}
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`/${routeMap.adminDealers}`}
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`/${routeMap.adminMessages}`}
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`/${routeMap.adminFeedback}`}
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`/${routeMap.adminProductsNew}`}
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`/${routeMap.adminAnalytics}`}
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;