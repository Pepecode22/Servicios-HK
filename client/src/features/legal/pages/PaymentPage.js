import React from 'react';
import LegalLayout from './LegalLayout';

const PaymentPage = () => (
  <LegalLayout title="Métodos de pago">
    <h2>MÉTODOS DE PAGO ACEPTADOS</h2>
    <p>
      En Servicios HK facilitamos el proceso de adquisición para personas y empresas ofreciendo diversas alternativas de pago para concretar sus pedidos:
    </p>

    <ul>
      <li><strong>Transferencia Bancaria Electrónica:</strong> Pago directo a nuestra Cuenta Corriente institucional. Es el método recomendado para agilizar la preparación y despacho de pedidos B2B y cotizaciones de volumen.</li>
      <li><strong>Tarjetas de Débito y Crédito:</strong> Aceptadas presencialmente en tienda o mediante links de pago seguros (Webpay / Pasarela de pago habilitada).</li>
      <li><strong>Efectivo:</strong> Aceptado directamente para compras o retirados presenciales en tienda/bodega.</li>
      <li><strong>Cheques:</strong> Sujetos a evaluación comercial previa, verificación de fondos y confirmación por parte del departamento de finanzas de Servicios HK antes de la entrega o despacho de la mercadería.</li>
    </ul>
  </LegalLayout>
);

export default PaymentPage;
