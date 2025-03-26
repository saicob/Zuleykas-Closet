import { Router } from "express";
import { getProducts } from "../controllers/products.controllers.js";

const router = Router();

router.get('/productos', getProducts)

router.get('/productos/:id', (req, res) => {
    res.send('GET un solo producto');
})

router.post('/productos', (req, res) => {
  res.send('POST productos');
})

router.put('/productos/:id', (req, res) => {    
  res.send('PUT productos');
})

router.delete('/productos/:id', (req, res) => {
  res.send('DELETE productos');
})

export default router; 