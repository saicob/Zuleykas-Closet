import { Router } from "express";
import * as m from "../controllers/marca.controllers.js";

const router = Router();

/*get para obtener
post para ingresar
put para actualizar  
delete para eleminiar*/

//obtiene todos los productos
router.get('/marcas', m.getMarcas)

export default router;