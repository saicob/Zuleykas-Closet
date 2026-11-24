
import { Router } from 'express';
import { crearVenta, getVentas } from '../controllers/ventas.controllers.js';
// authentication removed - routes are public

const router = Router();

// Crear una nueva venta (admin or cajero)
router.post('/', crearVenta);

// Obtener el historial de ventas (admin or cajero)
router.get('/', getVentas);

//Obtener detalles de una venta 
//router.get('/:id', getDetalleVenta);
// No hay referencias a Local1, solo rutas de ventas
export default router;
