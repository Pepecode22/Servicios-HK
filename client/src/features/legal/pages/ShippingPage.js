import React from 'react';
import LegalLayout from './LegalLayout';

const ShippingPage = () => (
  <LegalLayout title="Condiciones de compra y despacho">
    <h2>CONDICIONES DE VENTA Y POLÍTICA DE DESPACHO / RETIRO</h2>

    <h3>Proceso de Compra:</h3>
    <ol>
      <li>El usuario selecciona los artículos de su interés en el catálogo y solicita una cotización a través del formulario web o canales de contacto directos.</li>
      <li>Un ejecutivo comercial emitirá una cotización formal detallando precios, condiciones de pago y plazos de entrega.</li>
      <li>La compra se concreta una vez aceptada la cotización formal y confirmado el método de pago acordado.</li>
    </ol>

    <h3>Modalidades de Entrega y Despacho:</h3>
    <ul>
      <li><strong>Retiro en Tienda / Bodega:</strong> Los clientes pueden retirar sus pedidos directamente en nuestras instalaciones sin costo adicional, previa confirmación por parte de un ejecutivo de que el pedido se encuentra preparado y listo para entrega.</li>
      <li><strong>Despacho con Transporte Propio:</strong> Para la Región Metropolitana y zonas de cobertura directa, Servicios HK realiza entregas a través de su flota propia según volúmenes y acuerdos logísticos previos.</li>
      <li><strong>Envíos por Courier / Transporte Externo:</strong> Para envíos a regiones o zonas no cubiertas por transporte propio, los despachos se realizan a través de empresas de transporte externas (tales como Chilexpress, Blue Express, Starken u otras transportistas a convenir). El envío se puede acordar bajo modalidad "Por Pagar" o "Pagado" e incluido en la facturación final, según lo convenido en la cotización.</li>
    </ul>

    <h3>Responsabilidad en la Recepción:</h3>
    <ul>
      <li>Al recibir o retirar el pedido, la persona a cargo debe verificar el estado de los embalajes y productos antes de firmar conforme la guía de despacho o orden de transporte.</li>
    </ul>
  </LegalLayout>
);

export default ShippingPage;
