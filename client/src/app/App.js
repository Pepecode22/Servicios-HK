import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Providers
import { CartProvider } from '../shared/context/CartContext';
import { AuthProvider } from '../shared/context/AuthContext';

// Layout
import Navbar from '../shared/layout/Navbar';
import Footer from '../shared/layout/Footer';

// Páginas públicas
import HomePage from '../features/home/pages/HomePage';
import CatalogPage from '../features/catalog/pages/CatalogPage';
import QuotePage from '../features/quote/pages/QuotePage';
import ContactPage from '../features/contact/pages/ContactPage';

// Páginas admin
import AdminLoginPage from '../features/admin/pages/AdminLoginPage';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import PrivateRoute from '../shared/layout/PrivateRoute';

// Páginas legales
import TermsPage from '../features/legal/pages/TermsPage';
import PrivacyPage from '../features/legal/pages/PrivacyPage';
import ShippingPage from '../features/legal/pages/ShippingPage';
import ReturnsPage from '../features/legal/pages/ReturnsPage';
import PaymentPage from '../features/legal/pages/PaymentPage';

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 72px)' }}>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="light"
          />
          <Routes>
            {/* Rutas públicas con layout completo */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/catalogo" element={<PublicLayout><CatalogPage /></PublicLayout>} />
            <Route path="/cotizacion" element={<PublicLayout><QuotePage /></PublicLayout>} />
            <Route path="/contacto" element={<PublicLayout><ContactPage /></PublicLayout>} />

            {/* Páginas legales */}
            <Route path="/terminos" element={<PublicLayout><TermsPage /></PublicLayout>} />
            <Route path="/privacidad" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
            <Route path="/condiciones-despacho" element={<PublicLayout><ShippingPage /></PublicLayout>} />
            <Route path="/cambios-devoluciones" element={<PublicLayout><ReturnsPage /></PublicLayout>} />
            <Route path="/metodos-pago" element={<PublicLayout><PaymentPage /></PublicLayout>} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/*" element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
