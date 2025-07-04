import { Router } from "express";
import * as pc from "../controllers/products.controllers.js";
import { getProductsJSON } from '../controllers/products.controllers.js';

const router = Router();

/*get para obtener
post para ingresar
put para actualizar  
delete para eleminiar*/

//obtiene todos los productos
router.get('/productos', pc.getProducts)

//obtiene el producto por el nombre
router.get('/productos/:nombre',pc.getProductByName)

router.post('/productos', pc.createProduct)

router.put('/productos/:id', (req, res) => {    
  res.send('PUT productos');
})

router.delete('/productos/:id', (req, res) => {
  res.send('DELETE productos');
})

// Ruta para obtener productos en formato JSON
router.get('/api/productos', getProductsJSON);

export default router;