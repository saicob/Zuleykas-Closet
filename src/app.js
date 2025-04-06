import express from 'express'; 
import cors from 'cors';
import proveedorRoutes from './routes/proveedor.routes.js';
import marcaRoutes from './routes/marcas.routes.js';
import productsRoutes from './routes/products.routes.js';

const app = express();

// Middleware para procesar JSON
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta "static"
app.use(express.static('static'));

// Servir archivos HTML desde la carpeta "templates"
app.use(express.static('templates'));

app.use(proveedorRoutes);
app.use( marcaRoutes);

app.use(productsRoutes);

export default app;