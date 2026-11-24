import { Router } from 'express';
import { 
    getProveedoresJSON,
    getProveedorByName,
    createProveedor,
    updateProveedor,
    deleteProveedor,
} from '../controllers/proveedor.controllers.js';
// authentication removed - routes are public

const router = Router();

// Obtener todas las marcas (permitir lectura a cajero y admin)
router.get('/', getProveedoresJSON);

// Obtener una marca por nombre
router.get('/:nombre', getProveedorByName);

// Crear una nueva marca (admin)
router.post('/', createProveedor);

// Actualizar un proveedor por código (admin)
router.put('/:codigo_proveedor', updateProveedor);

// Eliminar una marca por código (admin)
router.delete('/:codigo_marca', deleteProveedor);

export default router;