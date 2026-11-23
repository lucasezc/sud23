# Configuración local

El backend y el frontend se ejecutan en terminales separadas. No hay un `package.json` en la raíz.

## Backend

1. Instala MongoDB localmente o prepara una URL de MongoDB.
2. Copia `server/.env.example` a `server/.env` si todavía no existe.
3. Configura `DATABASE_URL` y genera `JWT_SECRET` con `openssl rand -hex 32`.
4. Para que lleguen correos, habilita la verificación en dos pasos de tu cuenta Google y crea una contraseña de aplicación. En `server/.env`, configura `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER` con tu dirección Gmail y `SMTP_PASS` con la contraseña de aplicación. Usa esa dirección también como `SMTP_FROM`. **No uses la contraseña normal de Gmail ni compartas la contraseña de aplicación.**
5. Para crear o habilitar el administrador inicial, configura `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` con tus propios datos y una contraseña fuerte. El backend crea el usuario o promueve esa cuenta a administrador al iniciar; no hay credenciales administrativas predeterminadas.
6. Para aceptar pagos, configura `MERCADOPAGO_ACCESS_TOKEN` con el Access Token de prueba (`TEST-...`) o producción de tu cuenta de Mercado Pago. El token solo se usa en el backend. Los precios del carrito se vuelven a consultar desde MongoDB antes de crear la preferencia.
7. Para envíos de Mercado Envíos, configura opcionalmente `MERCADOPAGO_SHIPPING_COST` (por defecto `5000`) y `MERCADOPAGO_FREE_SHIPPING_THRESHOLD` (por defecto `100000`; usa `0` para desactivar el envío gratis). Configura `PUBLIC_URL` con la URL pública del backend para recibir el webhook y `MERCADOPAGO_WEBHOOK_SECRET` si tu cuenta lo requiere.
7. Desde `server/`, ejecuta `npm install` una vez y luego `npm run dev`.

Los precios se guardan como números en pesos argentinos (por ejemplo, `50000`). El panel acepta `50.000` y lo guarda como `50000`. Si un precio anterior ya quedó guardado como `50`, edítalo en el panel y vuelve a ingresarlo como `50.000`; no se multiplican automáticamente los datos existentes para evitar alterar precios correctos.

El registro y la recuperación requieren SMTP configurado. Si Gmail rechaza la conexión, el servidor devuelve un error y lo registra sin mostrar la contraseña. Si el envío del registro falla después de crear la cuenta pendiente, vuelve a login y usa **Reenviar correo de verificación** después de corregir SMTP. Una respuesta exitosa significa que SMTP aceptó el mensaje, no garantiza que Gmail lo deje en la bandeja principal: revisa también **Spam/Correo no deseado**.

## Frontend

1. Copia `client/front/.env.example` a `client/front/.env`.
2. Desde `client/front/`, ejecuta `npm install` una vez y luego `npm run dev`.

El inicio con Google es opcional. Para activarlo, crea un OAuth Client ID de tipo **aplicación web** en Google Cloud, agrega `http://localhost:5173` como origen JavaScript autorizado y coloca **el mismo Client ID** en `GOOGLE_CLIENT_ID` (`server/.env`) y `VITE_GOOGLE_CLIENT_ID` (`client/front/.env`). Reinicia ambos servidores después de cambiar las variables. El Client ID no reemplaza la contraseña de aplicación de SMTP: son configuraciones distintas.

No uses valores de ejemplo en producción ni subas archivos `.env` al repositorio.
