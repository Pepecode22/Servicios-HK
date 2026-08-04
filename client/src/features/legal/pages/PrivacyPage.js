import React from 'react';
import LegalLayout from './LegalLayout';

const PrivacyPage = () => (
  <LegalLayout title="Políticas de privacidad">
    <h2>POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE INFORMACIÓN</h2>
    <p>
      En Servicios HK valoramos y respetamos la privacidad de nuestros clientes y visitantes.
    </p>

    <ol>
      <li>
        <strong>Uso y Tratamiento de la Información:</strong> Dado el diseño y estructura de nuestros formularios (cotización y contacto), Servicios HK no almacena, retiene ni crea bases de datos automatizadas con la información ingresada. Los datos solicitados (nombre, RUT, razón social, correo electrónico, teléfono y requerimientos) son utilizados únicamente para procesar, gestionar y responder de forma directa a la solicitud de cotización o consulta formulada por el usuario.
      </li>
      <li>
        <strong>Confidencialidad:</strong> La información compartida por el usuario es estrictamente confidencial. No vendemos, cedemos ni compartimos datos con terceros, salvo para la gestión estrictamente necesaria de la entrega del pedido o prestación del servicio (por ejemplo, proporcionar la dirección al servicio de transporte o courier).
      </li>
      <li>
        <strong>Comunicaciones:</strong> No enviamos correos masivos de spam. Solo nos pondremos en contacto con usted en respuesta a sus requerimientos o para el seguimiento de la cotización solicitada.
      </li>
    </ol>
  </LegalLayout>
);

export default PrivacyPage;
