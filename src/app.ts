import os from "os";
import dotenv from "dotenv";
import Koa from "koa";
import { metricsMiddleware } from "./api/middleware/metrics";
import bodyParser from "koa-bodyparser";
import { errorHandler } from "./api/middleware/error-handler";
import { loggerMiddleware } from "./api/middleware/logger";
import { captchaMiddleware } from "./api/middleware/captcha";
import { setRoutes } from "./api/routes";
import { setInfraRoutes } from "./api/routes/infra.routes";
import { Environment } from "./infraestructure/config/environment.config";

dotenv.config();

const app = new Koa();
app.proxy = true; // respeta X-Forwarded-For detrás de proxy/CDN

// Orden importa: bodyParser -> errorHandler -> logger -> metrics -> captcha -> rutas
app.use(bodyParser());
app.use(errorHandler);
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