import { Router } from 'express';
import { crearVenta, getVentas, getDetalleVenta } from '../controllers/ventas.controllers.js';

const router = Router();

// Crear una nueva venta
router.post('/', crearVenta);

// Obtener el historial de ventas
router.get('/', getVentas);

//Obtener detalles de una venta 
router.get('/:id', getDetalleVenta);
// No hay referencias a Local1, solo rutas de ventas
export default router;
