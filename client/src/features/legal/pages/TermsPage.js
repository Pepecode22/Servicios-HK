import React from 'react';
import LegalLayout from './LegalLayout';

const TermsPage = () => (
  <LegalLayout title="Términos y condiciones">
    <h2>TÉRMINOS Y CONDICIONES GENERALES</h2>
    <p>
      El presente sitio web opera como una plataforma de catálogo de productos e información de Servicios HK, orientada a la cotización y suministro de artículos industriales, productos de aseo, elementos de protección personal (EPP), herramientas y suministros afines.
    </p>

    <ol>
      <li>
        <strong>Naturaleza del Sitio:</strong> El sitio web www.servicioshk.cl no constituye una tienda con transacciones electrónicas automatizadas en línea. Su función principal es dar a conocer nuestro catálogo de productos y permitir a los usuarios solicitar cotizaciones a través de los formularios disponibles.
      </li>
      <li>
        <strong>Cotizaciones y Precios:</strong> Las cotizaciones generadas a través del sitio o por correo electrónico son referenciales y tendrán la validez en días hábiles explícitamente indicada en el documento emitido por el equipo comercial de Servicios HK. Los precios exhibidos en el catálogo web pueden no incluir IVA o sufrir modificaciones sin previo aviso hasta la emisión formal de la cotización o nota de venta.
      </li>
      <li>
        <strong>Disponibilidad de Stock:</strong> La confirmación final de factibilidad técnica y disponibilidad de stock para productos industriales o de volumen se ratificará formalmente al momento de procesar la cotización con un ejecutivo.
      </li>
      <li>
        <strong>Capacidad Legal:</strong> Las solicitudes de cotización pueden ser realizadas por personas naturales o jurídicas (empresas) debidamente representadas.
      </li>
    </ol>
  </LegalLayout>
);

export default TermsPage;
