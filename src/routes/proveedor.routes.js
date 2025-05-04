import { Router } from 'express';
import { 
    getProveedoresJSON,
    getProveedorByName,
    createProveedor,
    updateProveedor,
    deleteProveedor,
} from '../controllers/proveedor.controllers.js';

const router = Router();

// Obtener todas las marcas
router.get('/', getProveedoresJSON);

// Obtener una marca por nombre
router.get('/:nombre', getProveedorByName);

// Crear una nueva marca
router.post('/', createProveedor);

// Actualizar una marca por código
router.put('/:codigo_marca', updateProveedor);

// Eliminar una marca por código
router.delete('/:codigo_marca', deleteProveedor);

export default router;