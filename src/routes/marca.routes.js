import { Router } from 'express';
import { updateMarca } from '../controllers/marca.controllers.js';

const router = Router();

// Actualizar una marca por código
router.put('/:codigo_marca', updateMarca);

export default router;
