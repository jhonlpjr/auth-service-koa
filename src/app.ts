import dotenv from "dotenv";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { setRoutes } from "./routes/index";
import { requestId } from "./middleware/request-id";
import { errorHandler } from "./middleware/error-handler";
import { securityHeaders, simpleCors } from "./middleware/security";
import { httpLogger } from "./middleware/http-logger"; // ver paso 6

dotenv.config();

const app = new Koa();
app.proxy = true; // respeta X-Forwarded-For detrás de proxy/CDN

// Orden importa: ID -> errores -> logs -> headers/cors -> body -> rutas
app.use(requestId);
app.use(errorHandler);
app.use(httpLogger);
app.use(securityHeaders());
app.use(simpleCors());
app.use(bodyParser({ enableTypes: ["json"], jsonLimit: "128kb" }));

setRoutes(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
