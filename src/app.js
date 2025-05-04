import express from 'express';
import cors from 'cors';
import proveedorRoutes from './routes/proveedor.routes.js';
import marcaRoutes from './routes/marcas.routes.js';
import productsRoutes from './routes/products.routes.js';
import ventaRoutes from './routes/factura.routes.js';
import empleadoRoutes from './routes/empleados.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware para procesar JSON
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta "static"
app.use(express.static(path.join(__dirname, '../static')));
// Servir archivos HTML desde la carpeta "templates"
app.use(express.static(path.join(__dirname, '../templates')));

app.use(proveedorRoutes);
app.use('/api/marcas', marcaRoutes);

app.use(productsRoutes);
//app.use(ventaRoutes);
app.use('/api', empleadoRoutes);
app.use('/api', ventasRoutes);

export default app;