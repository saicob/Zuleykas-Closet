import { Router } from "express";
import * as em from "../controllers/empleado.controllers.js";

const router = Router();
router.get('/empleado', em.getEmpleados)


export default router