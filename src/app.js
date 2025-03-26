import express from 'express'; 
import productsRoutes from './routes/products.routes.js';

const app = express();
app.use(productsRoutes)

export default app;