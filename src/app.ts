import { simpleCors } from "./api/middleware/security";
import serve from 'koa-static';
// Serve static docs and OpenAPI spec

import os from "os";
import dotenv from "dotenv";
import Koa from "koa";
import { metricsMiddleware } from "./api/middleware/metrics";
import bodyParser from "koa-bodyparser";
import { errorHandler } from "./api/middleware/error-handler";
import { loggerMiddleware } from "./api/middleware/logger";
import { responseStatus } from "./api/middleware/response-status";
import { captchaMiddleware } from "./api/middleware/captcha";
import { setRoutes } from "./api/routes";
import { setInfraRoutes } from "./api/routes/infra.routes";
import { Environment } from "./infrastructure/config/environment.config";

dotenv.config();

const app = new Koa();
app.proxy = true; // respeta X-Forwarded-For detrás de proxy/CDN

// Orden importa: bodyParser -> errorHandler -> logger -> metrics -> cors -> captcha -> rutas
app.use(serve('public'));
app.use(bodyParser());
app.use(errorHandler);
// Permitir CORS para orígenes definidos en variables de entorno separadas (sin default por seguridad)
const localOrigins = (process.env.CORS_ALLOW_ORIGINS_LOCAL || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);
const devOrigins = (process.env.CORS_ALLOW_ORIGINS_DEV || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);
const corsAllowOrigins = [...localOrigins, ...devOrigins];
app.use(simpleCors(new Set(corsAllowOrigins)));
app.use(responseStatus);
app.use(loggerMiddleware);
app.use(metricsMiddleware);
app.use(captchaMiddleware);


setInfraRoutes(app);

setRoutes(app);

const PORT = process.env.PORT || 3000;
const interfaces = os.networkInterfaces();
const addresses = Object.values(interfaces)
  .flat()
  .filter((iface): iface is os.NetworkInterfaceInfo => typeof iface !== 'undefined' && iface.family === "IPv4" && !iface.internal)
  .map((iface) => iface.address);

const host = addresses[0] || "localhost";
app.listen(PORT, () => {
  console.log(`Server is running on http://${host}:${PORT}`);
});

Environment.validateAll();