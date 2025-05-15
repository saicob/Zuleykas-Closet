import express from 'express';
import cors from 'cors';
import ventasRoutes from './routes/ventas.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/ventas', ventasRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});