import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Providers
import { CartProvider }  from '../shared/context/CartContext';
import { AuthProvider }  from '../shared/context/AuthContext';

// Layout
import Navbar from '../shared/layout/Navbar';
import Footer from '../shared/layout/Footer';

// Páginas públicas
import HomePage    from '../features/home/pages/HomePage';
import CatalogPage from '../features/catalog/pages/CatalogPage';
import QuotePage   from '../features/quote/pages/QuotePage';
import ContactPage from '../features/contact/pages/ContactPage';

// Páginas admin
import AdminLoginPage  from '../features/admin/pages/AdminLoginPage';
import AdminDashboard  from '../features/admin/pages/AdminDashboard';
import PrivateRoute    from '../shared/layout/PrivateRoute';

// Páginas legales
import TermsPage    from '../features/legal/pages/TermsPage';
import PrivacyPage  from '../features/legal/pages/PrivacyPage';
import ShippingPage from '../features/legal/pages/ShippingPage';
import ReturnsPage  from '../features/legal/pages/ReturnsPage';
import PaymentPage  from '../features/legal/pages/PaymentPage';

const BRAND = 'Servicios HK';

// Mapa de ruta → [title, description]. Sirve tanto para document.title como
// para actualizar el meta description en cada navegación, mejorando el
// posicionamiento en buscadores sin necesitar react-helmet.
const PAGE_META = {
  '/':                      [`${BRAND} — EPP, Aseo e Industrial | La Calera, Chile`,       'Proveedor de Equipos de Protección Personal, artículos de aseo e industrial en La Calera, V Región. Cotiza en línea sin compromiso ni registro.'],
  '/catalogo':              [`Catálogo EPP e Industrial | ${BRAND}`,                        'Explora nuestro catálogo de EPP, artículos de aseo e industrial. Filtra por categoría o marca y arma tu cotización en línea.'],
  '/cotizacion':            [`Tu Cotización | ${BRAND}`,                                   'Revisa los productos seleccionados y envía tu cotización. Sin registro, sin compromiso.'],
  '/contacto':              [`Contacto | ${BRAND}`,                                        'Contáctanos en La Calera, V Región. Escríbenos por nuestro formulario o visítanos en Lord Cochrane 329 C.'],
  '/terminos':              [`Términos y Condiciones | ${BRAND}`,                          'Términos y condiciones del servicio de Servicios HK.'],
  '/privacidad':            [`Política de Privacidad | ${BRAND}`,                          'Política de privacidad y tratamiento de datos personales de Servicios HK.'],
  '/condiciones-despacho':  [`Condiciones de Despacho | ${BRAND}`,                        'Información sobre plazos, zonas de despacho y condiciones de entrega de Servicios HK.'],
  '/cambios-devoluciones':  [`Cambios y Devoluciones | ${BRAND}`,                         'Política de cambios y devoluciones de Servicios HK.'],
  '/metodos-pago':          [`Métodos de Pago | ${BRAND}`,                                'Medios de pago aceptados por Servicios HK.'],
};

// Actualiza document.title y el meta description en cada cambio de ruta.
// Para rutas desconocidas (ej. /admin) se usa el título base.
const PageTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const [title, desc] = PAGE_META[pathname] ?? [`${BRAND} — EPP, Aseo e Industrial`, ''];
    document.title = title;
    if (desc) {
      const tag = document.querySelector('meta[name="description"]');
      if (tag) tag.setAttribute('content', desc);
    }
    // Canonical URL dinámica
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `https://www.servicioshk.cl${pathname}`;
  }, [pathname]);

  return null;
};

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
          <PageTitle />
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
            {/* Rutas públicas */}
            <Route path="/"                     element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/catalogo"             element={<PublicLayout><CatalogPage /></PublicLayout>} />
            <Route path="/cotizacion"           element={<PublicLayout><QuotePage /></PublicLayout>} />
            <Route path="/contacto"             element={<PublicLayout><ContactPage /></PublicLayout>} />

            {/* Páginas legales */}
            <Route path="/terminos"             element={<PublicLayout><TermsPage /></PublicLayout>} />
            <Route path="/privacidad"           element={<PublicLayout><PrivacyPage /></PublicLayout>} />
            <Route path="/condiciones-despacho" element={<PublicLayout><ShippingPage /></PublicLayout>} />
            <Route path="/cambios-devoluciones" element={<PublicLayout><ReturnsPage /></PublicLayout>} />
            <Route path="/metodos-pago"         element={<PublicLayout><PaymentPage /></PublicLayout>} />

            {/* Admin (excluido del SEO con noindex en el propio panel) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/*"     element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
