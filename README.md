# Servicios HK — Plataforma E-commerce

Plataforma web para catálogo y cotización de productos EPP, Aseo e Industrial.

Este documento describe la arquitectura completa del proyecto. Está pensado para
que cualquier programador pueda clonar el repositorio, instalarlo y entender
dónde está cada cosa sin necesitar explicaciones adicionales.

---

## Índice

1. [Arquitectura](#arquitectura)
2. [Stack tecnológico](#stack-tecnológico)
3. [Instalación](#instalación)
4. [Configuración de Supabase](#configuración-de-supabase)
5. [Modelo de datos](#modelo-de-datos)
6. [Catálogo de productos (Excel)](#catálogo-de-productos-excel)
7. [Referencia de la API](#referencia-de-la-api)
8. [Panel de administración](#panel-de-administración)
9. [Páginas del sitio](#páginas-del-sitio)
10. [Identidad visual](#identidad-visual)
11. [Seguridad](#seguridad)
12. [Deploy en producción](#deploy-en-producción)
13. [Próximos pasos sugeridos](#próximos-pasos-sugeridos)

---

## Arquitectura

Monorepo simple con dos aplicaciones independientes (`client` y `server`) y un
`package.json` raíz que solo orquesta scripts de conveniencia.

```
servicios-hk/
├── package.json                  # Scripts raíz (concurrently levanta client + server)
├── servicios-hk.code-workspace    # Workspace de VS Code con tareas preconfiguradas
│
├── client/                       # Frontend — React 18 (Create React App)
│   ├── public/
│   ├── .env.example
│   └── src/
│       ├── app/                  # Punto de entrada: App.js (rutas principales)
│       ├── features/              # Un folder por dominio de negocio
│       │   ├── home/
│       │   ├── catalog/
│       │   ├── quote/            # Carro de cotización
│       │   ├── contact/
│       │   ├── legal/            # Términos, privacidad, envíos, pagos, devoluciones
│       │   └── admin/            # Panel de administración
│       ├── shared/                # Código compartido entre features
│       │   ├── layout/           # Navbar, Footer
│       │   ├── context/          # AuthContext, CartContext
│       │   ├── services/         # Cliente axios (api.js)
│       │   └── styles/            # Estilos globales (CSS plano, sin frameworks)
│       └── index.js
│
└── server/                        # Backend — Node.js + Express
    ├── package.json
    ├── .env.example
    ├── supabase/
    │   └── schema.sql             # Esquema SQL a ejecutar en Supabase
    └── src/
        ├── server.js              # Punto de entrada — inicia el servidor HTTP
        ├── app.js                 # Configuración de Express (middlewares, rutas)
        ├── config/
        │   └── supabaseClient.js  # Cliente de Supabase
        ├── middleware/
        │   ├── auth.middleware.js       # Verificación de JWT
        │   └── rateLimit.middleware.js  # Límites de tasa (login y formularios)
        ├── modules/                # Un folder por dominio, cada uno con sus rutas y controlador
        │   ├── auth/
        │   ├── products/          # Lee el catálogo desde Excel (no usa Supabase)
        │   ├── quotes/
        │   ├── contact/
        │   └── admin/
        └── utils/
            ├── catalogStorage.js   # Lee/guarda el catálogo en Supabase Storage
            ├── generateExampleCatalog.js
            └── seed.js             # Crea la cuenta de administrador inicial
```

**Convención de nombres del backend:** cada módulo de negocio vive en su propia
carpeta bajo `src/modules/<nombre>/` con dos archivos: `<nombre>.routes.js`
(define los endpoints) y `<nombre>.controller.js` (contiene la lógica). Es el
único lugar al que hay que ir para entender o modificar una funcionalidad.

---

## Stack tecnológico

| Capa               | Tecnología                                                   |
|--------------------|---------------------------------------------------------------|
| Frontend           | React 18, React Router v6, Axios, React Hook Form, React Toastify |
| Estilos            | CSS plano por componente (convención BEM), sin frameworks de CSS |
| Mapas              | Leaflet.js / React-Leaflet (open source)                      |
| Backend            | Node.js, Express                                              |
| Base de datos      | **Supabase (PostgreSQL)**                                     |
| Autenticación admin| JWT propio (bcrypt + jsonwebtoken), respaldado en tabla `admin_users` de Supabase |
| Catálogo           | Excel (`xlsx`) subido desde el panel admin, guardado en **Supabase Storage** (no en base de datos relacional, ni en disco local) |
| CAPTCHA            | hCaptcha (formulario de contacto)                             |
| Correo saliente    | API de Resend, no SMTP (los hosts gratuitos como Render bloquean los puertos SMTP tradicionales) |
| Subida de archivos | Multer, en memoria (el Excel del catálogo se sube directo a Supabase Storage, nunca toca el disco del servidor) |

> El catálogo de productos se guarda como un archivo Excel (no como filas en
> una tabla SQL): el equipo de Servicios HK lo actualiza directamente y lo
> sube desde el panel de administración, sin depender de un desarrollador.
> Se almacena en Supabase Storage en vez de en la base de datos relacional o
> en disco local — ver [Catálogo de productos (Excel)](#catálogo-de-productos-excel)
> para el detalle de por qué, y [Próximos pasos sugeridos](#próximos-pasos-sugeridos)
> si en el futuro se quiere pasar a una tabla `products` en su lugar.

---

## Instalación

### Requisitos previos
- Node.js >= 18.x
- npm >= 9.x
- Una cuenta gratuita en [supabase.com](https://supabase.com)

### 1. Instalar dependencias
```bash
npm run install-all
```

### 2. Crear el proyecto en Supabase
Ver la sección [Configuración de Supabase](#configuración-de-supabase) antes de continuar.

### 3. Configurar variables de entorno

Copia cada archivo de ejemplo y completa los valores:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env` necesita, como mínimo:
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
JWT_SECRET=una_clave_secreta_larga_y_aleatoria
ADMIN_EMAIL=admin@servicioshk.cl
ADMIN_PASSWORD=una_contraseña_segura
HCAPTCHA_SECRET=tu_hcaptcha_secret_key
```

Revisa `server/.env.example` y `client/.env.example` para ver la lista completa
de variables con su descripción.

### 4. Generar un catálogo de ejemplo (opcional)
```bash
npm run seed:catalog
```
Esto sube un catálogo de ejemplo con 14 productos directo a Supabase Storage, útil para
probar el sitio sin depender del Excel real.

### 5. Crear la cuenta de administrador
```bash
npm run seed
```
Usa `ADMIN_EMAIL` y `ADMIN_PASSWORD` definidos en `server/.env`.

### 6. Ejecutar en desarrollo
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Configuración de Supabase

1. Crea un proyecto nuevo en [app.supabase.com](https://app.supabase.com).
2. Ve a **Project Settings > API** y copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (no la `anon` key) → `SUPABASE_SERVICE_ROLE_KEY`.
     Esta clave es secreta: solo se usa en el backend y nunca debe llegar al frontend.
3. Ve a **SQL Editor > New query**, pega el contenido completo de
   `server/supabase/schema.sql` y ejecútalo. Esto crea las tres tablas que usa
   la aplicación (`admin_users`, `quotes`, `contact_messages`), sus índices y
   los triggers que generan el número de cotización automáticamente
   (ej. `HK-2026-0001`).
4. Verifica en **Table Editor** que las tres tablas se hayan creado.

El script es idempotente: puede ejecutarse más de una vez sin duplicar datos.

---

## Modelo de datos

### `admin_users`
Cuentas del panel de administración (no se usa para clientes finales).

| Columna         | Tipo        | Notas                          |
|-----------------|-------------|---------------------------------|
| id              | uuid (PK)   | Generado automáticamente        |
| nombre          | text        |                                  |
| email           | text        | Único                           |
| password_hash   | text        | Hash bcrypt, nunca texto plano  |
| role            | text        | Solo `admin` por ahora          |
| created_at / updated_at | timestamptz | |

### `quotes`
Cada fila es una cotización enviada desde `/cotizacion`.

| Columna            | Tipo   | Notas |
|--------------------|--------|-------|
| id                 | uuid (PK) | |
| numero_cotizacion  | text   | Generado por trigger, ej. `HK-2026-0001` |
| rut_empresa, razon_social, nombre_contacto, telefono_contacto, direccion, email, region, provincia, comuna, instrucciones | text | Datos del formulario |
| productos          | jsonb  | Arreglo de productos cotizados (vienen del catálogo Excel, no de una tabla) |
| estado             | text   | `pendiente` / `revisada` / `enviada` / `rechazada` |
| created_at / updated_at | timestamptz | |

### `contact_messages`
Mensajes del formulario de contacto (`/contacto`).

| Columna    | Tipo    | Notas |
|------------|---------|-------|
| id         | uuid (PK) | |
| nombre, email, telefono, asunto, mensaje | text | |
| leido      | boolean | Marcado desde el panel admin |
| created_at | timestamptz | |

Row Level Security (RLS) está habilitado en las tres tablas. El backend accede
con la `service_role key`, que ignora RLS por diseño de Supabase; no se
definieron políticas para el rol `anon` porque todo el acceso a datos pasa por
la API de Express.

---

## Catálogo de productos (Excel)

El catálogo se sube como archivo Excel desde el panel de administración
(**Catálogo > Subir Excel**) y se guarda en un **bucket privado de Supabase
Storage** llamado `catalogo` — no en el disco del servidor. Esto es
intencional: la mayoría de los hosts gratuitos (Render, Railway, etc.)
tienen disco efímero, que se borra en cada reinicio o redeploy; guardarlo en
Supabase Storage hace que el catálogo persista sin importar dónde ni cuántas
veces se reinicie el backend.

El bucket `catalogo` se crea automáticamente la primera vez que arranca el
servidor (ver `ensureBucketExists()` en `src/utils/catalogStorage.js`) — no
hay que crearlo a mano desde el dashboard de Supabase.

El backend guarda en memoria una copia ya procesada del catálogo (para no
tener que descargarlo de Supabase Storage en cada visita al sitio) y la
actualiza automáticamente cada vez que se sube un Excel nuevo desde el panel.

**Columnas, en este orden:**

| # | Columna     | Descripción                                             |
|---|-------------|-----------------------------------------------------------|
| 1 | Nombre      | Nombre del producto                                       |
| 2 | Marca       | Nombre de la marca                                         |
| 3 | Descripción | Descripción breve                                          |
| 4 | Categoría   | EPP / Aseo / Industrial                                    |
| 5 | Código      | Código único del producto (se usa como identificador interno) |
| 6 | Imagen      | URL completa de la imagen, o nombre de archivo subido a `server/uploads/` |

**Sobre las imágenes:** el frontend nunca carga la URL de la columna
`Imagen` directamente — siempre pide la imagen a través de
`GET /api/products/:id/image` (ver `getProductImage` en
`products.controller.js`). Si la imagen es una URL externa, el backend la
descarga y la sirve él mismo (con una caché en memoria de 1 hora), así que
al hacer clic derecho > "Abrir imagen en otra pestaña" el navegador solo
muestra la URL de tu propia API, nunca el origen real de la imagen. Si es
un archivo local en `server/uploads/`, simplemente redirige ahí.

La lectura de encabezados no distingue mayúsculas/minúsculas ni tildes
("Código", "codigo" y "CÓDIGO" son equivalentes) y no depende del orden
físico de las columnas en el Excel — se identifican por el nombre del
encabezado. El orden de la tabla de arriba es el recomendado para mantener
consistencia entre archivos.

Las filas sin `Nombre` se ignoran (permite dejar filas en blanco al final
del archivo). Un producto sin `Código` sigue funcionando, pero se recomienda
que todos lo tengan: es el identificador que se muestra en la tarjeta del
catálogo, en el carro de cotización y en el detalle de cada cotización en el
panel de administración.

---

## Referencia de la API

Base URL: `http://localhost:5000/api` (desarrollo).

| Método | Ruta                        | Auth  | Descripción |
|--------|------------------------------|-------|-------------|
| POST   | `/auth/login`                | No    | Login admin, retorna JWT |
| GET    | `/auth/me`                   | Sí    | Datos del admin autenticado |
| PUT    | `/auth/change-password`      | Sí    | Cambiar contraseña |
| GET    | `/products`                  | No    | Lista productos del catálogo (filtros: `categoria`, `marca`, `search` — busca en nombre, marca, categoría, código y descripción, sin distinguir tildes) |
| GET    | `/products/:id`               | No    | Detalle de un producto |
| GET    | `/products/:id/image`         | No    | Sirve la imagen del producto a través del backend (oculta la URL de origen real si es externa) |
| POST   | `/quotes`                     | No    | Crear una cotización |
| GET    | `/quotes`                     | Sí    | Listar cotizaciones (filtros: `estado`, `page`, `limit`) |
| GET    | `/quotes/:id`                  | Sí    | Detalle de una cotización |
| PUT    | `/quotes/:id/estado`           | Sí    | Cambiar estado de una cotización |
| POST   | `/contact`                    | No    | Enviar mensaje de contacto (requiere `captchaToken`) |
| GET    | `/contact`                    | Sí    | Listar mensajes de contacto |
| PUT    | `/contact/:id/leido`           | Sí    | Marcar mensaje como leído |
| GET    | `/admin/stats`                | Sí    | Estadísticas del panel |
| GET    | `/admin/products-preview`     | Sí    | Vista previa del catálogo cargado |
| POST   | `/admin/upload-catalog`       | Sí    | Subir/reemplazar `catalogo.xlsx` |
| GET    | `/health`                     | No    | Estado del servidor |

Las rutas marcadas con **Auth: Sí** requieren el header
`Authorization: Bearer <token>` obtenido en `/auth/login`.

---

## Panel de administración

Acceso: `/admin/login`

Funcionalidades:
- Subir y reemplazar el archivo Excel del catálogo
- Ver productos cargados desde Excel
- Ver y filtrar cotizaciones recibidas, cambiar su estado
- Ver y marcar como leídos los mensajes del formulario de contacto
- Cambiar la contraseña de la cuenta admin

---

## Páginas del sitio

| Ruta          | Página                 |
|---------------|------------------------|
| `/`           | Inicio                 |
| `/catalogo`   | Catálogo de productos  |
| `/cotizacion` | Carro de cotización    |
| `/contacto`   | Formulario de contacto |
| `/admin`      | Panel de administración |

---

## Identidad visual

| Color         | Hex       |
|---------------|-----------|
| Naranja       | `#E8630A` |
| Blanco        | `#FFFFFF` |
| Gris oscuro   | `#1C1C1E` |
| Gris medio    | `#3A3A3C` |
| Gris claro    | `#F5F5F5` |

---

## Seguridad

- Las contraseñas de administrador se guardan como hash bcrypt, nunca en texto plano.
- El login y los formularios públicos (cotización, contacto) tienen límite de
  tasa (`rateLimit.middleware.js`) para dificultar fuerza bruta y spam.
- `helmet` añade cabeceras HTTP de seguridad estándar.
- RLS está habilitado en todas las tablas de Supabase (ver [Modelo de datos](#modelo-de-datos)).
- **Nunca subas los archivos `.env` reales a un repositorio ni los compartas
  por chat, email o herramientas de compresión de archivos.** Solo se deben
  versionar los `.env.example`.
- Riesgo conocido y aceptado: la librería `xlsx` (SheetJS) usada para leer el
  catálogo tiene vulnerabilidades sin parche disponible a la fecha. El
  impacto real es bajo porque solo un administrador autenticado puede subir
  un archivo Excel; aun así, conviene revisar
  [la alerta oficial](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6)
  periódicamente por si aparece una versión corregida o se decide migrar a
  una alternativa como `exceljs`.

---

## Deploy en producción

**Frontend y backend por separado (recomendado para hosts gratuitos):**
el frontend (`client/`) es un sitio estático — funciona bien en Vercel o
Netlify. El backend (`server/`) necesita un proceso Node persistente — no
funciona como función serverless de Vercel/Netlify; usa un host como Render
en su lugar. Como el catálogo se guarda en Supabase Storage (no en disco
local), el proyecto no depende de que el disco del servidor sea persistente
— es seguro desplegarlo en hosts con disco efímero.

**Alternativa: todo en un mismo servidor (VPS)**
1. `npm run build` → genera `client/build`
2. Configurar Express (`server/src/app.js`) para servir los archivos estáticos del build
3. Usar PM2 para mantener el servidor activo:
   ```bash
   npm install -g pm2
   pm2 start server/src/server.js --name "servicios-hk"
   pm2 save
   ```
4. Configurar Nginx como proxy inverso (recomendado)
5. Definir las variables de entorno de producción directamente en el
   servidor o en el panel del proveedor de hosting — nunca en un archivo
   subido junto al código.

---

## Próximos pasos sugeridos

Ideas para continuar mejorando el proyecto, sin que sean bloqueantes:

- **Pasar el catálogo a una tabla `products` en Supabase** (en vez de un
  archivo Excel en Storage) si en el futuro se necesita edición fila por
  fila desde el panel, en lugar de reemplazar el archivo completo cada vez.
- **Adoptar Supabase Auth nativo** para el login de administradores en lugar
  del JWT propio, aprovechando políticas RLS por usuario.
- **Imágenes de productos en Supabase Storage** en lugar de rutas locales.
- **Tests automatizados** (actualmente el proyecto no tiene suite de tests).

---

## Soporte
Desarrollado para Servicios HK — La Calera, V Región, Chile.
