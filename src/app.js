import express from "express"
import cors from "cors"
import proveedorRoutes from "./routes/proveedor.routes.js"
import marcaRoutes from "./routes/marcas.routes.js"
import productsRoutes from "./routes/products.routes.js"
import empleadoRoutes from "./routes/empleados.routes.js"
import ventasRoutes from "./routes/ventas.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"
import facturaRoutes from "./routes/factura.routes.js"
import backupRoutes from "./routes/backup.routes.js"
// user/auth system fully removed
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware para procesar JSON y permitir CORS
app.use(cors())
app.use(express.json())

// Servir archivos estáticos desde "static" y "templates"
app.use(express.static(path.join(__dirname, "../static")))
app.use(express.static(path.join(__dirname, "../templates")))

// 🔥 Servir carpeta de imágenes estáticas desde /imagenes
app.use("/imagenes", express.static(path.join(__dirname, "../static/imagenes")))

// Rutas API
app.use("/api/proveedor", proveedorRoutes)
app.use("/api/marcas", marcaRoutes)
app.use("/api", productsRoutes)
app.use("/api", empleadoRoutes)
app.use("/api", ventasRoutes)
app.use("/api/ventas", ventasRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/factura", facturaRoutes)
app.use("/api/backup", backupRoutes)
// users routes fully removed

export default app