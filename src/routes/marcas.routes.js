import { Router } from 'express';
import {
  getMarcasJSON,
  getMarcaByName,
  createMarca,
  updateMarca,
  deleteMarca
} from '../controllers/marca.controllers.js';
// authentication removed - routes are public

const router = Router();

// Obtener todas las marcas (admin + cajero)
router.get('/', getMarcasJSON);

// Obtener una marca por nombre
router.get('/:nombre', getMarcaByName);

// Crear una nueva marca (admin)
router.post('/', createMarca);

// Actualizar una marca por código (admin)
router.put('/:codigo_marca', updateMarca);

// Eliminar una marca por código (admin)
router.delete('/:codigo_marca', deleteMarca);

export default router;
