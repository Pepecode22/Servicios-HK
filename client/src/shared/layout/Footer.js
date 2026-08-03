import React from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './Footer.css';

// Coordenadas proporcionadas: 32°47'14.0"S 71°11'37.2"W
const FALLBACK_POSITION = [-32.787222, -71.193667];

// Fix para ícono de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__logo-top">
        <img src="/LogoHK.svg" alt="Servicios HK" className="footer__logo-top-img" />
      </div>
      <div className="footer__inner container">
        {/* Columna 1: Información de contacto */}
        <div className="footer__col">
          <ul className="footer__info-list">
            <li>
              <svg className="footer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Lord Cochrane # 329 C La Calera.</span>
            </li>
            <li>
              <svg className="footer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.13 1.02.36 2.03.71 3a2 2 0 01-.45 2.11L6.09 8.19a16 16 0 006.72 6.72l1.16-1.17a2 2 0 012.11-.45c.97.35 1.98.58 3 .71a2 2 0 011.72 2.02z"/></svg>
              <div>
                <div>Celular: <a href="tel:+56992560031">+569 92560031</a></div>
                <div>Fijo: 552844931</div>
              </div>
            </li>
            <li>
              <svg className="footer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div className="footer__hours">
                <div><strong>Horario</strong></div>
                <div>-Lunes a Viernes</div>
                <div>Mañana: 08:30 a 13:00 horas</div>
                <div>Tarde: 15:00 a 18:00 horas</div>
                <div>-Sábado</div>
                <div>Mañana: 09:30 a 13:00 horas</div>
              </div>
            </li>
          </ul>
        </div>

        {/* Columna 2: Servicio al cliente */}
        <div className="footer__col">
          <h3 className="footer__heading">Servicio al cliente</h3>
          <nav aria-label="Servicio al cliente">
            <ul className="footer__links">
              <li><Link to="/terminos">Términos y condiciones</Link></li>
              <li><Link to="/privacidad">Políticas de privacidad</Link></li>
              <li><Link to="/condiciones-despacho">Condiciones de compra y despacho</Link></li>
              <li><Link to="/cambios-devoluciones">Cambios, devoluciones y garantías</Link></li>
              <li><Link to="/metodos-pago">Métodos de pago</Link></li>
            </ul>
          </nav>
        </div>

        {/* Columna 3: Mapa */}
        <div className="footer__col footer__col--map">
          <h3 className="footer__heading">Dónde estamos</h3>
          <div className="footer__map-wrapper">
            <MapContainer
              center={FALLBACK_POSITION}
              zoom={16}
              scrollWheelZoom={false}
              style={{ height: '200px', width: '100%', borderRadius: '10px' }}
              aria-label="Mapa de ubicación Servicios HK"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={FALLBACK_POSITION}>
                <Popup>
                  <strong>Servicios HK</strong><br />
                  Lord Cochrane # 329 C<br />
                  La Calera, V Región, Chile
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="footer__bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Servicios HK. Todos los derechos reservados.</p>
          <p>La Calera, Región de Valparaíso, Chile</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
