import express from 'express'; 
import productsRoutes from './routes/products.routes.js';

const app = express();

// Middleware para procesar JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta "static"
app.use(express.static('static'));

// Servir archivos HTML desde la carpeta "templates"
app.use(express.static('templates'));

app.use(productsRoutes);

export default app;