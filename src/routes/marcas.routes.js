import { Router } from 'express';
import {
  getMarcasJSON,
  getMarcaByName,
  createMarca,
  updateMarca,
  deleteMarca
} from '../controllers/marca.controllers.js';

const router = Router();

// Obtener todas las marcas
router.get('/', getMarcasJSON);

// Obtener una marca por nombre
router.get('/:nombre', getMarcaByName);

// Crear una nueva marca
router.post('/', createMarca);

// Actualizar una marca por código
router.put('/:codigo_marca', updateMarca);

// Eliminar una marca por código
router.delete('/:codigo_marca', deleteMarca);

export default router;
