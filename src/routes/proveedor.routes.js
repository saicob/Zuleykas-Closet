import { Router } from 'express';
import * as pv from '../controllers/proveedor.controllers.js';

const router = Router();

router.get('/proveedor', pv.getProveedor)

export default router;