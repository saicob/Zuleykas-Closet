import { Router } from 'express';
import { crearVenta, getVentas } from '../controllers/ventas.controllers.js';

const router = Router();

// Crear una nueva venta
router.post('/', crearVenta);

// Obtener el historial de ventas
router.get('/', getVentas);

export default router;
